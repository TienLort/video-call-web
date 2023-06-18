import React, { useRef, ChangeEvent, useState, useContext, useEffect } from "react";
import { getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "src/firebase/config";
import { AuthContext } from "src/Context/AuthProvider";
import { Image as AntdImage } from 'antd';
import { doc, getDoc } from "firebase/firestore";
import "./deepfake.css"
import { SlickSlider } from "src/components/slick_slider";
const DeepFakeVideo = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<any>(null)
    const auContext = useContext(AuthContext)
    const displayName = auContext?.user.displayName
    const API_URL = "http://127.0.0.1:8000"
    const [isLoading, setIsLoading] = useState(false);
    const [imgVid, setImgVid] = useState<Array<Array<string>>>([]);
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files && event.target.files[0];
        setFile(file)
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
            const storageRef = ref(storage, `${displayName}/deepfake/VideoUpload/VideoUpload${file.lastModified}/VideoUpload${file.lastModified}`);
            await uploadBytes(storageRef, file).then((snapshot) => {
                console.log('Uploaded a blob or file!');
            });
            const payload = {
                urlUpload: `${displayName}/deepfake/VideoUpload/VideoUpload${file.lastModified}/VideoUpload${file.lastModified}`,
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
                // Nếu thành công, gọi tiếp API POST tới /api/deepfake
                getImagesFromFirebase(`${displayName}/deepfake/VideoUpload/VideoUpload${file.lastModified}`)
                const deepFakeResponse = await fetch(`${API_URL}/api/deepfake`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                // Xử lý dữ liệu trả về từ deepfake API
                const deepFakeData = await deepFakeResponse.json();
                console.log(deepFakeData);
                const userRef = doc(db, "Results", `VideoUpload${file.lastModified}`);
                const docSnap = await getDoc(userRef);
                if (docSnap.exists()) {
                    setResult(docSnap.data());
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
    };
    console.log(isLoading)
    return (
        <div style={{ height: '100%', overflowY: "auto" }}>
            {isLoading && (
                <div className="overlay">
                    <div className="loader"></div>
                </div>
            )}
            <div>
                <input type="file" accept="video/*" onChange={handleFileChange} />
                <video
                    ref={videoRef}
                    id="video1"
                    controls
                    width={500}
                    height={300}
                    onLoadedData={handleVideoLoaded}
                />
                <button
                    className="image-upload-button"
                    onClick={() => handleUploadButtonClick()}
                >
                    Upload
                </button>
            </div>
            {
                imgVid ? <>
                    <SlickSlider slidesToScroll={1} slidesToShow={4} infinite={true}>
                        {imgVid[0] && imgVid[0].map((img, index) => (
                            <div key={index} style={{ position: 'relative' }}>
                                <AntdImage
                                    className={'image-container'}
                                    src={img}
                                />
                            </div>
                        ))}
                    </SlickSlider>
                    <SlickSlider slidesToScroll={1} slidesToShow={4} infinite={true}>
                        {imgVid[1] && imgVid[1].map((img, index) => (
                            <div key={index} style={{ position: 'relative' }}>
                                <AntdImage
                                    className={'image-container'}
                                    src={img}
                                />
                            </div>
                        ))}
                    </SlickSlider>
                </> : <><p>Không có kết quả</p></>
            }
            <h3 style={{ marginBottom: '20px' }}>{result?.percent}</h3>
        </div>
    );
};

export default DeepFakeVideo;