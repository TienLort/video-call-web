import React, { useContext, useEffect, useState } from 'react';
import "./style.css"
import photo1 from "src/assets/images/1.png";
import photo2 from "src/assets/images/logo.png";
import photo3 from "src/assets/images/photo.png";
import { ref, listAll, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from 'src/firebase/config';
import { AuthContext } from 'src/Context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import {
    faFolder,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ManagerFolder = () => {
    const [selectedFolder, setSelectedFolder] = useState<string[]>([]);
    const [showCheckboxes, setShowCheckboxes] = useState(false);
    const [folder, setFolder] = useState<string[]>([]);
    const auContext = useContext(AuthContext)
    const displayName = auContext?.user.displayName
    const navigate = useNavigate()
    const handleCheckboxChange = (data: string) => {
        if (selectedFolder.includes(data)) {
            setSelectedFolder(prevSelectedFolder => prevSelectedFolder.filter(item => item !== data));
        } else {
            setSelectedFolder(prevSelectedFolder => [...prevSelectedFolder, data]);
        }
    };

    const handleButtonClick = () => {
        if (showCheckboxes === true && selectedFolder.length > 0) {
            console.log("Các folder đã chọn:", selectedFolder);
            if (selectedFolder.length == folder.length) {
                navigate(-1)
                console.log("Xoa Het")
            } else {
                console.log("Xoa tung file")

            }
            setSelectedFolder([]);
        } else if (showCheckboxes === true) {
            console.log("Không có folder nào được chọn.");
        }
        setShowCheckboxes(!showCheckboxes);
    };



    useEffect(() => {
        const fetchData = async () => {
            if (displayName) {
                const listRef = ref(storage, displayName);
                const data: string[] = [];
                const promises: Promise<any>[] = [];
                const res = await listAll(listRef)
                for (const folderRef of res.prefixes) {
                    const dataFolder = folderRef.fullPath
                    const dataFolderName = dataFolder.split("/")[1]
                    data.push(dataFolderName)
                }
                await Promise.all(promises);
                setFolder(data);
            }
        }
        fetchData();
    }, [])
    return (
        <div >
            <button onClick={handleButtonClick}>
                {showCheckboxes ? 'Xóa các mục đã chọn' : 'Hiển thị checkbox'}
            </button>
            <div className="element-row_manager">
                {folder.map((data, index) => (
                    <div
                        onDoubleClick={() => navigate(`/manager/${data}`)}
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
        </div>
    );
};

export default ManagerFolder;