from fastapi import FastAPI
from pydantic import BaseModel
from voximplant.apiclient import VoximplantAPI, VoximplantException
import os
import cv2
import face_recognition
from PIL import Image
import requests
import shutil
import numpy as np
from efficient_vit1 import EfficientViT
from progress.bar import Bar
from statistics import mean
import time
import datetime
import json
import firebase_admin
from firebase_admin import credentials
# from firebase_admin import storage
from google.cloud import storage
from google.cloud import firestore
import mediapipe as mp
from tempfile import NamedTemporaryFile
from io import BytesIO
import torch
from fastapi.middleware.cors import CORSMiddleware
# Tạo đối tượng firebase

cred = credentials.Certificate("E:\AI-PBL\PBL\ViT\\videocalldb.json")
firebase_admin.initialize_app(cred, {
    'storageBucket': 'videocalldb.appspot.com'
})
bucket_name = 'videocalldb.appspot.com'

out_path = "E:\\AI-PBL\\PBL\\ViT\\dataset\\data"
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = "E:\AI-PBL\PBL\ViT\\videocalldb.json"
db = firestore.Client()
client = storage.Client()

# Tạo đối tượng FastAPI


class User(BaseModel):
    userName: str
    userDisplayName: str
    userPassword: str


class DeepFake(BaseModel):
    type: str
    urlUpload: str


class Folder(BaseModel):
    path: str
    folder: list = []


resize_x = 224
resize_y = 224

# Hàm khởi tạo


def upload_image(urlUpload, image_path):
    client = storage.Client()
    bucket = client.get_bucket(bucket_name)
    new_path = urlUpload.rsplit("/", 1)[0]
    destination_path = new_path + '/' + \
        os.path.basename(image_path).split("/")[-1]

    blob = bucket.blob(destination_path)
    blob.upload_from_filename(image_path)

    print(urlUpload, image_path)


def download_data_from_url(download_url, file_path, file_name, type):
    response = requests.get(download_url, stream=True)
    response.raise_for_status()

    # Tạo đường dẫn lưu trữ tự động
    if(type == "img"):
        save_path = os.path.join(file_path, file_name+".jpg")
    else:
        save_path = os.path.join(file_path, file_name+".mp4")

    # Tạo thư mục lưu trữ nếu chưa tồn tại
    os.makedirs(file_path, exist_ok=True)

    with open(save_path, 'wb') as file:
        for chunk in response.iter_content(chunk_size=8192):
            file.write(chunk)


app = FastAPI()


def delFolder(path):
    for filename in os.listdir(path):
        file_path = os.path.join(path, filename)
        if os.path.isdir(file_path):
            # Xóa thư mục con
            shutil.rmtree(file_path)
        else:
            # Xóa file
            os.remove(file_path)


def framing(urlUpload, input_path, output_path):
    videos = os.listdir(output_path)
    videos.sort(key=lambda x: x[:-4])

    if len(videos) != 0:
        video_num = 0
        for each_video in videos:
            print('Video {} is running ...'.format(video_num))
            each_video_input = input_path
            # each_video_input = input_path+'/'+str(each_video)
            each_video_output_path = output_path+'/'+str(each_video[:-4])
            if not os.path.exists(each_video_output_path):
                os.mkdir(each_video_output_path)

            capture = cv2.VideoCapture(each_video_input)
            if capture.isOpened():
                real = True
            else:
                real = False

            frame_step = 10
            frame_num = 0
            picture_num = 0

            while real:
                real, frame = capture.read()
                # fix blank img
                if real:
                    if(frame_num % frame_step == 0):
                        cv2.imwrite(each_video_output_path+'/Frame' +
                                    str(frame_num)+'_Pic'+str(picture_num)+'.jpg', frame)
                        if(picture_num < 5):
                            upload_image(urlUpload, each_video_output_path+'/Frame' +
                                         str(frame_num)+'_Pic'+str(picture_num)+'.jpg')
                        picture_num += 1
                    frame_num += 1
    else:
        print('Empty Directory')


def detect_video(urlUpload, original_path, new_path):
    all_file_lists = os.listdir(original_path)
    folder_lists = []

    # find folders in allfilelists
    for all_file_list in all_file_lists:
        (filename, extension) = os.path.splitext(all_file_list)
        if extension == '':
            folder_lists.append(filename)

    for folder_list in folder_lists:
        temp_original_path = original_path+'/'+folder_list
        temp_new_path = new_path+'/'+folder_list
        if not os.path.exists(temp_new_path):
            os.mkdir(temp_new_path)

        imglists = os.listdir(temp_original_path)
        len_imglists = len(imglists)

        for imglist in imglists:
            img = temp_original_path+'/'+imglist
            (filename_img, extension_img) = os.path.splitext(img)
            if extension_img != '':
                if os.path.getsize(img) != 0:
                    detect(urlUpload, img, temp_new_path, imglist)
                else:
                    len_imglists -= 1


def detect_img(urlUpload, original_path):
    all_file_lists = os.listdir(original_path)
    img_lists = []

    # find folders in allfilelists
    for all_file_list in all_file_lists:
        (filename, extension) = os.path.splitext(all_file_list)
        if extension != '':
            img_lists.append(filename)

    for img_list in img_lists:
        temp_new_path = original_path+'/'+img_list
        if not os.path.exists(temp_new_path):
            os.mkdir(temp_new_path)

        imglists = os.listdir(original_path)
        len_imglists = len(imglists)

        for imglist in imglists:
            img = original_path+'/'+imglist
            (filename_img, extension_img) = os.path.splitext(img)
            if extension_img != '':
                # exclude error img
                if os.path.getsize(img) != 0:
                    detect(urlUpload, img, temp_new_path, imglist)
                else:
                    len_imglists -= 1


def detect(urlUpload, img, new_path, imglist):
    image = face_recognition.load_image_file(img)
    face_locations = face_recognition.face_locations(image)

    # In this case: save the first face found in a pic
    # Get the location of each face in this image
    if len(face_locations) == 0:
        return []
    top, right, bottom, left = face_locations[0]
    face_image = image[top:bottom, left:right]
    pil_image = Image.fromarray(face_image)
    resized_face = pil_image.resize((resize_x, resize_y))
    (filename, extension) = os.path.splitext(imglist)
    resized_face.save(new_path+'/FR_'+filename+extension)
    if "Pic" not in filename:
        upload_image(urlUpload, new_path+'/FR_' +
                     filename+extension)
    else:
        if(int(filename.split("Pic")[-1]) < 5):
            upload_image(urlUpload, new_path+'/FR_' +
                         filename+extension)


def get_data(data_dir, type):
    data = []
    path = os.path.join(data_dir)
    frames_paths_dict = {}
    for img in os.listdir(path):
        try:
            if(type == "img"):
                for i in range(0, len(os.listdir(path))):
                    frames_paths_dict.setdefault(i, []).append(img)
            else:
                for i in range(0, 10):
                    if("_Pic"+str(i) in img):
                        frames_paths_dict.setdefault(i, []).append(img)
        except Exception as e:
            print(e)
    video = {}
    print(frames_paths_dict)
    for key, frame_images in frames_paths_dict.items():
        for frame_image in frame_images:
            img_arr = cv2.imread(os.path.join(path, frame_image))[..., ::-1]
            if len(img_arr) > 0:
                video.setdefault(key, []).append(img_arr)
    data.append((video))
    return data


def custom_video_round(preds):
    # totalReal = 0
    # totalFake = 0
    # for pred_value in preds:
    #     if pred_value > 0.55:
    #         totalFake += 1
    #     else:
    #         totalReal += 1
    # if(totalFake/totalReal > 2):
    #     return 1
    # else:
    return mean(preds)


def custom_round(values):
    result = []
    for value in values:
        if value > 0.55:
            result.append(1)
        else:
            result.append(0)
    return np.asarray(result)


def UploadResult(document_name, data):
    doc_ref = db.collection("Results").document(document_name)
    doc_ref.set(data)


def RunModel(path, type, folder_name):
    dataset = get_data(path, type)
    start_time = time.time()
    modelTest = EfficientViT(channels=1280, selected_efficient_net=0)
    modelTest.load_state_dict(torch.load(
        'E:\AI-PBL\PBL\\data\\EfficientViT_checkpoint_39.pt', map_location=torch.device('cpu')))
    modelTest.eval()
    modelTest = modelTest.cpu()
    bar = Bar('Predicting', max=len(dataset))
    preds = []
    for index, video in enumerate(dataset):
        video_faces_preds = []
        for key in video:
            faces_preds = []
            video_faces = video[key]
            for i in range(0, len(video_faces), 32):
                faces = video_faces[i:i+32]
                faces = torch.tensor(np.asarray(faces))
                if faces.shape[0] == 0:
                    continue
                faces = np.transpose(faces, (0, 3, 1, 2))
                faces = faces.cpu().float()
                # faces = faces.cuda().float()

                pred = modelTest(faces)
                scaled_pred = []
                for idx, p in enumerate(pred):
                    scaled_pred.append(torch.sigmoid(p))
                faces_preds.extend(scaled_pred)

            current_faces_pred = sum(faces_preds)/len(faces_preds)
            face_pred = current_faces_pred.cpu().detach().numpy()[0]
            video_faces_preds.append(face_pred)
        bar.next()
        print(video_faces_preds)
        if len(video_faces_preds) > 0:
            video_pred = custom_video_round(video_faces_preds)
        else:
            video_pred = video_faces_preds[0]
        print(video_pred)
        preds.append(video_pred)
    bar.finish()
    end_time = time.time()
    delta_time = datetime.timedelta(seconds=(end_time-start_time))
    print(preds)
    print('Running time using Face-recognition is: %s ' % (delta_time))
    accuracy = custom_round(np.asarray(preds))
    print(accuracy)
    preds = np.array(preds, dtype=np.float32)
    preds = float(preds[0])
    accuracy = np.array(accuracy, dtype=np.float32)
    accuracy = float(accuracy[0])
    data = {
        'percent': preds,
        'result': accuracy,
    }
    UploadResult(folder_name, data)
    # return preds


origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/signup")
async def process_data(user: User):
    print(user)
    voxapi = VoximplantAPI("./cridentials.json")

    USER_NAME = user.userName
    USER_DISPLAY_NAME = user.userDisplayName
    USER_PASSWORD = user.userPassword
    APPLICATION_ID = "10573632"
    print(USER_NAME, USER_DISPLAY_NAME, USER_PASSWORD)
    try:
        res = voxapi.add_user(USER_NAME,
                              USER_DISPLAY_NAME,
                              USER_PASSWORD,
                              application_id=APPLICATION_ID)
        return res
    except VoximplantException as e:
        return ("Error: {}".format(e.message))


@app.delete("/api/delete")
async def delete_folder(data: Folder):
    for folder in data.folder:
        client = storage.Client()
        bucket = client.get_bucket(bucket_name)

        blobs = bucket.list_blobs(prefix=data.path+"/"+folder)

        for blob in blobs:
            blob.delete()

    return ('Thư mục đã được xóa thành công.')


def refresh_url(blob):
    expiration_time = datetime.timedelta(minutes=15)
    current_time = datetime.datetime.now()
    expiration_datetime = current_time + expiration_time

    # Kiểm tra nếu URL đã hết hạn
    if expiration_datetime > datetime.datetime.utcnow():
        # Tạo URL mới
        new_url = blob.generate_signed_url(
            version="v4",
            expiration=expiration_time,
            method="GET"
        )
        return new_url
    else:
        # URL hiện tại vẫn còn hiệu lực
        return blob.url


@app.post("/api/findface")
async def process_findface(data: DeepFake):
    start_time = time.time()
    bucket = client.get_bucket(bucket_name)

    # Lấy tham chiếu đến tệp tin trong bucket
    blob = bucket.blob(data.urlUpload)
    # Lấy đường dẫn tải xuống (download URL)
    download_url = blob.generate_signed_url(
        version="v4",
        expiration=datetime.timedelta(minutes=15),  # Thời gian hết hạn của URL
        method="GET"
    )
    print(download_url)
    updated_url = refresh_url(blob)
    delFolder(out_path)
    download_data_from_url(updated_url, out_path, data.urlUpload.split(
        "/")[-1].split(".")[0], data.type)
    if(data.type == "video"):
        framing(data.urlUpload, updated_url, out_path)
        detect_video(data.urlUpload, out_path, out_path+"\\" +
                     data.urlUpload.split("/")[-1].split(".")[0])
    else:
        detect_img(data.urlUpload, out_path)
    end_time = time.time()
    delta_time = datetime.timedelta(seconds=(end_time-start_time))
    print(delta_time)


@app.post("/api/deepfake")
async def process_deepfake(data: DeepFake):
    start_time = time.time()
    if(data.type == "video"):
        RunModel(out_path+"\\"+data.urlUpload.split("/")
                          [-1].split(".")[0]+"\\"+data.urlUpload.split("/")
                          [-1].split(".")[0], data.type, data.urlUpload.split("/")
                          [-1].split(".")[0])
    else:
        RunModel(out_path+"\\"+data.urlUpload.split("/")
                          [-1].split(".")[0], data.type, data.urlUpload.split("/")
                          [-1].split(".")[0])
    end_time = time.time()
    delta_time = datetime.timedelta(seconds=(end_time-start_time))
    print(delta_time)

# start_time = time.time()
#     client = storage.Client()
#     bucket = client.get_bucket(bucket_name)

#     # Lấy tham chiếu đến tệp tin trong bucket
#     blob = bucket.blob(data.urlUpload)

#     # Lấy đường dẫn tải xuống (download URL)
#     download_url = blob.generate_signed_url(
#         version="v4",
#         expiration=datetime.timedelta(minutes=15),  # Thời gian hết hạn của URL
#         method="GET"
#     )
#     delFolder(out_path)
#     download_data_from_url(download_url, out_path,
#                            data.urlUpload.split("/")[-1].split(".")[0], data.type)
#     if(data.type == "video"):
#         framing(download_url, out_path)
#         detect_video(out_path, out_path+"\\" +
#                      data.urlUpload.split("/")[-1].split(".")[0])
#         RunModel(out_path+"\\"+data.urlUpload.split("/")
#                           [-1].split(".")[0]+"\\"+data.urlUpload.split("/")
#                           [-1].split(".")[0], data.type)
#     else:
#         detect_img(out_path)
#         RunModel(out_path+"\\"+data.urlUpload.split("/")
#                           [-1].split(".")[0], data.type)
#     end_time = time.time()
#     delta_time = datetime.timedelta(seconds=(end_time-start_time))
#     print(delta_time)
