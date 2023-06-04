import { initializeApp } from "firebase/app";
import "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBnMJz5wrjTwejniZjnsHQeB6fbo291cts",
  authDomain: "videocall1-51243.firebaseapp.com",
  projectId: "videocall1-51243",
  storageBucket: "videocall1-51243.appspot.com",
  messagingSenderId: "228856004081",
  appId: "1:228856004081:web:b5d4c7d60f9e0311afd850",
  measurementId: "G-E9HMCGRRHL",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

if (window.location.hostname === "localhost") {
  // connectAuthEmulator(auth, "http://localhost:9099");
  // connectFirestoreEmulator(db, "localhost", 8080);
}
export { db, auth };
