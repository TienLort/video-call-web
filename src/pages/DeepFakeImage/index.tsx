import React, { useState, useRef, ChangeEvent, useContext, useEffect } from "react";
import "./deepfake.css"
import photo from "src/assets/images/photo.png";
import { getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
import { storage } from "src/firebase/config";
import { AuthContext } from "src/Context/AuthProvider";
import img1 from "src/assets/images/detect-face1.png"
import img2 from "src/assets/images/detect-face4.png"
import img3 from "src/assets/images/Cristiano_Ronaldo.png"
import img4 from "src/assets/images/Angelina_Jolie.png"
import img5 from "src/assets/images/Tom_Cruise.png"
import img6 from "src/assets/images/Gal_gadot.png"
import img7 from "src/assets/images/middleline.svg"
import { Image as AntdImage, message } from 'antd';
import { db } from "../../firebase/config";
import {
    collection,
    query,
    where,
    updateDoc,
    limit,
    getDocs,
    doc,
    getDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { result } from "lodash";

const DeepFakeImage = () => {
    const [image, setImage] = useState<File | null>(null);
    const hiddenFileInput = useRef<HTMLInputElement>(null);
    const auContext = useContext(AuthContext)
    const displayName = auContext?.user.displayName
    const imageArray = [img1, img2, img3, img4, img5, img6];
    const [imgVid, setImgVid] = useState<string[]>([]);
    const API_URL = "http://127.0.0.1:8000"
    const [dataResult, setDataResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate()
    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files && event.target.files[0];

        if (!file) {
            // Người dùng không chọn ảnh
            alert("Vui lòng chọn một ảnh");
            return;
        }
        if (file) {
            const imgname = file.name;
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                const img = new Image();
                img.src = reader.result as string;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const maxSize = Math.max(img.width, img.height);
                    canvas.width = maxSize;
                    canvas.height = maxSize;
                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                        ctx.drawImage(
                            img,
                            (maxSize - img.width) / 2,
                            (maxSize - img.height) / 2
                        );
                        canvas.toBlob(
                            (blob) => {
                                if (blob) {
                                    const file = new File([blob], imgname, {
                                        type: "image/png",
                                        lastModified: Date.now(),
                                    });
                                    setImage(file);
                                }
                            },
                            "image/jpeg",
                            0.8
                        );
                    }
                };
            };
        }
    };

    const getImagesFromFirebase = async (url: string) => {
        const storageRef = ref(storage, url);
        console.log(url)
        const listResult = await listAll(storageRef);
        console.log(listResult)

        const downloadURLs = [];

        for (const itemRef of listResult.items) {
            const imageURL = await getDownloadURL(itemRef);
            downloadURLs.push(imageURL);
            console.log("dang o trong itemref")

        }
        console.log("Bat dau lay anh")
        setImgVid(downloadURLs)
    }
    const handleUploadButtonClick = async (file: File | null) => {
        if (!file) {
            // Người dùng không chọn ảnh
            message.info("Vui lòng chọn một ảnh");
            return;
        }
        if (file) {
            setIsLoading(true);
            setImgVid([])
            setDataResult(null)
            const storageRef = ref(storage, `${displayName}/deepfake/ImageUpload/Image_${file.name.split(".")[0]}/Image_${file.name.split(".")[0]}`);
            await uploadBytes(storageRef, file).then((snapshot) => {
                console.log('Uploaded a blob or file!');
            });
            const payload = {
                urlUpload: `${displayName}/deepfake/ImageUpload/Image_${file.name.split(".")[0]}/Image_${file.name.split(".")[0]}`,
                type: "img"
            }
            console.log(payload)
            const findFaceResponse = await fetch(`${API_URL}/api/findface`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })

            if (findFaceResponse.ok) {
                console.log(`${displayName}/deepfake/ImageUpload/Image_${file.name.split(".")[0]}`)
                getImagesFromFirebase(`${displayName}/deepfake/ImageUpload/Image_${file.name.split(".")[0]}`)
                const deepFakeResponse = await fetch(`${API_URL}/api/deepfake`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const userRef = doc(db, "Results", `Image_${file.name.split(".")[0]}`);
                const docSnap = await getDoc(userRef);
                if (docSnap.exists()) {
                    setDataResult(docSnap.data());
                } else {
                    // docSnap.data() will be undefined in this case
                    console.log("No such document!");
                }
                setIsLoading(false)
            } else {
                // Xử lý khi gọi findface API không thành công
                console.error('Call to findface API failed.');
                setIsLoading(false)
            }
            setIsLoading(false)
        }
        setIsLoading(false)
    };
    const handleClick = () => {
        if (hiddenFileInput.current) {
            hiddenFileInput.current.click();
        }
    };
    console.log(imgVid, dataResult)
    return (
        <div style={{ height: '100%', overflowY: "auto", padding: "0 20px" }}>
            {isLoading && (
                <div className="overlay">
                    <div className="loader"></div>
                </div>
            )}
            <div>
                <h3>Image DeepFake Detection</h3>
                <p>Nhận diện khuôn mặt cho phép bạn tìm khuôn mặt trong một hình ảnh. Thông qua nhận diện hình ảnh, chúng tôi sẽ đánh giá khuôn mặt đã qua chỉnh sửa</p>
            </div>
            <div style={{ display: "flex", width: "100%" }}>
                <div style={{ display: "flex", width: "60%", flexDirection: "column" }}>
                    <div>
                        <div>Bước 1:</div>
                        <div>
                            Lựa chọn hình ảnh cần kiểm tra
                        </div>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
                        {imageArray.map((image, index) => (
                            <div style={{ display: "flex", flexDirection: "column", marginBottom: "20px", marginRight: "20px", width: "25%" }} key={index}>
                                <img src={image} alt={`Image ${index + 1}`} style={{ width: "100%" }} />
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
                    <img src={img7} />
                </div>
                <div className="image-upload-container" style={{ width: "40%" }}>
                    <div className="box-decoration">
                        <label htmlFor="image-upload-input" className="image-upload-label">
                            {image ? image.name : "Choose an image"}
                        </label>
                        <div onClick={handleClick} style={{ cursor: "pointer" }}>
                            {image ? (
                                <img
                                    src={URL.createObjectURL(image)}
                                    alt="upload image"
                                    className="img-display-after"
                                />
                            ) : (
                                <img
                                    src={photo}
                                    alt="upload image"
                                    className="img-display-before"
                                />
                            )}

                            <input
                                id="image-upload-input"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                ref={hiddenFileInput}
                                style={{ display: "none" }}
                            />
                        </div>
                        <button
                            className="image-upload-button"
                            onClick={() => handleUploadButtonClick(image)}
                        >
                            Tải lên
                        </button>
                    </div>
                </div>
            </div>
            <div >

                {imgVid.map((img, index) => (
                    <div key={index} style={{ position: 'relative', display: img.includes("FR_") ? "flex" : "none", marginBottom: '40px', justifyContent: "start", gap: '90px' }}>
                        <div>
                            <AntdImage
                                className={'image-container'}
                                src={img}
                            />
                        </div>
                        <div>
                            <h3 style={{ textAlign: "center", display: imgVid.length > 0 ? "block" : "none", margin: "0 0 10px 0" }}>Kết quả nhận diện hình ảnh:</h3>
                            <table>
                                <tr>
                                    <th>Thông tin</th>
                                    <th>Kết quả</th>
                                </tr>
                                <tr>
                                    <td>Tên folder</td>
                                    <td>{`Image_${image?.name.split(".")[0]}`}</td>
                                </tr>
                                <tr>
                                    <td>Đường dẫn</td>
                                    <td onClick={() => {
                                        navigate(`/manager/Image_${image?.name.split(".")[0]}`, { state: { customData: `${displayName}/deepfake/ImageUpload` } })
                                    }} style={{ color: "blue", cursor: "pointer" }}>{`deepfake/ImageUpload/Image_${image?.name.split(".")[0]}`}</td>
                                </tr>
                                <tr>
                                    <td>Trạng thái</td>
                                    <td>Hoàn Thành</td>
                                </tr>
                                <tr>
                                    <td>Kết quả đánh giá</td>
                                    <td>{dataResult?.result == 0 ? "REAL" : "FAKE"}</td>
                                </tr>
                                <tr>
                                    <td>tỷ lệ dự đoán</td>
                                    <td>{dataResult?.result == 0 ? `${(Math.round((1 - dataResult?.percent) * 1000000)) / 10000} %` : `${(Math.round((dataResult?.percent) * 1000000)) / 10000} %`}</td>
                                </tr>
                                <tr>
                                    <td colSpan={2}>Kết luận: Khuôn mặt {dataResult?.result == 0 ? " người thật" : "giả mạo"}</td>

                                </tr>
                            </table>
                        </div>
                    </div>

                ))}
            </div>
        </div>
    );
};

export default DeepFakeImage;