import { db } from "./config";
import { collection, doc, setDoc } from "firebase/firestore";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

export const addDocument = async (collectionData: string, data: any) => {
  const { FieldValue } = firebase.firestore;
  const collectionRef = collection(db, collectionData);

  await setDoc(doc(collectionRef, data.displayName), {
    ...data,
    createdAt: FieldValue.serverTimestamp(),
  });
};

export const addMessage = async (collectionData: string, data: any) => {
  const { FieldValue } = firebase.firestore;
  const collectionRef = collection(db, collectionData);
  const time = new Date().valueOf();
  await setDoc(doc(collectionRef, String(time)), {
    ...data,
    createdAt: FieldValue.serverTimestamp(),
  });
};

// Tạo keywords cho displayName, sử dụng cho tìm kiếm
export const generateKeywords = (displayName: string) => {
  const name = displayName.split(" ").filter((word) => word);

  const length = name.length;
  let flagArray: boolean[] = [];
  let result: string[] = [];
  let stringArray: string[] = [];

  for (let i = 0; i < length; i++) {
    flagArray[i] = false;
  }

  const createKeywords = (name: string) => {
    const arrName: string[] = [];
    let curName = "";
    name.split("").forEach((letter) => {
      curName += letter;
      arrName.push(curName);
    });
    return arrName;
  };

  function findPermutation(k: number) {
    for (let i = 0; i < length; i++) {
      if (!flagArray[i]) {
        flagArray[i] = true;
        result[k] = name[i];

        if (k === length - 1) {
          stringArray.push(result.join(" "));
        }

        findPermutation(k + 1);
        flagArray[i] = false;
      }
    }
  }

  findPermutation(0);

  const keywords = stringArray.reduce((acc: string[], cur) => {
    const words = createKeywords(cur);
    return [...acc, ...words];
  }, []);

  return keywords;
};
