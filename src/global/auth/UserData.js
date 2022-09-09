/*
This useContext extracts authenticated user information from the firestore database
To get user's information that is not saved in the useAuth context,
import {useUserData} and deconstruct it:
    const {userData} = useUserData();
*/

//Fetch user info from the database Firestore
import React, { useContext, useState, useEffect } from "react";
import { db } from "../../utils/firebase";
import { useAuth } from "./Authentication";

//Retrieve the  user data from the firestore database
const UserData = React.createContext();

export const useUserData = () => {
  return useContext(UserData);
};

export const UserDataProvider = ({ children }) => {
  const [userData, setUserData] = useState();
  const [loading, setLoading] = useState(true);

  const { currentUser } = useAuth();

  //only runs when the component mounts
  useEffect(() => {
    if (currentUser) {
      const data = async () => {
        await db
          .collection("user")
          .doc(currentUser.uid)
          .get()
          .then((querySnapshot) => {
            setUserData({ id: querySnapshot.id, ...querySnapshot.data() });
          });

        setLoading(false);
      };

      data();
    }
  }, [currentUser]);

  const value = { userData };

  return (
    <UserData.Provider value={value}>
      {!loading && children /* Don't render the app until a user is defined*/}
    </UserData.Provider>
  );
};
