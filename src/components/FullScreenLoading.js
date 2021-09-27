import React from "react";
import DD from "../images/DashCloud/LogoDD.png";
import DOT from "../images/DashCloud/DOT.svg";
import DRIVE from "../images/DashCloud/DRIVE.svg";

const FullScreenLoading = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage:
          "linear-gradient(181.31deg, #02c7cd 8.74%, #026383 98.88%)",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}
      >
        <img
          style={{ marginRight: "20px", marginTop: "20px" }}
          src={DD}
          alt=""
        />
        <img
          style={{ marginRight: "10px", marginTop: "20px" }}
          src={DOT}
          alt=""
        />
        <img style={{ marginTop: "20px" }} src={DRIVE} alt="" />

        <h1 style={{ marginTop: "20px" }}>Loading</h1>
      </div>
    </div>
  );
};

export default FullScreenLoading;
