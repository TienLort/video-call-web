import React, { useContext, useState } from "react";
import { Form, Modal, Select, Spin, Avatar } from "antd";
import { AppContext } from "../../Context/AppProvider";
import { debounce } from "lodash";
import { db } from "../../firebase/config";
import {
  collection,
  query,
  where,
  updateDoc,
  limit,
  getDocs,
  doc,
} from "firebase/firestore";

interface Option {
  label: string;
  value: string;
  photoURL: string;
}

interface DebounceSelectProps {
  mode: "multiple" | "tags" | undefined;
  name: string;
  label: string;
  value: Option[]; // Add the value prop here
  placeholder: string;
  fetchOptions: (search: string, curMembers: string[]) => Promise<Option[]>;
  onChange: (newValue: Option[]) => void;
  style: React.CSSProperties;
  curMembers: string[];
  debounceTimeout?: number;
}

function DebounceSelect({
  fetchOptions,
  debounceTimeout = 300,
  curMembers,
  ...props
}: DebounceSelectProps) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);

  const debounceFetcher = React.useMemo(() => {
    const loadOptions = (value: string) => {
      setOptions([]);
      setFetching(true);

      fetchOptions(value, curMembers).then((newOptions) => {
        setOptions(newOptions);
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [debounceTimeout, fetchOptions, curMembers]);

  React.useEffect(() => {
    return () => {
      // clear when unmount
      setOptions([]);
    };
  }, []);

  return (
    <Select
      labelInValue
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Spin size="small" /> : null}
      {...props}
    >
      {options.map((opt) => (
        <Select.Option key={opt.value} value={opt.value} title={opt.label}>
          <Avatar size="small" src={opt.photoURL}>
            {opt.photoURL ? "" : opt.label?.charAt(0)?.toUpperCase()}
          </Avatar>
          {` ${opt.label}`}
        </Select.Option>
      ))}
    </Select>
  );
}

async function fetchUserList(search: string, curMembers: string[]): Promise<Option[]> {
  const collectionRef = collection(db, "Users");
  const q = query(
    collectionRef,
    where("keywords", "array-contains", search?.toLowerCase()),
    limit(20)
  );
  const snapshot = await getDocs(q);
  const documents = snapshot.docs.map((doc) => ({
    label: doc.data().displayName,
    value: doc.data().uid,
    photoURL: doc.data().photoURL,
  }));

  const filteredDocuments = documents.filter(
    (opt) => !curMembers.includes(opt.value)
  );

  return filteredDocuments;
}

const InviteMemberModal: React.FC = () => {
  const { isInviteMemberVisible, setIsInviteMemberVisible, selectedRoomId, selectedRoom } =
    useContext(AppContext);
  const [value, setValue] = useState<Option[]>([]);
  const [form] = Form.useForm();

  const handleOk = async () => {
    // reset form value
    form.resetFields();
    setValue([]);

    // update members in current room
    const roomRef = doc(collection(db, "rooms"), selectedRoomId);

    await updateDoc(roomRef, {
      members: [...selectedRoom.members, ...value.map((val) => val.value)],
    });

    setIsInviteMemberVisible(false);
  };

  const handleCancel = () => {
    // reset form value
    form.resetFields();
    setValue([]);

    setIsInviteMemberVisible(false);
  };

  return (
    <div>
      <Modal
        title="Mời thêm thành viên"
        open={isInviteMemberVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        destroyOnClose={true}
      >
        <Form form={form} layout="vertical">
          <DebounceSelect
            mode="multiple"
            name="search-user"
            label="Tên các thành viên"
            value={value}
            placeholder="Nhập tên thành viên"
            fetchOptions={fetchUserList}
            onChange={(newValue: Option[]) => setValue(newValue)}
            style={{ width: "100%" }}
            curMembers={selectedRoom.members}
          />
        </Form>
      </Modal>
    </div>
  );
};

export default InviteMemberModal;