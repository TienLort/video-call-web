import {
    ICameraVideoTrack,
    IMicrophoneAudioTrack,
    IAgoraRTCClient,
} from "agora-rtc-react";
import html2canvas from 'html2canvas';
import React, { useContext, useEffect, useState } from "react";
import { storage } from "src/firebase/config"
import { ref, uploadString, uploadBytes } from "firebase/storage";
import { AppContext } from "src/Context/AppProvider";
import "../../../../css/room.css";
import { AuthContext } from "src/Context/AuthProvider";
import { addMessage } from "src/firebase/services";



const Controls = (props: {
    tracks: [IMicrophoneAudioTrack, ICameraVideoTrack];
    setStart: React.Dispatch<React.SetStateAction<boolean>>;
    setInCall: React.Dispatch<React.SetStateAction<boolean>>;
    client: IAgoraRTCClient;
    channelName: string
}) => {
    const auContext = useContext(AuthContext)
    const displayName = auContext?.user.displayName
    const { tracks, setStart, setInCall, client, channelName } = props;
    const [trackState, setTrackState] = useState({ video: true, audio: true });
    const API_URL = "http://127.0.0.1:8000"
    const { selectedRoom, trackRef } = useContext(AppContext);
    const mute = async (e: React.MouseEvent, type: "audio" | "video") => {
        const button = e.currentTarget;
        if (type === "audio") {
            await tracks[0].setEnabled(!trackState.audio);
            setTrackState((ps) => {
                return { ...ps, audio: !ps.audio };
            });
        } else if (type === "video") {
            await tracks[1].setEnabled(!trackState.video);
            setTrackState((ps) => {
                return { ...ps, video: !ps.video };
            });
        }
        button.classList.toggle("active");
    };
    useEffect(() => {

        return (() => {
            console.log("Thoat trang")
            addMessage("messages", {
                text: `${displayName} đã rời khỏi phòng ${channelName}`,
                uid: "001",
                photoURL: "https://firebasestorage.googleapis.com/v0/b/videocalldb.appspot.com/o/bot.png?alt=media&token=f5391c13-0d0c-467c-854c-ab5a2630941a",
                roomId: selectedRoom.id,
                displayName: "Chat Bot :",
            });
            leaveChannel()
        })
    }, [])
    const leaveChannel = async () => {
        await client.leave();
        client.removeAllListeners();
        console.log("Vao leave")
        tracks[0].close();
        tracks[1].close();
        setStart(false);
        setInCall(false);

    };
    const captureFrame = async () => {
        if (trackRef.current) {
            console.log(trackRef.current)
            let uid = String(Math.floor(Math.random() * 1000))
            html2canvas(trackRef.current).then((canvas) => {
                const image = canvas.toDataURL();
                const storageRef = ref(storage, `${displayName}/deepfake/CropUpload/CropImage${uid}/CropImage${uid}`);
                uploadString(storageRef, image, 'data_url').then((snapshot) => {
                    console.log('Uploaded a data_url string!');
                });
            });
            const payload = {
                urlUpload: `${displayName}/deepfake/CropUpload/CropImage${uid}/CropImage${uid}`,
                type: "video"
            }
            const findFaceResponse = await fetch(`${API_URL}/api/findface`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })
            if (findFaceResponse.ok) {
                // Nếu thành công, gọi tiếp API POST tới /api/deepfake
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
            } else {
                // Xử lý khi gọi findface API không thành công
                console.error('Call to findface API failed.');
            }
        }
    };

    return (
        <div className="controls">
            <div className="stream__actions">
                <button id="camera-btn" className="active" onClick={(e) => mute(e, "video")}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M5 4h-3v-1h3v1zm10.93 0l.812 1.219c.743 1.115 1.987 1.781 3.328 1.781h1.93v13h-20v-13h3.93c1.341 0 2.585-.666 3.328-1.781l.812-1.219h5.86zm1.07-2h-8l-1.406 2.109c-.371.557-.995.891-1.664.891h-5.93v17h24v-17h-3.93c-.669 0-1.293-.334-1.664-.891l-1.406-2.109zm-11 8c0-.552-.447-1-1-1s-1 .448-1 1 .447 1 1 1 1-.448 1-1zm7 0c1.654 0 3 1.346 3 3s-1.346 3-3 3-3-1.346-3-3 1.346-3 3-3zm0-2c-2.761 0-5 2.239-5 5s2.239 5 5 5 5-2.239 5-5-2.239-5-5-5z" /></svg>
                </button>
                <button id="mic-btn" className="active" onClick={(e) => mute(e, "audio")}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M12 2c1.103 0 2 .897 2 2v7c0 1.103-.897 2-2 2s-2-.897-2-2v-7c0-1.103.897-2 2-2zm0-2c-2.209 0-4 1.791-4 4v7c0 2.209 1.791 4 4 4s4-1.791 4-4v-7c0-2.209-1.791-4-4-4zm8 9v2c0 4.418-3.582 8-8 8s-8-3.582-8-8v-2h2v2c0 3.309 2.691 6 6 6s6-2.691 6-6v-2h2zm-7 13v-2h-2v2h-4v2h10v-2h-4z" /></svg>
                </button>
                <button id="screen-btn" onClick={captureFrame}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 1v17h24v-17h-24zm22 15h-20v-13h20v13zm-6.599 4l2.599 3h-12l2.599-3h6.802z" /></svg>
                </button>
                <button id="leave-btn" style={{ backgroundColor: "#FF5050" }} onClick={() => leaveChannel()}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16 10v-5l8 7-8 7v-5h-8v-4h8zm-16-8v20h14v-2h-12v-16h12v-2h-14z" /></svg>
                </button>
            </div>


        </div>
    );
};
export default Controls