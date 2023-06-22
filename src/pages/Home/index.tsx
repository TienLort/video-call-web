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

    <div style={{ width: "100%", display: "flex" }}>
      {isCalling && <CallingRoom width={width.renderContent} />}
      <ChatWindow width={width.collection} />
    </div>
  );
};

export default Home