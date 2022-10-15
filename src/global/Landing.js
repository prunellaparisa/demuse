import React from "react";
import CustomerLanding from "../customer/landing";
import AdminLanding from "../admin/landing";
import { useUserData } from "./auth/UserData";

const Landing = ({ setUserData }) => {
  const { userData } = useUserData();
  setUserData(userData);
  // const docExists = async () => (await db.collection("teacher-info").doc(currentUser.uid).get()).exists

  return (
    <div>
      {
        //render component based on the user's role
        userData.role === "customer" ? <CustomerLanding /> : <AdminLanding />
      }
    </div>
  );
};

export default Landing;
