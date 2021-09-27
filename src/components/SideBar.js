import React, { useState, useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import {
  setUser,
  setPath,
  setSideBarCss,
  setExitUpload,
  resetService,
} from "../redux/services";

import { auth } from "../firebase";

import { useHistory, Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Image } from "react-bootstrap";

import DehazeRoundedIcon from "@material-ui/icons/DehazeRounded";

import IconDashboard from "../images/sidebar/IconDashboard.png";
import IconCloud from "../images/sidebar/IconCloud.png";
import IconDelete from "../images/sidebar/IconDelete.png";
import IconShare from "../images/sidebar/IconShare.png";
import IconSetting from "../images/sidebar/IconSetting.png";

import ExitToAppRoundedIcon from "@material-ui/icons/ExitToAppRounded";
import Profile from "../images/PF.png";
import shieldcheck from "../images/fi-rr-shield-check.svg";
import "../css/SideBar.css";
import DialogAgreement from "../util/DialogAgreement";
import { IconButton } from "@material-ui/core";
import { resetStore } from "../redux/listValue";

const SideBar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.service.user);
  const sideBarCss = useSelector((state) => state.service.sideBarCss);
  const detail = useSelector((state) => state.service.detail);
  const listUpload = useSelector((state) => state.listValue.listUpload);
  const [resemailverified, setEmailverified] = useState(false)
  const history = useHistory();
  const [agreement, setAgreement] = useState(false);

  const location = useLocation();
  const pathMenu = location.pathname.split("/")[1];

  //ล็อคเอ้า
  const SignOut = () => {
    dispatch(setPath([]));
    auth.signOut();
    dispatch(setUser([]));
    history.push("/");
  };


  const handleSignOut = () => {
    let fileUpload = listUpload?.find((item) => item.uploaded === false)
    if (!fileUpload) {
      SignOut();
      dispatch(resetStore()); //เคลียร์ข้อมูลใน Redux
      dispatch(resetService()); //เคลียร์ข้อมูลใน Services
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

  useEffect(() => {
    setEmailverified(user.emailVerified);
    // console.log("user.emailVerifiedDD:",user.emailVerified);
  });

  return (
    <div
      className={
        sideBarCss ? "sidebar__container__hide" : "sidebar__container__show"
      }
    >
      <div
        className={
          sideBarCss ? "sidebar__boxBullets__hide" : "sidebar__boxBullets__show"
        }
      >
        <IconButton
          style={{ backgroundColor: "#023046" }}
          onClick={() => dispatch(setSideBarCss(!sideBarCss))}
        >
          <DehazeRoundedIcon style={{ color: "#ffffff" }} />
        </IconButton>
      </div>
      <div
        className={
          sideBarCss ? "sidebar__profile__hide" : "sidebar__profile__show"
        }
      >
        <Image
          className={
            sideBarCss ? "sidebar__image__hide" : "sidebar__image__show"
          }
          src={detail && detail.img_profile ? detail.img_profile : Profile}
          roundedCircle
        />

        <div className="nametitle">
          {!sideBarCss && <h5>{detail ? detail.name : "your name"} {resemailverified ? <img src={shieldcheck} /> : ""} </h5>}
        </div>

      </div>
      <div
        className={
          sideBarCss ? "sidebar___menubox__hide" : "sidebar___menubox__show"
        }
      >
        <div
          className="sidebar__button"
          style={{ overflow: "hidden", textOverflow: "ellipsis" }}
        >
          {user ? (
            <div style={{ marginBottom: "20px" }}>
              <Link
                id="dashboard"
                to="/dashboard"
                style={{
                  textDecoration: "none",
                }}
              >
                {sideBarCss ? (
                  <button
                    className={
                      pathMenu === "dashboard"
                        ? "sidebar__dashboard__hide__selected"
                        : "sidebar__dashboard__hide"
                    }
                  >
                    <img src={IconDashboard} alt="" />
                  </button>
                ) : (
                  <button
                    className={
                      pathMenu === "dashboard"
                        ? "sidebar__dashboard__selected"
                        : "sidebar__dashboard"
                    }
                  >
                    <img
                      style={{ marginRight: "10px" }}
                      src={IconDashboard}
                      alt=""
                    />
                    แดชบอร์ด
                  </button>
                )}
              </Link>

              <Link
                id="myCloud"
                to="/myCloud"
                style={{ textDecoration: "none" }}
              >
                {sideBarCss ? (
                  <button
                    className={
                      pathMenu === "myCloud"
                        ? "sidebar__dashboard__hide__selected"
                        : "sidebar__dashboard__hide"
                    }
                  >
                    <img src={IconCloud} alt="" />
                  </button>
                ) : (
                  <button
                    className={
                      pathMenu === "myCloud"
                        ? "sidebar__dashboard__selected"
                        : "sidebar__dashboard"
                    }
                  >
                    <img
                      style={{ marginRight: "10px" }}
                      src={IconCloud}
                      alt=""
                    />
                    คลาวด์ของฉัน
                  </button>
                )}
              </Link>

              <Link id="share" to="/share" style={{ textDecoration: "none" }}>
                {sideBarCss ? (
                  <button
                    className={
                      pathMenu === "share"
                        ? "sidebar__dashboard__hide__selected"
                        : "sidebar__dashboard__hide"
                    }
                  >
                    <img src={IconShare} alt="" />
                  </button>
                ) : (
                  <button
                    className={
                      pathMenu === "share"
                        ? "sidebar__dashboard__selected"
                        : "sidebar__dashboard"
                    }
                  >
                    <img
                      style={{ marginRight: "10px" }}
                      src={IconShare}
                      alt=""
                    />
                    แชร์กับฉัน
                  </button>
                )}
              </Link>

              <Link
                id="setting"
                to="/setting"
                style={{ textDecoration: "none" }}
              >
                {sideBarCss ? (
                  <button
                    className={
                      pathMenu === "setting"
                        ? "sidebar__dashboard__hide__selected"
                        : "sidebar__dashboard__hide"
                    }
                  >
                    <img style={{ padding: "2px" }} src={IconSetting} alt="" />
                  </button>
                ) : (
                  <button
                    className={
                      pathMenu === "setting"
                        ? "sidebar__dashboard__selected"
                        : "sidebar__dashboard"
                    }
                  >
                    <img
                      style={{ marginRight: "10px", padding: "2px" }}
                      src={IconSetting}
                      alt=""
                    />
                    ตั้งค่า
                  </button>
                )}
              </Link>
              <Link id="bin" to="/bin" style={{ textDecoration: "none" }}>
                {sideBarCss ? (
                  <button
                    className={
                      pathMenu === "bin"
                        ? "sidebar__dashboard__hide__selected"
                        : "sidebar__dashboard__hide"
                    }
                  >
                    <img style={{ padding: "2px" }} src={IconDelete} alt="" />
                  </button>
                ) : (
                  <button
                    className={
                      pathMenu === "bin"
                        ? "sidebar__dashboard__selected"
                        : "sidebar__dashboard"
                    }
                  >
                    <img
                      style={{ marginRight: "10px", padding: "2px" }}
                      src={IconDelete}
                      alt=""
                    />
                    ถังขยะ
                  </button>
                )}
              </Link>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
      {user ? (
        <div className="sidebar__menu__logout">
          {sideBarCss ? (
            <button className="sidebar__logout__hide" onClick={handleSignOut}>
              <ExitToAppRoundedIcon />
              {/* <img
                    style={{ marginRight: "10px" }}
                    src={IconLogout}
                    alt=""
                  /> */}
            </button>
          ) : (
            <button
              id="signout"
              className="sidebar__logout"
              onClick={handleSignOut}
            >
              <ExitToAppRoundedIcon style={{ marginRight: "5px" }} />
              {/* <img
                    style={{ marginRight: "10px" }}
                    src={IconLogout}
                    alt=""
                  /> */}
              ออกจากระบบ
            </button>
          )}
        </div>
      ) : (
        <Link id="login" to={"/login"} style={{ textDecoration: "none" }}>
          {sideBarCss ? (
            <div className="sidebar__menu__logout">
              <button className="sidebar__logout__hide">
                <ExitToAppRoundedIcon />{" "}
              </button>
            </div>
          ) : (
            <div className="sidebar__menu__logout">
              <button className="sidebar__logout">
                {/* <VpnKeyIcon fontSize="large" style={{ marginRight: "10px" }} /> */}
                เข้าสู่ระบบ
              </button>
            </div>
          )}
        </Link>
      )}

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

export default SideBar;
