import firebase from "firebase/compat/app";
import "firebase/compat/auth"; //authentication for firebase
import "firebase/compat/firestore";

const app = firebase.initializeApp({
  apiKey: "AIzaSyBZmfXc7OkmbklmrOJ7oPzODZUWf1RPao0",
  authDomain: "demuse-2db95.firebaseapp.com",
  projectId: "demuse-2db95",
  storageBucket: "demuse-2db95.appspot.com",
  messagingSenderId: "899502861223",
  appId: "1:899502861223:web:8c4b83059168a4d530a482",
  measurementId: "G-D91BQE5LN0",
});
export const db = firebase.firestore();

export const fieldValue = firebase.firestore.FieldValue;

export const auth = app.auth(); //authentication

export default app;
