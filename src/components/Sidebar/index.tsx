import React from "react";
import { Row, Col } from "antd";
import styled from "styled-components";
import UserInfo from "../UserInfo";
import RoomList from "../RoomList";

const SidebarStyled = styled.div`
  background: #443e36;
  color: white;
  height: 100vh;
`;

const Sidebar = () => {
    return (
        <SidebarStyled>
            <Row>
                <Col span={24}>
                    <UserInfo />
                </Col>
                <Col span={24}>
                    <RoomList />
                </Col>
            </Row>
        </SidebarStyled>
    );
};

export default Sidebar;
