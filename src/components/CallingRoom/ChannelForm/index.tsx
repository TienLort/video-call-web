import React, { useContext } from "react";
import { AppContext } from "src/Context/AppProvider";
import { addMessage } from "../../../firebase/services";
import { AuthContext } from "src/Context/AuthProvider";
import { message } from 'antd';
const ChannelForm = (props: {
    setInCall: React.Dispatch<React.SetStateAction<boolean>>;
    setChannelName: React.Dispatch<React.SetStateAction<string>>;
    channelName: string;
}) => {
    const { setInCall, setChannelName, channelName } = props;
    const { selectedRoom, setIsCalling } = useContext(AppContext);
    const authContext = React.useContext(AuthContext);
    const displayName = authContext?.user.displayName || authContext?.user.email;
    const handleCheckInput = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (channelName != "") {
            e.preventDefault();
            setInCall(true);
            addMessage("messages", {
                text: `${displayName} đã tham gia phòng ${channelName}`,
                uid: "001",
                photoURL: "https://firebasestorage.googleapis.com/v0/b/videocalldb.appspot.com/o/bot.png?alt=media&token=f5391c13-0d0c-467c-854c-ab5a2630941a",
                roomId: selectedRoom.id,
                displayName: "Chat Bot :",
            });
        } else {
            message.error("Room Id không được để trống")
        }
    }
    return (
        <div className="join">
            <input type="text"
                placeholder="Enter Channel Name"
                onChange={(e) => setChannelName(e.target.value)}
                required
            />
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button onClick={handleCheckInput}>
                    Join
                </button>

                <button onClick={(e) => {
                    e.preventDefault();
                    setIsCalling(false);
                }}>
                    Leave
                </button>
            </div>
        </div>
    );
};

export default ChannelForm