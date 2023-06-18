import {
    AgoraVideoPlayer,
    IAgoraRTCRemoteUser,
    ICameraVideoTrack,
    IMicrophoneAudioTrack
} from "agora-rtc-react";
import { useContext, useEffect, useRef, useState } from "react";

import { AppContext } from "src/Context/AppProvider";
import "src/css/room.css";


const Videos = (props: {
    users: IAgoraRTCRemoteUser[];
    tracks: [IMicrophoneAudioTrack, ICameraVideoTrack];
}) => {
    const { users, tracks } = props;
    const trackRef = useContext(AppContext);
    let userIdInDisplayFrame: string | null = null;
    const displayFrame = document.getElementById('stream__box');
    const hideDisplayFrame = () => {
        const videoFrames = document.querySelectorAll('.videos');
        console.log("vao hide")
        userIdInDisplayFrame = null
        if (displayFrame) {
            console.log("vao hide", displayFrame)
            displayFrame.style.display = 'none'
            const child = displayFrame.children[0]
            document.getElementById('streams__container')?.appendChild(child);
        }
        console.log("vao hide", videoFrames)
        for (let i = 0; i < videoFrames.length; i++) {
            const videoFrame = videoFrames[i] as HTMLElement; // Ép kiểu thành HTMLElement
            videoFrame.style.height = '300px';
            videoFrame.style.width = '300px';
        }
    }

    const expandVideoFrame = (e: any) => {
        if (userIdInDisplayFrame != null) {
            hideDisplayFrame()
        } else {
            const videoFrames = document.querySelectorAll('.videos');
            let child = displayFrame?.children[0]
            if (child !== undefined) {
                document.getElementById('streams__container')?.appendChild(child);
            }

            if (displayFrame) {
                displayFrame.style.display = 'block'
                displayFrame.appendChild(e.currentTarget)
            }
            userIdInDisplayFrame = e.currentTarget.id
            for (let i = 0; i < videoFrames.length; i++) {
                if (videoFrames[i].id != userIdInDisplayFrame) {
                    const videoFrame = videoFrames[i] as HTMLElement;
                    videoFrame.style.height = '100px';
                    videoFrame.style.width = '100px';
                }
            }
        }
    }

    return (
        <section id="stream__container" ref={trackRef}>
            <div id="stream__box" ></div>
            <div id="streams__container" >
                <div className="videos" onClick={expandVideoFrame} id="videos--1">
                    <AgoraVideoPlayer className='vid' videoTrack={tracks[1]} />
                </div>
                {users.length > 0 &&
                    users.map((user, index) => {
                        if (user.videoTrack) {
                            return (
                                <div className="videos" onClick={expandVideoFrame} id={`video-${index}`}>
                                    <AgoraVideoPlayer className='vid' videoTrack={user.videoTrack} key={user.uid} />
                                </div>
                            );
                        } else return null;
                    })}
            </div>
        </section >
    );
};
export default Videos