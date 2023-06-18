import { Col, Row } from "antd";
import { useContext } from "react";
import Sidebar from "src/components/Sidebar";
import { AppContext } from "../../Context/AppProvider";

interface IProps {
  children: JSX.Element;
}

const MainLayout = (props: IProps) => {
  const { isCalling } = useContext(AppContext);
  return (
    <div>
      <Row>
        <Col span={isCalling ? 4 : 6} style={{ transition: "all 0.3s ease" }}>
          <Sidebar />
        </Col>
        <Col span={isCalling ? 20 : 18} style={{ transition: "all 0.3s ease", height: '100vh', overflowY: 'hidden' }}>
          {/* <div style={{ width: "100%", display: "flex" }}>
            {isCalling && <CallingRoom width={width.renderContent} />}
            <ChatWindow width={width.collection} />
            <>
              
            </>
          </div> */}
          {props.children}
        </Col>
      </Row>
      {/* <Room /> */}
    </div>


  );
};

export default MainLayout;
