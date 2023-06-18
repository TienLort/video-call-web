import { initializeApp } from "firebase/app";
import "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBZ3JyG41ZMTQstR3InzichyadkOWHD0ec",
  authDomain: "videocalldb.firebaseapp.com",
  projectId: "videocalldb",
  storageBucket: "videocalldb.appspot.com",
  messagingSenderId: "818399928664",
  appId: "1:818399928664:web:7dfc2a425bc0618e10852d",
  measurementId: "G-Z8KCPQH1L2"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

if (window.location.hostname === "localhost") {
  // connectAuthEmulator(auth, "http://localhost:9099");
  // connectFirestoreEmulator(db, "localhost", 8080);
  // connectStorageEmulator(storage, "localhost", 9199);
}
export { db, auth, storage };
