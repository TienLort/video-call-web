import React, { useState } from "react";

import "src/css/room.css";

import ChannelForm from "./ChannelForm";
import VideoCall from "./VideoCall";

interface CallingRoomProps {
    width: string;
}
const CallingRoom: React.FC<CallingRoomProps> = ({ width }) => {
    const [inCall, setInCall] = useState(false);
    const [channelName, setChannelName] = useState("");

    return (
        <div style={{ width: width }}>

            {inCall ? (
                <VideoCall setInCall={setInCall} channelName={channelName} />
            ) : (
                <ChannelForm setInCall={setInCall} setChannelName={setChannelName} channelName={channelName} />
            )}
        </div>
    );
};
export default CallingRoom