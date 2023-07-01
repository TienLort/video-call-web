import React from "react";
import { Button, Avatar, Typography } from "antd";
import styled from "styled-components";

import { auth } from "../../firebase/config";
import { AuthContext } from "../../Context/AuthProvider";
import { AppContext } from "../../Context/AppProvider";
const WrapperStyled = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #fff;

  .username {
    color: white;
    margin-left: 5px;
  }
`;

const UserInfo = () => {
    const authContext = React.useContext(AuthContext);
    const displayName = authContext?.user.displayName || authContext?.user.email;
    const photoURL = authContext?.user.photoURL;
    const { clearState } = React.useContext(AppContext);
    console.log(displayName)
    return (
        <WrapperStyled>
            <div>
                <Avatar src={photoURL}>{photoURL ? "" : displayName?.charAt(0)?.toUpperCase()}</Avatar>
                <Typography.Text className="username">{displayName}</Typography.Text>
            </div>
            <Button
                ghost
                onClick={() => {
                    // clear state in App Provider when logout
                    clearState();
                    auth.signOut();
                }}
            >
                Đăng xuất
            </Button>
        </WrapperStyled>
    );
};

export default UserInfo;
