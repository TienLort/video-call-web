import React, { useContext, useEffect, useRef, useState } from 'react';
import "./style.css"
import photo1 from "src/assets/images/1.png";
import photo2 from "src/assets/images/logo.png";
import photo3 from "src/assets/images/photo.png";
import { ref, listAll, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from 'src/firebase/config';
import { AuthContext } from 'src/Context/AuthProvider';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    faFileImage,
    faFileAlt,
    faFileAudio,
    faFileVideo,
    faFolder,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Col, Modal, Row } from 'antd';
import { Image } from 'antd';
import { Breadcrumb } from 'antd';
import { BreadcrumbItemType, BreadcrumbSeparatorType } from 'antd/es/breadcrumb/Breadcrumb';
import { doc, getDoc } from 'firebase/firestore';
import { SlickSlider } from 'src/components/slick_slider';

const HistoryCallFolder = () => {
    const location = useLocation();
    const id = location.pathname.split('/')[location.pathname.split('/').length - 1];
    const customData = location.state?.customData;
    const [selectedFolder, setSelectedFolder] = useState<string[]>([]);
    const [showCheckboxes, setShowCheckboxes] = useState(false);
    const [folder, setFolder] = useState<string[]>([]);
    const [imgVid, setImgVid] = useState<string[]>([]);
    const [videoData, setVideoData] = useState<string[]>([]);
    const [imageData, setImageData] = useState<string[]>([]);
    const auContext = useContext(AuthContext)
    const displayName = auContext?.user.displayName
    const [open, setOpen] = useState(Array(imgVid.length).fill(false));
    const [result, setResult] = useState<any>(null)
    const API_URL = "http://127.0.0.1:8000"
    const navigate = useNavigate()
    useEffect(() => {
        const fetchData = async () => {
            console.log(customData, id, displayName)
            if (id && displayName) {

                const listRef = customData ? ref(storage, `${customData}/${id}`) : ref(storage, `${displayName}/${id}`);
                const data: string[] = [];
                const data1: string[] = [];
                const data2: string[] = [];
                const data3: string[] = [];
                const promises: Promise<any>[] = [];

                try {
                    const res = await listAll(listRef);

                    for (const folderRef of res.prefixes) {
                        const dataFolder = folderRef.fullPath;
                        const dataFolderName = dataFolder.split("/")[dataFolder.split('/').length - 1];
                        const folderCheckRef = customData ? ref(storage, `${customData}/${id}/${dataFolderName}`) : ref(storage, `${displayName}/${id}/${dataFolderName}`);
                        data.push(dataFolderName);
                        try {
                            console.log("Vào đây");
                            const { items } = await listAll(folderCheckRef);

                            if (items.length > 0) {
                                console.log('có mục con.');
                            } else {
                                console.log('Thư mục không có mục con.');
                            }
                        } catch (error) {
                            console.error('Lỗi kiểm tra thư mục:', error);
                        }
                    }

                    for (const itemRef of res.items) {
                        const promise = getDownloadURL(ref(storage, itemRef.fullPath));
                        promises.push(promise);
                        promise.then((result) => {
                            if (result.includes("FR_")) {
                                data1.push(result);
                            } else if (result.includes("Image") || result.includes("Frame")) {
                                data2.push(result)
                            } else {
                                data3.push(result)
                            }
                        });
                    }
                    const userRef = doc(db, "Results", id);
                    const docSnap = await getDoc(userRef);
                    if (docSnap.exists()) {
                        setResult(docSnap.data());
                    } else {
                        // docSnap.data() will be undefined in this case
                        console.log("No such document!");
                    }
                    await Promise.all(promises);
                    setFolder(data);
                    setImgVid(data1)
                    setImageData(data2);
                    setVideoData(data3);
                } catch (error) {
                    console.log("Error", error)
                }
            }
        };
        fetchData();
    }, [customData, id, displayName])

    const handleCheckboxChange = (data: string) => {
        if (selectedFolder.includes(data)) {
            setSelectedFolder(prevSelectedFolder => prevSelectedFolder.filter(item => item !== data));
        } else {
            setSelectedFolder(prevSelectedFolder => [...prevSelectedFolder, data]);
        }
    };

    const handleButtonClick = async () => {
        if (showCheckboxes === true && selectedFolder.length > 0) {
            let file_path = ""
            if (customData == undefined) {
                file_path = displayName + "/" + id
                console.log("Các folder đã chọn:", selectedFolder);
            }
            else {
                file_path = customData + "/" + id
            }
            const payload = {
                path: file_path,
                folder: selectedFolder,
            }
            await fetch(`${API_URL}/api/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })
                .then(response => {
                    if (response.ok) {
                        if (selectedFolder.length == folder.length) {
                            navigate(-1)
                        }
                        else {
                            selectedFolder.map((data) => {
                                setFolder(prevFolder => prevFolder.filter(item => item !== data));
                            })
                        }
                    } else {
                        console.log("Request failed");
                        throw new Error('Request failed');
                    }
                })
                .catch(err => {
                    console.log(err);
                });
            setSelectedFolder([]);
        } else if (showCheckboxes === true) {
            console.log("Không có folder nào được chọn.");
        }
        setShowCheckboxes(!showCheckboxes);
    };


    const videoRef = useRef<HTMLVideoElement | null>(null);

    const handleModalClose = () => {
        // Tạm dừng video
        if (videoRef.current instanceof HTMLVideoElement) { // Kiểm tra kiểu dữ liệu của videoRef.current
            videoRef.current.pause();
            setOpen(Array(imgVid.length).fill(false));
        }
    };
    const handleNavigate = () => {
        navigate(-1);
    };
    return (
        <div style={{ height: "100%", overflowY: "auto" }}>
            {
                id == "deepfake" || "call" ? <button onClick={handleButtonClick}>
                    {showCheckboxes ? 'Xóa các mục đã chọn' : 'Hiển thị checkbox'}
                </button> : <></>
            }
            <button onClick={handleNavigate}>Back</button>
            <div className="element-row" style={{ display: folder.length > 0 ? "flex" : "none" }}>
                {folder.map((data, index) => (
                    <div

                        onDoubleClick={(e) => {
                            e.stopPropagation(); // Ngăn chặn sự kiện click lan ra các phần tử con
                            navigate(`/manager/${data}`, { state: { customData: customData == undefined ? `${displayName}/${id}` : `${customData}/${id}` } });
                        }}
                        onClick={(e) => {
                            if (e.currentTarget.classList.contains("text-white")) {
                                e.currentTarget.style.background = "#fff";
                                e.currentTarget.classList.remove("text-white");
                                e.currentTarget.classList.remove("shadow-sm");
                            } else {
                                e.currentTarget.style.background = "#017bf562";
                                e.currentTarget.classList.add("text-white");
                                e.currentTarget.classList.add("shadow-sm");
                            }
                        }}

                        key={index}
                        className="element-col disable-select"
                    >
                        <FontAwesomeIcon icon={faFolder} className="mt-3" style={{ fontSize: "3rem" }} />
                        <p className="text-center mt-3">{data}</p>
                        {showCheckboxes && (
                            <input
                                type="checkbox"
                                className="image-checkbox"
                                checked={selectedFolder.includes(data)}
                                onChange={() => handleCheckboxChange(data)}
                            />
                        )}
                    </div>
                ))}
            </div>
            {videoData.map((img, index) => (
                <div>
                    <video width="320" src={img} onClick={() => setOpen(prevOpen => [...prevOpen.slice(0, index), true, ...prevOpen.slice(index + 1)])}></video>
                    <Modal
                        title="Modal"
                        centered
                        open={open[index]}
                        onOk={() => setOpen(prevOpen => [...prevOpen.slice(0, index), false, ...prevOpen.slice(index + 1)])}
                        onCancel={handleModalClose}
                        footer={[]}
                        width={1000}
                    >
                        <video width="100%" src={img} controls ref={videoRef}></video>
                    </Modal>
                </div>
            ))}
            <h3 style={{ marginBottom: '20px' }}>{result?.percent}</h3>
            <SlickSlider slidesToScroll={2} slidesToShow={4} infinite={true}>
                {imageData.map((img, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                        <Image className="image-container" src={img} />
                    </div>
                ))}
            </SlickSlider>
            <SlickSlider slidesToScroll={2} slidesToShow={4} infinite={true}>
                {imgVid.map((img, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                        <Image className="image-container" src={img} />
                    </div>
                ))}
            </SlickSlider>

        </div>
    )
}

export default HistoryCallFolder