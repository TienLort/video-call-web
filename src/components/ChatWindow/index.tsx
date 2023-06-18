import React, { useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Button, Tooltip, Avatar, Form, Alert, InputRef, Modal } from "antd";
import Message from "../Message";
import { AppContext } from "../../Context/AppProvider";
import { addMessage } from "../../firebase/services";
import { AuthContext } from "../../Context/AuthProvider";
import useFirestore from "../../hooks/useFirestore";
import { AiFillVideoCamera } from 'react-icons/ai';
import { RiUserAddLine } from 'react-icons/ri';
import { Input as AntdInput } from "antd";
import html2canvas from 'html2canvas';
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
    const displayName = authContext?.user.displayName;
    const [inputValue, setInputValue] = useState("");
    const [form] = Form.useForm();
    const inputRef = useRef<InputRef | null>(null);
    const messageListRef = useRef<HTMLDivElement>(null);
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };
    const handleOnSubmit = () => {
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
                        <div className="header__info">
                            <p className="header__title">{selectedRoom.displayName}</p>
                            <span className="header__description">{selectedRoom.description}</span>
                        </div>
                        <ButtonGroupStyled>
                            {!isCalling ? (
                                <Button
                                    icon={<AiFillVideoCamera />}
                                    type="text"
                                    onClick={() => {
                                        setIsCalling(!isCalling);
                                    }}
                                ></Button>
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
                            <Form.Item name="message">
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