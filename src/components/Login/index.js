import React, { useState } from "react";
import { FacebookFilled, GoogleOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import {
  FacebookAuthProvider,
  signInWithPopup,
  GoogleAuthProvider,
  getAdditionalUserInfo,
} from "firebase/auth";
import { auth } from "../../firebase/config";
import { addDocument, generateKeywords } from "../../firebase/services";
import "./login.scss";

const fbProvider = new FacebookAuthProvider();
const googleProvider = new GoogleAuthProvider();

const Login = () => {
  const [isRegister, setIsRegister] = useState(true);
  const navigate = useNavigate();

  const handleLogin = (provider) => {
    signInWithPopup(auth, provider).then((result) => {
      const user = result.user;
      const additionalUserInfo = getAdditionalUserInfo(result);
      console.log(additionalUserInfo);
      if (additionalUserInfo?.isNewUser) {
        console.log("vao them usser");
        addDocument("Users", {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          uid: user.uid,
          providerId: additionalUserInfo.providerId,
          keywords: generateKeywords(user.displayName?.toLowerCase()),
        });
      }
    });
  };

  return (
    <div className={isRegister ? "login" : "login right-panel-active"}>
      <div className="form-container sign-up-container">
        <form>
          <h1>Create Account</h1>
          <span>Use your email for registration</span>
          <input type="text" placeholder="Name" autoComplete="off" />
          <input type="email" placeholder="Email" autoComplete="off" />
          <input type="password" placeholder="Password" autoComplete="off" />
          <button
            className="buttonLog"
            onClick={() => {
              navigate("/chat");
            }}
          >
            Sign Up
          </button>
        </form>
      </div>
      <div className="form-container sign-in-container">
        <form>
          <h1>Sign in</h1>
          <div className="social-container">
            <Button
              type="primary"
              shape="circle"
              icon={<FacebookFilled />}
              size="large"
              onClick={() => handleLogin(fbProvider)}
            />
            <Button
              type="primary"
              shape="circle"
              icon={<GoogleOutlined />}
              size="large"
              onClick={() => handleLogin(googleProvider)}
            />
          </div>
          <span>or use your account</span>
          <input type="email" placeholder="Email" autoComplete="off" />
          <input type="password" placeholder="Password" autoComplete="off" />
          <span>Forgot your password?</span>
          <button
            onClick={() => {
              navigate("/chat");
            }}
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
