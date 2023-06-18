import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spin } from "antd";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged, updateProfile, User } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
export interface AuthUser {
  displayName: string | null;
  email: string | null;
  uid: string | null;
  photoURL: string | null;
}

export interface AuthContextProps {
  user: AuthUser;
  updateUser: (displayName: string | null, email: string | null, uid: string | null, photoURL: string | null) => void
}

export const AuthContext = React.createContext<AuthContextProps | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser>({
    displayName: null,
    email: null,
    uid: null,
    photoURL: null,
  });
  const updateUser = (displayName: string | null, email: string | null, uid: string | null, photoURL: string | null) => {
    setUser({ displayName, email, uid, photoURL });
  };
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  React.useEffect(() => {
    const unsubscribed = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        if (user.displayName == null) {
          const userRef = collection(db, "Users");
          const q = query(userRef, where("email", "==", user.email));
          const userSnapshot = await getDocs(q);
          userSnapshot.forEach(async (doc) => {
            console.log(doc.data().displayName);
            await updateProfile(user, {
              displayName: doc.data().displayName
            });
          });
        }
        const { displayName, email, uid, photoURL } = user;
        console.log(user)
        setUser({
          displayName,
          email,
          uid,
          photoURL,
        });
        setIsLoading(false);
        navigate("/");
        return;
      }
      // reset user info
      setUser({
        displayName: null,
        email: null,
        uid: null,
        photoURL: null,
      });
      setIsLoading(false);
      navigate("/login");
    });

    // clean function
    return () => {
      unsubscribed();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, updateUser }}>
      {isLoading ? (
        <Spin style={{ position: "fixed", inset: 0 }} />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export default AuthProvider;