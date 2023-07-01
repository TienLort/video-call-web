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
import Loading from 'src/components/Loading';

const ManagerFolder = () => {
    const [folder, setFolder] = useState<string[]>([]);
    const auContext = useContext(AuthContext)
    const displayName = auContext?.user.displayName
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate()


    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
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
                setIsLoading(false);

            }
        }
        fetchData();
    }, [])
    if (isLoading) {
        return (
            <div style={{ width: "100%" }}>
                <Loading />
            </div>
        );
    }
    return (
        <div >
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #ccc", padding: "8px 40px" }}>
                <h2>File Management</h2>
            </div>
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
                        <FontAwesomeIcon icon={faFolder} className="mt-3" style={{ fontSize: "3rem", color: "#ebaa0f" }} />
                        <p className="text-center mt-3">{data}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManagerFolder;