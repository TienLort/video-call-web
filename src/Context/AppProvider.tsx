import React, { createRef, useRef, useState } from "react";
import useFirestore from "../hooks/useFirestore";
import { AuthContext } from "./AuthProvider";

export const AppContext = React.createContext<any>(null);

interface Condition {
  fieldName: string;
  operator: any;
  compareValue: any;
}
interface AppProviderProps {
  children: React.ReactNode;
}

const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [isAddRoomVisible, setIsAddRoomVisible] = useState(false);
  const [isInviteMemberVisible, setIsInviteMemberVisible] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const authContext = React.useContext(AuthContext);
  const uid = authContext?.user.uid;
  const trackRef = useRef<HTMLDivElement>(null);
  const roomsCondition = React.useMemo<Condition>(() => {
    return {
      fieldName: "members",
      operator: "array-contains",
      compareValue: uid,
    };
  }, [uid]);
  const rooms = useFirestore("rooms", roomsCondition);

  const selectedRoom = React.useMemo(
    () => rooms.find((room: any) => room.id === selectedRoomId) || {},
    [rooms, selectedRoomId]
  );

  const usersCondition = React.useMemo<Condition>(() => {
    return {
      fieldName: "uid",
      operator: "in",
      compareValue: selectedRoom.members,
    };
  }, [selectedRoom.members]);

  const members = useFirestore("Users", usersCondition);

  const clearState = () => {
    setSelectedRoomId("");
    setIsAddRoomVisible(false);
    setIsInviteMemberVisible(false);
    setIsCalling(false);
  };
  console.log("vao ref tu App", trackRef.current)
  return (
    <AppContext.Provider
      value={{
        rooms,
        members,
        selectedRoom,
        isAddRoomVisible,
        setIsAddRoomVisible,
        selectedRoomId,
        setSelectedRoomId,
        isInviteMemberVisible,
        isCalling,
        setIsInviteMemberVisible,
        setIsCalling,
        trackRef,
        clearState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider;