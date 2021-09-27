import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setUser,
  setPath,
  setOpenSideBar,
  setExitUpload,
} from "../redux/services";

import { auth } from "../firebase";
import { Link, useHistory } from "react-router-dom";
import { useLocation } from "react-router-dom";
import "../css/SideMenu.css";

import { Image } from "react-bootstrap";

import Profile from "../images/PF.png";

// import DeleteSweepIcon from "@material-ui/icons/DeleteSweep";
// import VpnKeyIcon from "@material-ui/icons/VpnKey";
// import StorageIcon from "@material-ui/icons/Storage";
// import DashboardIcon from "@material-ui/icons/Dashboard";
// import SettingsIcon from "@material-ui/icons/Settings";
// import PeopleOutlineIcon from "@material-ui/icons/PeopleOutline";
import DehazeRoundedIcon from "@material-ui/icons/DehazeRounded";
import ExitToAppRoundedIcon from "@material-ui/icons/ExitToAppRounded";

import IconDashboard from "../images/sidebar/IconDashboard.png";
import IconCloud from "../images/sidebar/IconCloud.png";
import IconDelete from "../images/sidebar/IconDelete.png";
import IconShare from "../images/sidebar/IconShare.png";
import IconSetting from "../images/sidebar/IconSetting.png";

import DialogAgreement from "../util/DialogAgreement";
import { IconButton } from "@material-ui/core";

const SideMenu = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.service.user);
  // const sideBarCss = useSelector((state) => state.service.sideBarCss);
  const detail = useSelector((state) => state.service.detail);
  const openSideBar = useSelector((state) => state.service.openSideBar);
  const listUpload = useSelector((state) => state.listValue.listUpload);

  const [agreement, setAgreement] = useState(false);

  const history = useHistory();
  const location = useLocation();
  const pathMenu = location.pathname.split("/")[1];

  const sideDrawerClass = ["sidemenu__sidedrawer"];

  const SignOut = () => {
    dispatch(setPath([]));
    auth.signOut();
    dispatch(setUser([]));
    history.push("/");
  };

  const handleSignOut = () => {
    if (listUpload.length === 0) {
      SignOut();
    } else {
      setAgreement(true);
    }
  };

  const handleCancelUpload = () => {
    dispatch(setExitUpload(true));
    setAgreement(false);
    setTimeout(() => {
      SignOut();
    }, 100);
  };

  if (openSideBar) {
    sideDrawerClass.push("show");
  }

  return (
    <>
      {openSideBar && (
        <div
          className="homepage__background"
          onClick={() => dispatch(setOpenSideBar(!openSideBar))}
        ></div>
      )}

      <div className={sideDrawerClass.join(" ")}>
        <div className="sidemenu_container">
          <div className="sidebarmenu__boxBullets__show">
            <IconButton
              style={{ backgroundColor: "#023046" }}
              onClick={() => dispatch(setOpenSideBar(!openSideBar))}
            >
              <DehazeRoundedIcon style={{ color: "#ffffff" }} />
            </IconButton>
          </div>

          <div className="sidemenu__profile">
            <Image
              className="sidemenu__picture"
              src={detail && detail.img_profile ? detail.img_profile : Profile}
              roundedCircle
            />
            <label>{detail ? detail.name : "your email"}</label>
          </div>
          <div className="sidemenu__box">
            {user ? (
              <div>
                <Link to="/dashboard" style={{ textDecoration: "none" }}>
                  <button
                    className={
                      pathMenu === "dashboard"
                        ? "sidemenu__text2"
                        : "sidemenu__text"
                    }
                  >
                    <img
                      style={{ marginRight: "10px" }}
                      src={IconDashboard}
                      alt=""
                    />
                    แดชบอร์ด
                  </button>
                </Link>
                <Link to="/myCloud" style={{ textDecoration: "none" }}>
                  <button
                    className={
                      pathMenu === "myCloud"
                        ? "sidemenu__text2"
                        : "sidemenu__text"
                    }
                  >
                    <img
                      style={{ marginRight: "10px" }}
                      src={IconCloud}
                      alt=""
                    />
                    คลาวด์ของฉัน
                  </button>
                </Link>

                <Link to="/share" style={{ textDecoration: "none" }}>
                  <button
                    className={
                      pathMenu === "share"
                        ? "sidemenu__text2"
                        : "sidemenu__text"
                    }
                  >
                    <img
                      style={{ marginRight: "10px" }}
                      src={IconShare}
                      alt=""
                    />
                    แชร์กับฉัน
                  </button>
                </Link>

                <Link to="/setting" style={{ textDecoration: "none" }}>
                  <button
                    className={
                      pathMenu === "setting"
                        ? "sidemenu__text2"
                        : "sidemenu__text"
                    }
                  >
                    <img
                      style={{ marginRight: "10px", padding: "2px" }}
                      src={IconSetting}
                      alt=""
                    />
                    ตั้งค่า
                  </button>
                </Link>

                <Link to="/bin" style={{ textDecoration: "none" }}>
                  <button
                    className={
                      pathMenu === "bin" ? "sidemenu__text2" : "sidemenu__text"
                    }
                  >
                    <img
                      style={{ marginRight: "10px", padding: "5px" }}
                      src={IconDelete}
                      alt=""
                    />
                    ถังขยะ
                  </button>
                </Link>
              </div>
            ) : (
              ""
            )}
          </div>
          <div
            style={{
              height: "10%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {user ? (
              <button className="sidebarmenu__logout" onClick={handleSignOut}>
                <ExitToAppRoundedIcon style={{ marginRight: "10px" }} />
                ออกจากระบบ
              </button>
            ) : (
              <Link to={"/login"} style={{ textDecoration: "none" }}>
                <button className="sidebarmenu__logout">
                  <ExitToAppRoundedIcon style={{ marginRight: "10px" }} />
                  เข้าสู่ระบบ
                </button>
              </Link>
            )}
          </div>
        </div>
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
    </>
  );
};

export default SideMenu;
