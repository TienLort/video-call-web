import React from "react";
import { Collapse, Typography, Button } from "antd";
import styled from "styled-components";
import { AiFillPlusSquare } from 'react-icons/ai';
import { AppContext } from "../../Context/AppProvider";
import { useNavigate } from "react-router-dom";

const { Panel } = Collapse;

const PanelStyled = styled(Panel)`
  &&& {
    .ant-collapse-header,
    p {
      color: white;
    }

    .ant-collapse-content-box {
      padding: 0 40px;
    }

    .add-room {
      color: white;
      padding: 0;
    }
  }
`;

const LinkStyled = styled(Typography.Link)`
  display: block;
  margin-bottom: 5px;
  color: white;
`;

const RoomList = () => {
    const { rooms, setIsAddRoomVisible, setSelectedRoomId, setIsCalling, setActiveButton } =
        React.useContext(AppContext);

    const handleAddRoom = () => {
        setIsAddRoomVisible(true);
    };
    const navigate = useNavigate()

    return (
        <Collapse ghost defaultActiveKey={["1"]}>
            <PanelStyled header="Danh sách các phòng" key="1">
                {rooms.map((room: any) => (
                    <LinkStyled
                        key={room.id}
                        onClick={() => {
                            navigate("/")
                            setSelectedRoomId(room.id);
                            setIsCalling(false);
                        }}
                    >
                        {room.displayName}
                    </LinkStyled>
                ))}
                <Button
                    type="text"
                    icon={<AiFillPlusSquare />}
                    className="add-room"
                    onClick={handleAddRoom}
                >
                    Thêm phòng
                </Button>
            </PanelStyled>
            <PanelStyled header="Nhận diện DeepFake" key="2">
                <LinkStyled
                    key={1}
                    onClick={() => {
                        navigate("/img")
                        setIsCalling(false);
                    }}
                >
                    Nhận diện qua hình ảnh
                </LinkStyled>
                <LinkStyled
                    key={2}
                    onClick={() => {
                        navigate("/video")

                        setIsCalling(false);
                    }}
                >
                    Nhận diện qua video
                </LinkStyled>
                <LinkStyled
                    key={3}
                    onClick={() => {

                        navigate("/manager")
                        setIsCalling(false);
                    }}
                >
                    Quản lý dữ liệu
                </LinkStyled>
            </PanelStyled>
        </Collapse>
    );
};
export default RoomList;
