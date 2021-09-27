import React, { useState } from "react";
import "../css/ShareFile.css";

import Profile from "../images/PF.png";
import { Image } from "react-bootstrap";
import axios from "../axios";
import { useDispatch } from "react-redux";
import { shareFile } from "../redux/listValue";

import PeopleOutlineIcon from "@material-ui/icons/PeopleOutline";
import LinkIcon from "@material-ui/icons/Link";
import CancelIcon from "@material-ui/icons/Cancel";
import { Button, IconButton } from "@material-ui/core";
import HighlightOffIcon from "@material-ui/icons/HighlightOff";

import swal from "sweetalert";
import { db, dbFile, dbShare, logFile, firebase } from "../firebase";
import { useLocation } from "react-router-dom";

const ShareFile = ({ username, file, uid, close, myEmail }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState(null);
  const [getLink, setGetLink] = useState(false);

  const hostWeb = window.location.href
  const newUrl = hostWeb.substring(0, window.location.href.search("myCloud") - 1)

  const shareLink = `${newUrl}/sharing/${uid}?id=${file.currentId}`; //กำหนดลิ้งแชร์
  // const shareLink = `http://localhost:3000/sharing/${uid}?id=${file.currentId}`;


  console.log(shareLink)

  let myInput = null;
  //คัดลอกลิ้งค์ที่จะทำการส่งต่อ
  const copyToClipboard = () => {
    myInput.select();
    document.execCommand("copy");
  };

  //เลือกผู้ที่จะแชร์
  const handleShare = async () => {
    if (myEmail === email) {
      swal("อีเมล์ผิดพลาด", {
        icon: "error",
        button: false,
      });
      return;
    }

    let shareFile;
    //เช็คอีเมล์ใน Firestore
    let sharing = await db
      .collection("drive")
      .where("email", "==", email)
      .get();
    if (sharing.empty) {
      swal("ไม่เจออีเมลนี้", {
        icon: "error",
        button: false,
      });
      return;
      // throw new Error("ไม่เจออีเมลนี้");
    }
    //กำหนดข้อมูลของผู้ที่รับการแชร์
    sharing.forEach((doc) => {
      shareFile = { ...doc.data(), docId: doc.id };
    });
    //เช็คแชร์ซ้ำ
    let check = await dbFile(file.owner)
      .doc(file.currentId)
      .get()
      .then((doc) => {
        return doc.data().share;
      })
      .catch((err) =>
        swal(err.message, {
          icon: "error",
          button: false,
        })
      );
    let findEmail = await check.find((item) => item.email === email);
    if (findEmail !== undefined) {
      swal("คุณได้เพิ่มผู้ใช้นี้แล้ว", {
        icon: "error",
        button: false,
      });
      setEmail(null);
      return;
      // throw new Error("คุณได้เพิ่มผู้ใช้นี้แล้ว");
    }

    //เพิ่มข้อมูลการแชร์ให้ผู้ถูกแชร์
    dbShare(shareFile.docId).doc(file.currentId).set({
      owner: file.owner,
      by: username,
      currentId: file.currentId,
      parentId: file.parentId,
      createdAt: file.createdAt,
      size: file.size,
      type: file.type,
      name: file.name,
    });
    //เพิ่มข้อมูลการแชร์ให้ผู้แชร์
    await dbFile(file.owner)
      .doc(file.currentId)
      .update({
        share: firebase.firestore.FieldValue.arrayUnion({
          uid: shareFile.docId,
          avatar: shareFile.img_profile,
          email: email,
          name: shareFile.name,
          role: "ผู้ใช้",
        }),
      });
    swal("แชร์สำเร็จ", {
      icon: "success",
      button: false,
    });
    logFile(uid, username, file, "แชร์ไฟล์");
  };

  return (
    <div className="sidebar__back">
      <div className="sharefile__container">
        <IconButton style={{ float: "right" }} onClick={close}>
          <CancelIcon />
        </IconButton>
        <div className="sharefile__title">
          <PeopleOutlineIcon
            style={{
              fontSize: 60,
              margin: "0 10px 0 10px",
              color: "#ffffff",
              height: "100%",
            }}
          />
          <h3 style={{ fontWeight: "bold", color: "#ffffff" }}>แชร์กับฉัน</h3>
        </div>
        <div className="sharefile__body">
          <input
            className="sharefile__input"
            placeholder="เพิ่มผู้คนที่ต้องการแชร์"
            onChange={(event) => setEmail(event.target.value)}
          />
          <div className="sharefile__items">
            {file?.share.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Image
                    style={{
                      width: "50px",
                      marginRight: "10px",
                      backgroundColor: "#c4c4c4",
                    }}
                    src={item && item.image ? item.image : Profile}
                    roundedCircle
                  />
                  <div>
                    <strong>{item.name}</strong>
                    <br />
                    <small style={{ color: "#B8B4B4" }}>{item.email}</small>
                  </div>
                </div>
                <p style={{ color: "#B8B4B4", marginRight: "10px" }}>
                  {item.role}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="sharefile__btnshare">
          <Button
            style={{
              height: "50%",
              backgroundColor: "#ffffff",
              margin: "auto 20px auto 0",
            }}
            onClick={handleShare}
          >
            แชร์
          </Button>
          <div className="sharefile__btnshare__small">
            <button
              style={{
                backgroundColor: "#C4C4C4",
                borderRadius: "50%",
                border: "none",
                width: "30px",
                height: "30px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                float: "left",
                margin: "0 10px 0 10px",
              }}
              onClick={() => setGetLink(true)}
            >
              <LinkIcon
                style={{
                  transform: "rotate(-45deg)",
                  width: "100%",
                  height: "auto",
                }}
              />
            </button>
            <label style={{ color: "#ffffff" }}>รับลิงก์</label>
          </div>
        </div>

        <div className="sharefile__link">
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              marginLeft: "25px"
            }}
          >
            <IconButton
              style={{
                backgroundColor: "#C4C4C4",
                width: "50%",
                height: "50%",
                padding: "5px",
                maxWidth: "50px",
                maxHeight: "50px"
              }}
              onClick={() => setGetLink(true)}
            >
              <LinkIcon
                style={{
                  transform: "rotate(-45deg)",
                }}
              />
            </IconButton>
            <div
              style={{
                margin: "auto 10px auto 10px",
              }}
            >
              <h3 style={{ fontWeight: "bold" }}>รับลิงก์</h3>
              <h6
                style={{
                  fontWeight: "bold",
                  // fontSize: "16px",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                }}
              >
                จำกัดเฉพาะคนที่ใช้งานแอพนี้เท่านั้นที่เปิดด้วยลิงก์นี้ได้
              </h6>
            </div>
          </div>


        </div>
      </div>
      {getLink && (
        <div className="shareFile__getLink">
          <IconButton
            style={{ padding: "5px", float: "right", marginBottom: "10px" }}
            onClick={() => setGetLink(false)}
          >
            <HighlightOffIcon style={{ color: "red" }} />
          </IconButton>
          <input
            style={{ width: "100%" }}
            readOnly
            value={shareLink}
            ref={(ref) => (myInput = ref)}
          />
          <Button
            style={{ float: "right", marginTop: "10px" }}
            color="primary"
            variant="contained"
            onClick={copyToClipboard}
          >
            คัดลอกลิงก์
          </Button>
        </div>
      )}
    </div>
  );
};

export default ShareFile;
