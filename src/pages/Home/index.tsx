import { useContext, useEffect, useState } from "react";
import CallingRoom from "src/components/CallingRoom";
import ChatWindow from "src/components/ChatWindow";
import { AppContext } from "../../Context/AppProvider";

const Home = () => {
  const [width, setWidth] = useState({
    collection: "100%",
    renderContent: "0",
  });
  const { isCalling } = useContext(AppContext);
  useEffect(() => {
    if (isCalling) {
      setWidth({
        collection: "30%",
        renderContent: "70%",
      });
    } else {
      setWidth({
        collection: "100%",
        renderContent: "0%",
      });
    }
  }, [isCalling]);
  return (
    // <div>
    //   <Row>
    //     <Col span={isCalling ? 4 : 6} style={{ transition: "all 0.3s ease" }}>
    //       <Sidebar />
    //     </Col>
    //     <Col span={isCalling ? 20 : 18} style={{ transition: "all 0.3s ease" }}>
    <div style={{ width: "100%", display: "flex" }}>
      {isCalling && <CallingRoom width={width.renderContent} />}
      <ChatWindow width={width.collection} />
    </div>
    //     </Col>
    //   </Row>
    //    <Room /> 
    // </div>
  );
};

export default Home