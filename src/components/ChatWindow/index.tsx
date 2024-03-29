import React, { useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Button, Tooltip, Avatar, Form, Alert, InputRef, Modal, Space } from "antd";
import Message from "../Message";
import { AppContext } from "../../Context/AppProvider";
import { addMessage } from "../../firebase/services";
import { AuthContext } from "../../Context/AuthProvider";
import useFirestore from "../../hooks/useFirestore";
import { AiFillVideoCamera } from 'react-icons/ai';
import { RiUserAddLine } from 'react-icons/ri';
import { RxExit } from 'react-icons/rx';
import { BsExclamationCircle } from 'react-icons/bs';
import { Input as AntdInput } from "antd";
import { message } from 'antd';
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "src/firebase/config";
import { toast } from "react-toastify";
const HeaderStyled = styled.div`
  display: flex;
  justify-content: space-between;
  height: 56px;
  padding: 0 16px;
  align-items: center;
  border-bottom: 1px solid rgb(230, 230, 230);

  .header {
    &__info {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    &__title {
      margin: 0;
      font-weight: bold;
    }

    &__description {
      font-size: 12px;
    }
  }
`;

const ButtonGroupStyled = styled.div`
  display: flex;
  align-items: center;
`;

const WrapperStyled = styled.div`
  height: 100vh;
`;

const ContentStyled = styled.div`
  height: calc(100% - 56px);
  display: flex;
  flex-direction: column;
  padding: 0 11px;
  justify-content: flex-end;
`;

const FormStyled = styled(Form)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 2px 2px 0;
  border: 1px solid rgb(230, 230, 230);
  border-radius: 2px;

  .ant-form-item {
    flex: 1;
    margin-bottom: 0;
  }
`;

const MessageListStyled = styled.div`
  max-height: 100%;
  overflow-y: auto;
`;

interface ChatWindowProps {
    width: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ width }) => {
    const { selectedRoom, members, setIsInviteMemberVisible, setIsCalling, isCalling } =
        useContext(AppContext);
    const authContext = React.useContext(AuthContext);
    const uid = authContext?.user.uid;
    const photoURL = authContext?.user.photoURL;
    const displayName = authContext?.user.displayName || authContext?.user.email;
    const [inputValue, setInputValue] = useState("");
    const [form] = Form.useForm();
    const inputRef = useRef<InputRef | null>(null);
    const messageListRef = useRef<HTMLDivElement>(null);
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };
    const [open, setOpen] = useState(false);

    const showModal = () => {
        setOpen(true);
    };

    const handleExitGroup = async () => {
        const roomRef = doc(db, "rooms", selectedRoom.displayName); // Thay "rooms" bằng tên của collection và "hoa123" bằng id của tài liệu
        const roomSnapshot = await getDoc(roomRef); // Lấy thông tin của tài liệu "hoa123"

        if (roomSnapshot.exists()) {
            const members = roomSnapshot.data().members; // Lấy mảng member từ tài liệu
            console.log(members)
            // Tìm và xóa phần tử có giá trị "tienma" trong mảng
            const updatedMembers = members.filter((member: any) => member !== uid);

            // Cập nhật lại trường member với mảng đã được cập nhật
            await updateDoc(roomRef, { members: updatedMembers });
            setOpen(false);
            toast.success('Bạn đã rời nhóm chat!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
            if (updatedMembers.length === 0) {
                // Xóa tài liệu "hoa123"
                await deleteDoc(roomRef);
                message.info('nhóm trống đã được xóa');
            }
        } else {
            message.error('lỗi hệ thống!');
        }
    };
    const handleOnSubmit = () => {
        form.validateFields().then(() => {
            if (inputValue.trim() == "") {
                message.error('tin nhắn không được để trống');
            } else {
                addMessage("messages", {
                    text: inputValue,
                    uid,
                    photoURL,
                    roomId: selectedRoom.id,
                    displayName,
                });

                form.resetFields(["message"]);

                // focus to input again after submit
                if (inputRef?.current) {
                    setTimeout(() => {
                        const inputElement = inputRef.current?.input;
                        if (inputElement) {
                            inputElement.focus();
                        }
                    });
                }
            }
        }).catch((errors) => {
            // Hiển thị thông báo lỗi
            message.error('tin nhắn không được để trống');
        });

    };

    const condition = React.useMemo(
        () => ({
            fieldName: "roomId",
            operator: "==",
            compareValue: selectedRoom.id,
        }),
        [selectedRoom.id]
    );

    const messages = useFirestore("messages", condition);

    useEffect(() => {
        // scroll to bottom after message changed
        if (messageListRef?.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight + 50;
        }
    }, [messages]);

    return (
        <WrapperStyled style={{ width: width, transition: "width 0.3s ease", borderLeft: "1px solid #ccc" }}>
            {selectedRoom.id ? (
                <>
                    <HeaderStyled>
                        <div style={{ display: "flex" }}>
                            <div className="header__info">
                                <p className="header__title">{selectedRoom.displayName}</p>
                                <span className="header__description">{selectedRoom.description}</span>

                            </div>
                            <Tooltip title={"Rời khỏi nhóm"}>
                                <Button
                                    icon={<RxExit />}
                                    type="text"
                                    onClick={showModal}
                                ></Button>
                            </Tooltip>
                            <Modal
                                title="Rời khỏi nhóm chat?"
                                centered
                                open={open}
                                onOk={handleExitGroup}
                                onCancel={() => { setOpen(false); }}
                                width={500}
                            >
                                <p>Bạn sẽ không nhận được tin nhắn từ cuộc trò chuyện này nữa. Mọi người sẽ thấy bạn rời nhóm <strong>{selectedRoom.displayName}</strong>. </p>
                            </Modal>
                        </div>
                        <ButtonGroupStyled>

                            {!isCalling ? (
                                <Tooltip title={"Calling"}>
                                    <Button
                                        icon={<AiFillVideoCamera />}
                                        type="text"
                                        onClick={() => {
                                            setIsCalling(!isCalling);
                                        }}
                                    ></Button>
                                </Tooltip>
                            ) : (
                                <></>
                            )}

                            <Button
                                icon={<RiUserAddLine />}
                                type="text"
                                onClick={() => setIsInviteMemberVisible(true)}
                            >
                                Mời
                            </Button>
                            <Avatar.Group size="small" maxCount={2}>
                                {members.map((member: any) => (
                                    <Tooltip title={member.displayName} key={member.id}>
                                        <Avatar src={member.photoURL}>
                                            {member.photoURL ? "" : member.displayName?.charAt(0)?.toUpperCase()}
                                        </Avatar>
                                    </Tooltip>
                                ))}
                            </Avatar.Group>
                        </ButtonGroupStyled>
                    </HeaderStyled>
                    <ContentStyled>
                        <MessageListStyled ref={messageListRef}>
                            {messages.map((mes) => (
                                <Message
                                    key={mes.id}
                                    text={mes.text}
                                    photoURL={mes.photoURL}
                                    displayName={mes.displayName}
                                    createdAt={mes.createdAt}
                                />
                            ))}
                        </MessageListStyled>
                        <FormStyled form={form}>
                            <Form.Item name="message" rules={[
                                {
                                    required: true,
                                    message: ""
                                },
                            ]}>
                                <AntdInput
                                    ref={inputRef}
                                    onChange={handleInputChange}
                                    onPressEnter={handleOnSubmit}
                                    placeholder="Nhập tin nhắn..."
                                    bordered={false}
                                    autoComplete="off"
                                />
                            </Form.Item>
                            <Button type="primary" onClick={handleOnSubmit}>
                                Gửi
                            </Button>
                        </FormStyled>
                    </ContentStyled>
                </>
            ) : (
                <Alert message="Hãy chọn phòng" type="info" showIcon style={{ margin: 5 }} closable />
            )}
        </WrapperStyled>
    );
};

export default ChatWindow;