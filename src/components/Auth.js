import React, { useState, useEffect } from "react";
// import firebaseConfig from '../config'
import { firebaseApp } from "../firebase";
// import { Router } from "@reach/router";
// import SignIn from "./SigninForm";
// import SignUp from "./SignupForm";
// import ProfilePage from "./ProfilePage";
// import PasswordReset from "./PasswordReset";

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    firebaseApp.auth().onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthProvider;
