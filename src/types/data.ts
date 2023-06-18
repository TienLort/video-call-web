export interface IArticle {
  title: boolean;
  cover_image: string;
  tag_list: [x: string];
  url: string;
  comments_count: number;
  positive_reactions_count: number;
  public_reactions_count: number;
  user: {
    github_username: string;
    name: string;
    profile_image: string;
    profile_image_90?: string;
    twitter_username: string;
    user_id: number;
    username: string;
  };
  published_at: string;
}
