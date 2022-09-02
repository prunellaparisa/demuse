/*
This useContext authenticate a user by using Firebase Authentication
To get user's information such as email, username, userID,...
import {useAuth} and deconstruct it:
    const {currentUser} = useAuth();
*/
import React, { useContext, useState, useEffect } from "react";
import { auth } from "../../utils/firebase";
import firebase from "firebase/compat/app";
import "firebase/compat/app-check";

const Authentication = React.createContext();

//Authenticate a user: get their current info, sign in, sign up, sign out
export const useAuth = () => {
  return useContext(Authentication);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState();
  const [loading, setLoading] = useState(true);

  //call the auth function from firebase
  async function signUp(user) {
    return auth.createUserWithEmailAndPassword(user.email, user.password);
  }

  function signIn(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
  }

  function signOut() {
    auth.signOut();
    setCurrentUser();
  }

  function resetPassword(email) {
    return auth.sendPasswordResetEmail(email);
  }

  function updateEmail(email) {
    return auth.currentUser.updateEmail(email);
  }

  async function updatePassword(oldPass, newPass) {
    await reauthenticate(oldPass);
    return auth.currentUser.updatePassword(newPass);
  }
  //reauthenticate the user to update details
  const reauthenticate = (currentPassword) => {
    const cred = firebase.auth.EmailAuthProvider.credential(
      auth.currentUser.email,
      currentPassword
    );
    return auth.currentUser.reauthenticateWithCredential(cred);
  };

  //only runs when the component mounts
  useEffect(() => {
    //Firebase notify if a user is created
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false); //user has signed up
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateEmail,
    updatePassword,
  };

  return (
    <Authentication.Provider value={value}>
      {!loading && children /* Don't render the app until a user is defined*/}
    </Authentication.Provider>
  );
};
