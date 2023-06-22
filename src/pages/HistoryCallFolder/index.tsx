import React, { useContext, useEffect, useRef, useState } from 'react';
import "./style.css"
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { db, storage } from 'src/firebase/config';
import { AuthContext } from 'src/Context/AuthProvider';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    faFolder,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal } from 'antd';
import { Image } from 'antd';
import { doc, getDoc } from 'firebase/firestore';
import { SlickSlider } from 'src/components/slick_slider';
import { Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
            if (customData === undefined) {
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
                        if (selectedFolder.length === folder.length) {
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

            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #ccc", padding: "8px 40px" }}>
                <h2>{imgVid.length > 0 ? `${id}` : "File Management"}</h2>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Button variant="outlined" onClick={handleButtonClick} sx={{ display: imgVid.length > 0 ? "none" : "inline-flex", marginRight: "12px" }} startIcon={<DeleteIcon />}>
                        {showCheckboxes ? 'Accept' : 'Delete'}
                    </Button>
                    <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleNavigate} >
                        Back
                    </Button>
                </div>

            </div>
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
            {videoData.length > 0 ? (
                <div style={{ margin: "30px 10px" }}>
                    {videoData.map((img, index) => (
                        <div key={index} style={{ display: 'flex', gap: '20px' }}>
                            <video className='vidBox' src={img} onClick={() => setOpen(prevOpen => [...prevOpen.slice(0, index), true, ...prevOpen.slice(index + 1)])}></video>
                            <Modal
                                title={`${id}`}
                                centered
                                open={open[index]}
                                onOk={() => setOpen(prevOpen => [...prevOpen.slice(0, index), false, ...prevOpen.slice(index + 1)])}
                                onCancel={handleModalClose}
                                footer={[]}
                                width={1000}
                            >
                                <video width="100%" src={img} controls ref={videoRef}></video>
                            </Modal>
                            <div >
                                <h3 style={{ textAlign: "center", display: imgVid.length > 0 ? "block" : "none", margin: "0 0 10px 0" }}>Kết quả nhận diện video:</h3>
                                <table>
                                    <tr>
                                        <th>Thông tin</th>
                                        <th>Kết quả</th>
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
                        </div>
                    ))}
                    <h3 >Khung Frame cuả video:</h3>
                    <SlickSlider slidesToScroll={2} slidesToShow={4} infinite={true}>
                        {imageData.map((img, index) => (
                            <div key={index} style={{ position: 'relative' }}>
                                <Image className="image-container_his" src={img} />
                            </div>
                        ))}
                    </SlickSlider>
                    <h3 >Kết quả trích xuất khuôn mặt:</h3>
                    <SlickSlider slidesToScroll={2} slidesToShow={4} infinite={true}>
                        {imgVid.map((img, index) => (
                            <div key={index} style={{ position: 'relative' }}>
                                <Image className="image-container_his" src={img} />
                            </div>
                        ))}
                    </SlickSlider>
                </div>) : (<div style={{ display: 'flex', margin: "30px" }}>

                    <div style={{ display: imageData.length > 0 ? "block" : "none", width: "40%" }}>
                        <h3 style={{ textAlign: "center", margin: "0 0 10px 0" }}>Dữ liệu ảnh tải lên:</h3>
                        {imageData.map((img, index) => (
                            <div key={index} >
                                <Image src={img} />
                            </div>
                        ))}

                    </div>
                    <div style={{ display: imgVid.length > 0 ? "block" : "none" }} className='imageBox'>
                        <h3 style={{ textAlign: "center", margin: "0 0 10px 0" }}>Kết quả nhận diện hình ảnh:</h3>
                        {imgVid.map((img, index) => (
                            <div key={index} style={{ display: "flex", justifyContent: "center" }}>
                                <Image className="image-container_his" src={img} />
                            </div>
                        ))}
                        <div >

                            <table>
                                <tr>
                                    <th>Thông tin</th>
                                    <th>Kết quả</th>
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
                    </div>
                </div>)
            }


        </div >
    )
}

export default HistoryCallFolder