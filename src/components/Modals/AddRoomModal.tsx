import React, { useContext } from "react";
import { Form, Modal, Input } from "antd";
import { AppContext } from "../../Context/AppProvider";
import { addDocument } from "../../firebase/services";
import { AuthContext } from "../../Context/AuthProvider";
import { toast } from 'react-toastify';
import { message } from 'antd';
import { collection, getDocs } from "firebase/firestore";
import { db } from "src/firebase/config";
const AddRoomModal = () => {
  const { isAddRoomVisible, setIsAddRoomVisible } = useContext(AppContext);
  const authContext = React.useContext(AuthContext);
  const uid = authContext?.user.uid;
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then(async () => {
      const collectionRef = collection(db, "rooms");
      const querySnapshot = await getDocs(collectionRef);
      let isDuplicate = false;

      querySnapshot.forEach((doc) => {
        if (doc.id === form.getFieldsValue().displayName) {
          isDuplicate = true;
          return;
        }
      });

      if (isDuplicate) {
        message.warning('Tên phòng đã tồn tại, bạn có thể đặt tên khác');
      } else {
        addDocument("rooms", { ...form.getFieldsValue(), members: [uid] });
        form.resetFields();
        toast.success('Tạo phòng thành công!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        setIsAddRoomVisible(false);
      }
    }).catch((errors) => {
      // Hiển thị thông báo lỗi
      message.error('Vui lòng điền đầy đủ thông tin');
    });
  };

  const handleCancel = () => {
    // reset form value
    form.resetFields();

    setIsAddRoomVisible(false);
  };
  return (
    <div>
      <Modal title="Tạo phòng" open={isAddRoomVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} layout="vertical">
          <Form.Item label="Tên phòng" name="displayName" rules={[
            {
              required: true,
              message: "Vui lòng nhập tên phòng",
            },
          ]}>
            <Input placeholder="Nhập tên phòng"
            />
          </Form.Item>
          <Form.Item label="Mô tả" name="description"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mô tả",
              },
            ]}
          >
            <Input.TextArea placeholder="Nhập mô tả" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AddRoomModal;
