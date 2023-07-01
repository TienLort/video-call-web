import torch
from torch import nn
from einops import rearrange
from efficientnet_pytorch import EfficientNet
from torch import einsum
from math import sqrt


class Residual(nn.Module):
    def __init__(self, fn):
        super().__init__()
        self.fn = fn

    def forward(self, x, **kwargs):
        return self.fn(x, **kwargs) + x


class PreNorm(nn.Module):
    def __init__(self, dim, fn):
        super().__init__()
        self.norm = nn.LayerNorm(dim)
        self.fn = fn

    def forward(self, x, **kwargs):
        return self.fn(self.norm(x), **kwargs)


class ExcludeCLS(nn.Module):
    def __init__(self, fn):
        super().__init__()
        self.fn = fn

    def forward(self, x, **kwargs):
        cls_token, x = x[:, :1], x[:, 1:]
        x = self.fn(x, **kwargs)
        return torch.cat((cls_token, x), dim=1)


class PatchDropout(nn.Module):
    def __init__(self, prob):
        super().__init__()
        assert 0 <= prob < 1.
        self.prob = prob

    def forward(self, x):
        if not self.training or self.prob == 0.:
            return x

        b, n, _, device = *x.shape, x.device

        batch_indices = torch.arange(b, device=device)
        batch_indices = rearrange(batch_indices, '... -> ... 1')
        num_patches_keep = max(1, int(n * (1 - self.prob)))
        patch_indices_keep = torch.randn(b, n, device=device).topk(
            num_patches_keep, dim=-1).indices

        return x[batch_indices, patch_indices_keep]


class DepthWiseConv2d(nn.Module):
    def __init__(self, dim_in, dim_out, kernel_size, padding, stride=1, bias=True):
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(dim_in, dim_in, kernel_size=kernel_size,
                      padding=padding, groups=dim_in, stride=stride, bias=bias),
            nn.Conv2d(dim_in, dim_out, kernel_size=1, bias=bias)
        )

    def forward(self, x):
        return self.net(x)


class FeedForward(nn.Module):
    def __init__(self, dim, hidden_dim, dropout=0.):
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(dim, hidden_dim, 1),
            nn.Hardswish(),
            DepthWiseConv2d(hidden_dim, hidden_dim, 3, padding=1),
            nn.Hardswish(),
            nn.Dropout(dropout),
            nn.Conv2d(hidden_dim, dim, 1),
            nn.Dropout(dropout)
        )

    def forward(self, x):
        h = w = int(sqrt(x.shape[-2]))
        x = rearrange(x, 'b (h w) c -> b c h w', h=h, w=w)
        x = self.net(x)
        x = rearrange(x, 'b c h w -> b (h w) c')
        return x


class Attention(nn.Module):
    def __init__(self, dim, heads=8, dim_head=64, dropout=0.):
        super().__init__()
        inner_dim = dim_head * heads
        project_out = not (heads == 1 and dim_head == dim)

        self.heads = heads
        self.scale = dim_head ** -0.5

        self.attend = nn.Softmax(dim=-1)
        self.to_qkv = nn.Linear(dim, inner_dim * 3, bias=False)

        self.to_out = nn.Sequential(
            nn.Linear(inner_dim, dim),
            nn.Dropout(dropout)
        ) if project_out else nn.Identity()

    def forward(self, x):
        b, n, _, h = *x.shape, self.heads
        qkv = self.to_qkv(x).chunk(3, dim=-1)
        q, k, v = map(lambda t: rearrange(t, 'b n (h d) -> b h n d', h=h), qkv)

        dots = einsum('b h i d, b h j d -> b h i j', q, k) * self.scale

        attn = self.attend(dots)

        out = einsum('b h i j, b h j d -> b h i d', attn, v)
        out = rearrange(out, 'b h n d -> b n (h d)')
        return self.to_out(out)


class Transformer(nn.Module):
    def __init__(self, dim, depth, heads, dim_head, mlp_dim, dropout=0.):
        super().__init__()
        self.layers = nn.ModuleList([])
        for _ in range(depth):
            self.layers.append(nn.ModuleList([
                Residual(PreNorm(dim, Attention(dim, heads=heads,
                         dim_head=dim_head, dropout=dropout))),
                ExcludeCLS(
                    Residual(PreNorm(dim, FeedForward(dim, mlp_dim, dropout=dropout))))
            ]))

    def forward(self, x):
        for attn, ff in self.layers:
            x = attn(x)
            x = ff(x)
        return x


class EfficientViT(nn.Module):
    def __init__(self, channels=512, selected_efficient_net=0):
        super().__init__()

        image_size = 224
        patch_size = 7
        num_classes = 1
        dim = 1024
        depth = 6
        heads = 8
        mlp_dim = 1024
        emb_dim = 32
        dim_head = 64
        dropout = 0.25
        emb_dropout = 0.25
        patch_dropout = 0.25
        assert image_size % patch_size == 0, 'image dimensions must be divisible by the patch size'

        self.efficient_net = EfficientNet.from_pretrained(
            'efficientnet-b0')

        for i in range(0, len(self.efficient_net._blocks)):
            for index, param in enumerate(self.efficient_net._blocks[i].parameters()):
                if i >= len(self.efficient_net._blocks)-3:
                    param.requires_grad = True
                else:
                    param.requires_grad = False

        num_patches = (7 // patch_size) ** 2
        patch_dim = channels * patch_size ** 2

        self.patch_size = patch_size

        self.pos_embedding = nn.Parameter(torch.randn(emb_dim, 1, dim))
        self.patch_to_embedding = nn.Linear(patch_dim, dim)
        self.cls_token = nn.Parameter(torch.randn(1, 1, dim))
        # Them moi
        self.patch_dropout = PatchDropout(patch_dropout)
        self.dropout = nn.Dropout(emb_dropout)
        self.transformer = Transformer(
            dim, depth, heads, dim_head, mlp_dim, dropout)

        self.to_cls_token = nn.Identity()

        self.mlp_head = nn.Sequential(
            nn.Linear(dim, mlp_dim),
            nn.ReLU(),
            nn.Linear(mlp_dim, num_classes)
        )

    def forward(self, img, mask=None):
        p = self.patch_size
        x = self.efficient_net.extract_features(img)  # 1280x7x7
        y = rearrange(x, 'b c (h p1) (w p2) -> b (h w) (p1 p2 c)', p1=p, p2=p)
        y = self.patch_to_embedding(y)
        x = self.patch_dropout(y)
        cls_tokens = self.cls_token.expand(x.shape[0], -1, -1)
        x = torch.cat((cls_tokens, x), 1)
        shape = x.shape[0]
        x += self.pos_embedding[0:shape]
        x = self.dropout(x)
        x = self.transformer(x)
        x = self.to_cls_token(x[:, 0])

        return self.mlp_head(x)
