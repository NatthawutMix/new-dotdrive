import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setUser,
  setPath,
  setOpenSideBar,
  setExitUpload,
} from "../redux/services";

import { auth } from "../firebase";
import { useHistory } from "react-router-dom";
import "../css/SideMenu.css";

import "../css/SideMenuBar.css";

import DehazeRoundedIcon from "@material-ui/icons/DehazeRounded";

import DialogAgreement from "../util/DialogAgreement";
import { IconButton } from "@material-ui/core";

const SideMenuBar = () => {
  const dispatch = useDispatch();
  const openSideBar = useSelector((state) => state.service.openSideBar);

  const [agreement, setAgreement] = useState(false);

  const history = useHistory();

  const SignOut = () => {
    dispatch(setPath([]));
    auth.signOut();
    dispatch(setUser([]));
    history.push("/");
  };

  const handleCancelUpload = () => {
    dispatch(setExitUpload(true));
    setAgreement(false);
    setTimeout(() => {
      SignOut();
    }, 100);
  };
  return (
    <div className="sidemenubar__container">
      <div className="sidemenubar__bullets">
        <IconButton
          style={{ backgroundColor: "#023046", padding: "5px" }}
          onClick={() => dispatch(setOpenSideBar(!openSideBar))}
        >
          <DehazeRoundedIcon style={{ color: "#ffffff" }} />
        </IconButton>
      </div>

      {/* <button
        className="sidemenubar__bullets"
        onClick={() => dispatch(setOpenSideBar(!openSideBar))}
      >
        <img
          style={{ width: "50%", marginTop: "15px", marginBottom: "15px" }}
          src={Bullets}
          alt=""
        />
      </button>
      <div className="sidemenubar__profile__hide">
        <Image
          className="sidebar__image__hide"
          src={detail && detail.img_profile ? detail.img_profile : Profile}
          roundedCircle
        />
        <br />
      </div>
      <div className="sidebarmenu___menubox__show">
        {user ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Link
              to="/dashboard"
              style={{
                textDecoration: "none",
              }}
            >
              <button
                className={
                  pathMenu === "dashboard"
                    ? "sidemenubar__button__selected"
                    : "sidemenubar__button"
                }
              >
                <img src={IconDashboard} alt="" />
              </button>
            </Link>

            <Link to="/myCloud" style={{ textDecoration: "none" }}>
              <button
                className={
                  pathMenu === "myCloud"
                    ? "sidemenubar__button__selected"
                    : "sidemenubar__button"
                }
              >
                <img src={IconCloud} alt="" />
              </button>
            </Link>

            <Link to="/share" style={{ textDecoration: "none" }}>
              <button
                className={
                  pathMenu === "share"
                    ? "sidemenubar__button__selected"
                    : "sidemenubar__button"
                }
              >
                <img src={IconShare} alt="" />
              </button>
            </Link>

            <Link to="/setting" style={{ textDecoration: "none" }}>
              <button
                className={
                  pathMenu === "setting"
                    ? "sidemenubar__button__selected"
                    : "sidemenubar__button"
                }
              >
                <img src={IconSetting} alt="" />
              </button>
            </Link>

            <Link to="/bin" style={{ textDecoration: "none" }}>
              <button
                className={
                  pathMenu === "bin"
                    ? "sidemenubar__button__selected"
                    : "sidemenubar__button"
                }
              >
                <img style={{ padding: "3px" }} src={IconDelete} alt="" />
              </button>
            </Link>
          </div>
        ) : (
          ""
        )}
        <div style={{ marginTop: "20px" }}>
          {user ? (
            <button className="sidemenubar__logout" onClick={handleSignOut}>
              <img src={IconLogout} alt="" />
            </button>
          ) : (
            <Link to={"/login"}>
              <button className="sidemenubar__logout">
                <img src={IconLogout} alt="" />
              </button>
            </Link>
          )}
        </div>
      </div> */}

      <DialogAgreement
        title={`ต้องการล็อคเอ้าค์ ?`}
        description={`คุณยังยังอัพโหลดไม่เสร็จ`}
        open={agreement}
        handleClose={() => setAgreement(false)}
        handleAgree={handleCancelUpload}
        textClose={"ยกเลิก"}
        textSubmit={"ยืนยัน"}
      />
    </div>
  );
};

export default SideMenuBar;
