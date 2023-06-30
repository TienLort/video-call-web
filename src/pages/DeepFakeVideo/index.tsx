import React, { useRef, ChangeEvent, useState, useContext, useEffect } from "react";
import { getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "src/firebase/config";
import { AuthContext } from "src/Context/AuthProvider";
import { Image as AntdImage, message } from 'antd';
import { doc, getDoc } from "firebase/firestore";
import img7 from "src/assets/images/middleline.svg"
import photo from "src/assets/images/upload.png"
import "./deepfake.css"
import { SlickSlider } from "src/components/slick_slider";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
const DeepFakeVideo = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<any>(null)
    const auContext = useContext(AuthContext)
    const displayName = auContext?.user.displayName
    const navigate = useNavigate()
    const API_URL = "http://127.0.0.1:8000"
    const [isLoading, setIsLoading] = useState(false);
    const [imgVid, setImgVid] = useState<Array<Array<string>>>([]);
    const [showVideo, setShowVideo] = useState(false);
    const hiddenFileInput = useRef<HTMLInputElement>(null);
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files && event.target.files[0];
        setFile(file)
        setShowVideo(true);
        setImgVid([])
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const video = videoRef.current;
                if (video) {
                    video.srcObject = null;
                    video.src = reader.result as string;
                    video.load();
                }
            };
            reader.readAsDataURL(file);
        }
    };
    const handleVideoLoaded = () => {
        setIsLoading(false); // Đã tải xong video, ẩn overlay
    };
    const getImagesFromFirebase = async (url: string) => {
        const storageRef = ref(storage, url);
        console.log(url)
        const listResult = await listAll(storageRef);
        console.log(listResult)

        const downloadURLs = [];
        const downloadURLs_FR = [];

        for (const itemRef of listResult.items) {
            const imageURL = await getDownloadURL(itemRef);
            if (imageURL.includes(".jpg") || imageURL.includes(".png")) {
                if (imageURL.includes("FR_")) {
                    downloadURLs_FR.push(imageURL)
                }
                else {
                    downloadURLs.push(imageURL);

                }
                console.log("dang o trong itemref")
            }

        }
        console.log("Bat dau lay anh")
        setImgVid([downloadURLs, downloadURLs_FR]);
    }

    const handleUploadButtonClick = async () => {
        if (file) {
            setIsLoading(true);
            setImgVid([])
            setResult(null)
            const storageRef = ref(storage, `${displayName}/deepfake/VideoUpload/Video_${file.name.split(".")[0]}/Video_${file.name.split(".")[0]}`);
            await uploadBytes(storageRef, file).then((snapshot) => {
                console.log('Uploaded a blob or file!');
            });
            const payload = {
                urlUpload: `${displayName}/deepfake/VideoUpload/Video_${file.name.split(".")[0]}/Video_${file.name.split(".")[0]}`,
                type: "video"
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
                try {
                    getImagesFromFirebase(`${displayName}/deepfake/VideoUpload/Video_${file.name.split(".")[0]}`)
                    const deepFakeResponse = await fetch(`${API_URL}/api/deepfake`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });
                    if (deepFakeResponse.ok) {
                        const userRef = doc(db, "Results", `Video_${file.name.split(".")[0]}`);
                        const docSnap = await getDoc(userRef);
                        if (docSnap.exists()) {
                            setResult(docSnap.data());
                        } else {
                            // docSnap.data() will be undefined in this case
                            message.info("Không tìm thấy kết quả");
                        }
                        toast.success(`Video đã được tính toán, bạn có thể xem kết quả tại Video_${file.name.split(".")[0]}!`, {
                            position: "top-right",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "light",
                        });
                        setIsLoading(false)

                    } else {
                        // Xử lý khi gọi API không thành công
                        setIsLoading(false)
                        throw new Error('Call to deepfake API failed.');
                    }
                } catch (error) {
                    // Xử lý lỗi ở đây
                    console.error(error);
                    message.error('Hệ thống không thể nhận diện khuôn mặt! ');
                    setIsLoading(false);
                }
            } else {
                // Xử lý khi gọi findface API không thành công
                setIsLoading(false)
                message.error('Hệ thống không thể nhận diện khuôn mặt!');

            }
            setIsLoading(false)
        } else {
            message.info("Vui lòng chọn một video");
            return;
        }
    };
    const handleClick = () => {
        if (hiddenFileInput.current) {
            hiddenFileInput.current.click();
        }
    };
    console.log(result)
    return (
        <div style={{ height: '100%', overflowY: "auto", padding: "0 20px" }}>
            {isLoading && (
                <div className="overlay">
                    <div className="loader"></div>
                </div>
            )}
            <div>
                <h3>Video DeepFake Detection</h3>
                <p>Nhận diện khuôn mặt cho phép bạn tìm khuôn mặt trong một hình ảnh. Thông qua nhận diện hình ảnh, chúng tôi sẽ đánh giá khuôn mặt đã qua chỉnh sửa</p>
            </div>
            <div style={{ display: "flex", gap: "20px", justifyContent: "space-around" }}>

                <div className="image-upload-container" style={{ width: "30%" }}>
                    <div className="box-decoration">
                        <label htmlFor="file-upload" className="image-upload-label">
                            {file ? file.name.split(".")[0] : "Choose an image"}
                        </label>
                        <div onClick={handleClick} style={{ cursor: "pointer" }}>
                            <img
                                src={photo}
                                alt="upload image"
                                className="img-display-before"
                            />

                            <input
                                id="file-upload"
                                type="file"
                                accept="video/*"
                                ref={hiddenFileInput}
                                onChange={handleFileChange}
                                style={{ display: "none" }}
                            />
                        </div>
                        <button
                            className="image-upload-button"
                            onClick={() => handleUploadButtonClick()}
                        >
                            Upload
                        </button>
                    </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
                    <img src={img7} />
                </div>
                <div style={{ padding: "1rem", }}>
                    <h3 style={{ margin: "0 0 10px 0" }}>Example: </h3>
                    {showVideo ? (
                        <video
                            ref={videoRef}
                            id="video1"
                            controls

                            onLoadedData={handleVideoLoaded}
                            style={{ borderRadius: "5px", border: "1px solid #444444", width: "40vw" }}
                        />) : (<iframe style={{ width: "40vw" }} height="340" src="https://www.youtube.com/embed/cQ54GDm1eL0"></iframe>)}
                </div>
            </div>
            <div style={{ display: imgVid.length > 0 ? "block" : "none" }}>
                {
                    imgVid ? <>
                        <h3 >Khung Frame cuả video:</h3>
                        <SlickSlider slidesToScroll={1} slidesToShow={4} infinite={true}>
                            {imgVid[0] && imgVid[0].map((img, index) => (
                                <div key={index} style={{ position: 'relative' }}>
                                    <AntdImage
                                        className={'image-container_video'}
                                        src={img}
                                    />
                                </div>
                            ))}
                        </SlickSlider>
                        <h3 >Kết quả trích xuất khuôn mặt:</h3>
                        <SlickSlider slidesToScroll={1} slidesToShow={4} infinite={true}>
                            {imgVid[1] && imgVid[1].map((img, index) => (
                                <div key={index} style={{ position: 'relative' }}>
                                    <AntdImage
                                        className={'image-container_video'}
                                        src={img}
                                    />
                                </div>
                            ))}
                        </SlickSlider>
                        <div >
                            <h3 style={{ textAlign: "center", display: imgVid.length > 0 ? "block" : "none", margin: "0 0 10px 0" }}>Kết quả nhận diện hình ảnh:</h3>
                            <table>
                                <tr>
                                    <th>Thông tin</th>
                                    <th>Kết quả</th>
                                </tr>
                                <tr>
                                    <td>Tên folder</td>
                                    <td>{`Video_${file?.name.split(".")[0]}`}</td>
                                </tr>
                                <tr>
                                    <td>Đường dẫn</td>
                                    <td onClick={() => {
                                        navigate(`/manager/Video_${file?.name.split(".")[0]}`, { state: { customData: `${displayName}/deepfake/VideoUpload` } })
                                    }} style={{ color: "blue", cursor: "pointer" }}>{`deepfake/VideoUpload/Video_${file?.name.split(".")[0]}`}</td>
                                </tr>
                                <tr>
                                    <td>Trạng thái</td>
                                    <td>Hoàn Thành</td>
                                </tr>
                                <tr>
                                    <td>Kết quả đánh giá</td>
                                    <td>{result?.result == 0 ? "REAL" : "FAKE"}</td>
                                </tr>
                                <tr>
                                    <td>tỷ lệ dự đoán</td>
                                    <td>{result?.result == 0 ? `${(Math.round((1 - result?.percent) * 1000000)) / 10000} %` : `${(Math.round((result?.percent) * 1000000)) / 10000} %`}</td>
                                </tr>
                                <tr>
                                    <td colSpan={2}>Kết luận: Khuôn mặt {result?.result == 0 ? " người thật" : "giả mạo"}</td>

                                </tr>
                            </table>
                        </div>
                    </> : <><p>Không có kết quả</p></>
                }
            </div>

        </div>
    );
};

export default DeepFakeVideo;