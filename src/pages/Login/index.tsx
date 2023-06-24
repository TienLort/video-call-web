import React, { useContext, useMemo, useState } from "react";
import { BsFacebook, BsGoogle } from 'react-icons/bs';

import { Button } from "antd";
import {
  FacebookAuthProvider,
  signInWithPopup,
  GoogleAuthProvider,
  getAdditionalUserInfo,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "../../firebase/config";
import { addDocument, generateKeywords } from "../../firebase/services";
import "./login.css";
import { collection, getDocs, query, where } from "firebase/firestore";
import { AuthContext } from "src/Context/AuthProvider";
import { useForm, SubmitHandler } from "react-hook-form"
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
const fbProvider = new FacebookAuthProvider();
const googleProvider = new GoogleAuthProvider();

interface IFormInput {
  passwordLogin: string
  emailLogin: string
}
interface IFormSignUp {
  passwordRegis: string
  emailRegis: string
  nameRegis: string
  confirmPassword: string
}
const schema = yup.object().shape({
  emailLogin: yup.string().required('Email is required').email('Invalid email format'),
  passwordLogin: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});

const schemaSignUp = yup.object().shape({
  nameRegis: yup.string().required('Please enter your name').min(3, 'Name must be at least 3 characters'),
  emailRegis: yup.string().required('Please enter your email').email('Invalid email format'),
  passwordRegis: yup.string().required('Please enter a password').min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup.string().oneOf([yup.ref('passwordRegis'), null], 'Passwords must match'),
});


const Login = () => {
  const [isRegister, setIsRegister] = useState(true);
  const API_URL = "http://127.0.0.1:8000"
  const [emailRegis, setEmailRegis] = useState("");
  const [nameRegis, setNameRegis] = useState("");
  const [passwordRegis, setPasswordRegis] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const authContext = useContext(AuthContext);
  const { register, handleSubmit, formState: { errors } } = useForm<IFormInput>({
    resolver: yupResolver(schema),
  })

  const { register: signUpRegister, handleSubmit: signUpHandlerSubmit, formState: { errors: signUpErrors } } = useForm<IFormSignUp>({
    resolver: yupResolver(schemaSignUp),
  })

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

  const onSubmitLogin: SubmitHandler<IFormInput> = (data) => {
    signInWithEmailAndPassword(auth, data.emailLogin, data.passwordLogin)
      .then(async (userCredential) => {
        const user = userCredential.user;

        const userRef = collection(db, "Users");
        const q = query(userRef, where("email", "==", user.email));
        const userSnapshot = await getDocs(q);
        userSnapshot.forEach((doc) => {
          console.log(doc.data().displayName);
        });
      })
      .catch((error) => {
        toast.error(`Sai tài khoản hoặc mật khẩu, vui lòng đăng nhập lại!`, {
          position: "bottom-left",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      });
  }

  const onSubmitSignUp: SubmitHandler<IFormSignUp> = (data) => {

    if (!data.nameRegis || !data.emailRegis || !data.passwordRegis)
      return console.log("Please fill in all fields!");

    if (data.passwordRegis !== data.confirmPassword)
      return console.log("Passwords donot match!");

    if (data.passwordRegis.length < 6) {
      return console.log("Password must be of length 3 or more");
    }

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
          userName: data.nameRegis,
          userDisplayName: user.email,
          userPassword: data.passwordRegis
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

              addDocument("Users", {
                displayName: data.nameRegis,
                email: user.email,
                photoURL: user.photoURL,
                uid: user.uid,
                providerId: additionalUserInfo.providerId,
                keywords: generateKeywords(data.nameRegis?.toLowerCase() ?? ""),
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
  };
  return (
    <div className={isRegister ? "login" : "login right-panel-active"}>
      <div className="form-container sign-up-container">
        <form onSubmit={signUpHandlerSubmit(onSubmitSignUp)}>
          <h1>Create Account</h1>
          <span>Use your email for registration</span>
          <input
            type="text"
            placeholder="Name"
            autoComplete="off"
            {...signUpRegister("nameRegis")}
            style={{ border: signUpErrors.nameRegis ? "1px solid red" : "" }} />
          {signUpErrors.nameRegis && <p style={{ margin: 0, color: "red" }}>{signUpErrors.nameRegis.message}</p>}

          <input
            type="email"
            placeholder="Email"
            autoComplete="off"
            {...signUpRegister("emailRegis")}
            style={{ border: signUpErrors.emailRegis ? "1px solid red" : "" }} />
          {signUpErrors.emailRegis && <p style={{ margin: 0, color: "red" }}>{signUpErrors.emailRegis.message}</p>}

          <input
            type="password"
            placeholder="Password"
            autoComplete="off"
            {...signUpRegister("passwordRegis")}
            style={{ border: signUpErrors.passwordRegis ? "1px solid red" : "" }} />
          {signUpErrors.passwordRegis && <p style={{ margin: 0, color: "red" }}>{signUpErrors.passwordRegis.message}</p>}

          <input
            type="password"
            placeholder="Re-type Password"
            autoComplete="off"
            {...signUpRegister("confirmPassword")}
            style={{ border: signUpErrors.confirmPassword ? "1px solid red" : "" }} />
          {signUpErrors.confirmPassword && <p style={{ margin: 0, color: "red" }}>{signUpErrors.confirmPassword.message}</p>}

          <button
            className="buttonLog"
            type="submit"
          >
            Sign Up
          </button>
        </form>
      </div>
      <div className="form-container sign-in-container">
        <form onSubmit={handleSubmit(onSubmitLogin)}>
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
          <input type="email" placeholder="Email" autoComplete="off" {...register("emailLogin")} style={{ border: errors.emailLogin ? "1px solid red" : "" }} />
          {errors.emailLogin && <p style={{ margin: 0, color: "red" }}>{errors.emailLogin.message}</p>}
          <input type="password" placeholder="Password" autoComplete="off" {...register("passwordLogin")} style={{ border: errors.passwordLogin ? "1px solid red" : "" }} />
          {errors.passwordLogin && <p style={{ margin: 0, color: "red" }}>{errors.passwordLogin.message}</p>}
          <button
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
