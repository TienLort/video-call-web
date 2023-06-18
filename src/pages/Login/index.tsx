import React, { useContext, useState } from "react";
import { BsFacebook, BsGoogle } from 'react-icons/bs';

import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import {
  FacebookAuthProvider,
  signInWithPopup,
  GoogleAuthProvider,
  getAdditionalUserInfo,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  getAuth
} from "firebase/auth";
import { auth, db } from "../../firebase/config";
import { addDocument, generateKeywords } from "../../firebase/services";
import "./login.css";
import { collection, getDocs, query, where } from "firebase/firestore";
import { AuthContext } from "src/Context/AuthProvider";

const fbProvider = new FacebookAuthProvider();
const googleProvider = new GoogleAuthProvider();

const Login = () => {
  const [isRegister, setIsRegister] = useState(true);
  const navigate = useNavigate();
  const API_URL = "http://127.0.0.1:8000"
  const [emailLogin, setEmailLogin] = useState("");
  const [passwordLogin, setPasswordLogin] = useState("");
  const [emailRegis, setEmailRegis] = useState("");
  const [nameRegis, setNameRegis] = useState("");
  const [passwordRegis, setPasswordRegis] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const authContext = useContext(AuthContext);
  const handleLogin = (provider: any) => {
    signInWithPopup(auth, provider).then((result) => {
      const user = result.user;
      const additionalUserInfo = getAdditionalUserInfo(result);
      console.log(additionalUserInfo)
      if (additionalUserInfo?.isNewUser) {
        addDocument("Users", {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          uid: user.uid,
          providerId: additionalUserInfo.providerId,
          keywords: generateKeywords(user.displayName?.toLowerCase() ?? ""),
        });
      }
    });
  };
  const handleSubmitLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!emailLogin || !passwordLogin) return console.log("Loi roi kia");
    const data = {
      emailLogin,
      passwordLogin,
    };
    signInWithEmailAndPassword(auth, data.emailLogin, data.passwordLogin)
      .then(async (userCredential) => {
        // Signed in 
        const user = userCredential.user;
        console.log("user tu login", user)
        const userRef = collection(db, "Users");
        const q = query(userRef, where("email", "==", user.email));
        const userSnapshot = await getDocs(q);
        userSnapshot.forEach((doc) => {
          console.log(doc.data().displayName);
        });
      })
      .catch((error) => {
        console.log(error);
      });

  };

  const handleSubmitRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!nameRegis || !emailRegis || !passwordRegis)
      return console.log("Please fill in all fields!");

    if (passwordRegis !== confirmPassword)
      return console.log("Passwords donot match!");

    if (passwordRegis.length < 6) {
      return console.log("Password must be of length 3 or more");
    }
    // if (
    //   !/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/.test(password)
    // ) {
    //   return console.log(
    //     "Password must have alteast a number and a special character!"
    //   );
    const data = {
      nameRegis,
      emailRegis,
      passwordRegis,
    };
    createUserWithEmailAndPassword(auth, data.emailRegis, data.passwordRegis).then(async (userCredential) => {
      // Signed in 
      const user = userCredential.user;
      const additionalUserInfo = getAdditionalUserInfo(userCredential);
      if (additionalUserInfo?.isNewUser) {
        const currentUser = auth.currentUser;
        if (currentUser) {
          authContext?.updateUser(nameRegis, user.email, user.uid, user.photoURL)
          await updateProfile(currentUser, {
            displayName: nameRegis
          });
        }
        const payload = {
          userName: nameRegis,
          userDisplayName: user.email,
          userPassword: passwordRegis
        }
        console.log(payload)
        await fetch(`${API_URL}/api/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
          .then(response => {
            if (response.ok) {
              // Chuyển đổi phản hồi từ JSON sang đối tượng JavaScript
              addDocument("Users", {
                displayName: nameRegis,
                email: user.email,
                photoURL: user.photoURL,
                uid: user.uid,
                providerId: additionalUserInfo.providerId,
                keywords: generateKeywords(nameRegis?.toLowerCase() ?? ""),
              });
            } else {
              console.log("Request failed");
              throw new Error('Request failed');
            }
          })
          .catch(err => {
            console.log(err);
          });


      }
    })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
        console.log(error);
        if (errorCode === "auth/email-already-in-use") {
          console.log("Email Already Exists!");
        }
      });
  }
  return (
    <div className={isRegister ? "login" : "login right-panel-active"}>
      <div className="form-container sign-up-container">
        <form onSubmit={handleSubmitRegister}>
          <h1>Create Account</h1>
          <span>Use your email for registration</span>
          <input
            type="text"
            placeholder="Name"
            autoComplete="off"
            value={nameRegis}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setNameRegis(e.target.value)
            }
          />
          <input type="email" placeholder="Email" autoComplete="off" value={emailRegis}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmailRegis(e.target.value)
            } />
          <input type="password" placeholder="Password" autoComplete="off" value={passwordRegis}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPasswordRegis(e.target.value)
            } />
          <input type="password" placeholder="Re-type Password" autoComplete="off" value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setConfirmPassword(e.target.value)
            } />
          <button
            className="buttonLog"
            // onClick={() => {
            //   navigate("/chat");
            // }}
            type="submit"
          >
            Sign Up
          </button>
        </form>
      </div>
      <div className="form-container sign-in-container">
        <form onSubmit={handleSubmitLogin}>
          <h1>Sign in</h1>
          <div className="social-container">
            <Button
              type="primary"
              shape="circle"
              icon={<BsFacebook />}
              size="large"
              onClick={() => handleLogin(fbProvider)}
            />
            <Button
              type="primary"
              shape="circle"
              icon={<BsGoogle />}
              size="large"
              onClick={() => handleLogin(googleProvider)}
            />
          </div>
          <span>or use your account</span>
          <input type="email" placeholder="Email" autoComplete="off" value={emailLogin}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmailLogin(e.target.value)
            } />
          <input type="password" placeholder="Password" autoComplete="off" value={passwordLogin}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPasswordLogin(e.target.value)
            } />
          <button
            // onClick={() => {
            //   navigate("/chat");
            // }}
            type="submit"
            className="buttonLog"
          >
            Sign In
          </button>
        </form>
      </div>
      <div className="overlay-container">
        <div className="overlay">
          <div className="overlay-panel overlay-left">
            <h1>Welcome Back!</h1>
            <p>To keep connected with us please login with your personal info</p>
            <button className="buttonLog ghost" onClick={() => setIsRegister((pre) => !pre)}>
              Sign In
            </button>
          </div>
          <div className="overlay-panel overlay-right">
            <h1>Hello, Friend!</h1>
            <p>Enter your personal details and start journey with us</p>
            <button className="buttonLog ghost" onClick={() => setIsRegister((pre) => !pre)}>
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
