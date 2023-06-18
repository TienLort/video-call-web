import React, { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, query, orderBy, where, onSnapshot, QuerySnapshot, DocumentData } from "firebase/firestore";

interface Condition {
  fieldName: string;
  operator: any;
  compareValue: any;
}

const useFirestore = (collectionData: string, condition?: Condition) => {
  const [documents, setDocuments] = useState<DocumentData[]>([]);

  useEffect(() => {
    const collectionRef = collection(db, collectionData);
    let queryRef = query(collectionRef, orderBy("createdAt"));
    if (condition) {
      if (!condition.compareValue || !condition.compareValue.length) {
        // reset documents data
        setDocuments([]);
        return;
      }

      queryRef = query(
        collectionRef,
        where(condition.fieldName, condition.operator, condition.compareValue)
      );
    }

    const unsubscribe = onSnapshot(queryRef, (snapshot: QuerySnapshot) => {
      const documents = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      setDocuments(documents);
    });

    return unsubscribe;
  }, [collectionData, condition]);

  return documents;
};

export default useFirestore;