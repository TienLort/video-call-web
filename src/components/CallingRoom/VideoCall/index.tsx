import {
    IAgoraRTCRemoteUser,
    createClient,
    ClientConfig,
    createMicrophoneAndCameraTracks
} from "agora-rtc-react";
import React, { useContext, useEffect, useState } from "react";
import "src/css/room.css";
import Controls from "./Controls";
import Videos from "./Videos";
import { AppContext } from "src/Context/AppProvider";

const config: ClientConfig = {
    mode: "rtc", codec: "vp8",
};


const appId = "34bdad232372411d9d492fb2acba1489"; //ENTER APP ID HERE
const token = null;
const useClient = createClient(config);
const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();

const VideoCall = (props: {
    setInCall: React.Dispatch<React.SetStateAction<boolean>>;
    channelName: string;
}) => {
    const { setInCall, channelName } = props;
    const [users, setUsers] = useState<IAgoraRTCRemoteUser[]>([]);
    const [start, setStart] = useState<boolean>(false);
    // using the hook to get access to the client object
    const client = useClient();
    // ready is a state variable, which returns true when the local tracks are initialized, untill then tracks variable is null
    const { ready, tracks } = useMicrophoneAndCameraTracks();
    const trackRef = useContext(AppContext);
    useEffect(() => {
        // function to initialise the SDK
        let init = async (name: string) => {
            client.on("user-published", async (user, mediaType) => {
                await client.subscribe(user, mediaType);
                console.log("subscribe success");
                if (mediaType === "video") {
                    setUsers((prevUsers) => {
                        return [...prevUsers, user];
                    });
                }
                if (mediaType === "audio") {
                    user.audioTrack?.play();
                }
            });

            client.on("user-unpublished", (user, type) => {
                console.log("unpublished", user, type);
                if (type === "audio") {
                    user.audioTrack?.stop();
                }
                if (type === "video") {
                    setUsers((prevUsers) => {
                        return prevUsers.filter((User) => User.uid !== user.uid);
                    });
                }
            });

            client.on("user-left", (user) => {
                console.log("leaving", user);
                setUsers((prevUsers) => {
                    return prevUsers.filter((User) => User.uid !== user.uid);
                });
            });

            await client.join(appId, name, token, null);
            if (tracks) await client.publish([tracks[0], tracks[1]]);
            setStart(true);

        };

        if (ready && tracks) {
            console.log("init ready");
            init(channelName);
        }

    }, [channelName, client, ready, tracks]);


    return (
        <div className="App">
            {ready && tracks && (
                <Controls tracks={tracks} setStart={setStart} setInCall={setInCall} client={client} channelName={channelName} trackRef={trackRef} />
            )}
            {start && tracks && <Videos users={users} tracks={tracks} trackRef={trackRef} />}
        </div>
    );
};

export default VideoCall