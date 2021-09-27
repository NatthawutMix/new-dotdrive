import React, { useState, useEffect } from "react";
import { client } from "../aliOss";
import { useDispatch, useSelector } from "react-redux";

import {
  removeFile,
  setListDownload,
  removeListDownload,
  setOneUpload,
} from "../redux/listValue";

import axios from "../axios";

import FolderMove from "./FolderMove";
import ShareFile from "./ShareFile";

import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import PeopleOutlineIcon from "@material-ui/icons/PeopleOutline";
import ImportContactsIcon from "@material-ui/icons/ImportContacts";

import { getReadableFileSizeString, toBase64, typeFile } from "../util/util";

import { Image } from "react-bootstrap";
import moment from "moment";

import { db, dbFile, dbFolder, firebase, logFile } from "../firebase";
import PreviewImage from "./PreviewImage";
import swal from "sweetalert";
import { Checkbox } from "@material-ui/core";
import ReactPlayer from "react-player";

const File = ({ file, selectAll, setSelectAll, user, username, myEmail }) => {
  const dispatch = useDispatch();

  const [select, setSelect] = useState(false);
  const [folderMove, setFolderMove] = useState(false);
  const [shareBox, setShareBox] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewMovie, setPreviewMovie] = useState(null);
  const [previewBox, setPreviewBox] = useState(false);

  const listDownload = useSelector((state) => state.listValue.listDownload);

  useEffect(() => {
    if (selectAll) {
      dispatch(setListDownload(file));
      setSelect(true);
    } else {
      dispatch(removeListDownload(file));
      setSelect(false);
    }
  }, [dispatch, file, selectAll]);

  useEffect(() => {
    let findItem = listDownload.findIndex(
      (item) => item.currentId === file.currentId
    );

    if (findItem < 0) {
      setSelect(false);
    }
  }, [dispatch, file, listDownload]);
  //พรีวิวรูปภาพ
  useEffect(() => {
    let isComponentMounted = true;
    let path = `${file.owner}/${file.currentId}${file.type}`; //กำหนดเส้นทางไฟล์ Oss

    async function getPreview() {
      let result = await client.get(path); //ดึงไฟล์ Oss
      let data = `data:image/png;base64,${toBase64(result.content)}`; //แปลงเป็น base64
      if (isComponentMounted) {
        setPreview(data);
      }
    }

    async function getPreviewMovie() {
      // let result = await client.get(path);
      // console.log(result);
      if (isComponentMounted) {
        // console.log(toBase64(result.content));
        // setPreviewMovie("data:video/mp4;" + toBase64(result.content));
      }
    }

    if (
      file.type === ".png" ||
      file.type === ".jpg" ||
      file.type === ".jpeg" ||
      file.type === ".jfif"
    ) {
      getPreview();
    } else {
      getPreviewMovie();
    }
    return () => {
      isComponentMounted = false;
    };
  }, [dispatch, file, preview]);
  //ดาวน์โหลดไฟล์
  const downloadFile = async () => {
    //กำหนดชื่อไฟล์
    let response = {
      "content-disposition": `attachment; filename=${encodeURIComponent(
        file.name + file.type
      )}`,
    };
    //กำหนดเส้นทางไฟล์
    let pathOss = file.owner + "/" + file.currentId + file.type;
    //สร้างลิ้ง
    let url = await client.signatureUrl(pathOss, {
      response,
    });
    //เปิดลิ้งดาวน์โหลด
    if (url.substr(0, 5) === "https") {
      window.open(url, "_blank");
    } else {
      window.open("https" + url.substr(4), "_blank");
    }

    logFile(user.uid, username, file, "ดาวน์โหลด");
  };
  //ลบไฟล์ไปที่ถังขยะ
  const deleteFolder = async () => {
    let share = [];
    await dbFile(file.owner)
      .doc(file.currentId)
      .get()
      .then((doc) => {
        //เช็คการแชร์ไฟล์
        if (doc.data().share.length > 1) {
          //ทำการลบข้อมูลการแชร์ไฟล์
          for (let i = 1; i < doc.data().share.length; i++) {
            //กำหนดข้อมูลผู้ใช้ที่ได้รับการแชร์ไฟล์
            share.push({
              uid: doc.data().share[i].uid,
              currentId: doc.data().currentId,
            });
            doc.ref.update({
              bin: true,
              share: firebase.firestore.FieldValue.arrayRemove(
                doc.data().share[i]
              ),
            });
          }
        } else {
          //ย้ายไปที่ถังขยะ
          doc.ref.update({
            bin: true,
          });
        }
      })
      .then(() => {
        logFile(user.uid, username, file, "นำออก");
        swal("นำออกสำเร็จ", {
          icon: "success",
          button: false,
        });
        dispatch(removeListDownload(file));
      })
      .catch((err) => {
        swal(err.message, {
          icon: "error",
          button: false,
        });
        dispatch(removeListDownload(file));
      });
    //ลบข้อมูลไฟล์ที่ผู้ใช้ได้รับการแชร์ไฟล์
    share.forEach((item) => {
      db.collection("drive")
        .doc(item.uid)
        .collection("share")
        .doc(item.currentId)
        .delete();
    });
  };

  const handleClick = (event, data) => {
    setSelect(false);
    if (data.action === "download") {
      downloadFile();
    } else if (data.action === "move") {
      setFolderMove(true);
    } else if (data.action === "delete") {
      deleteFolder();
    } else if (data.action === "share") {
      setShareBox(true);
    } else if (data.action === "preview") {
      setPreviewBox(true);
    }
  };

  const handleMoveFile = (file) => {
    // dispatch(setIsLoading(false));
    // dispatch(removeFile(file));
  };

  const selectFile = (data) => {
    setSelect(data);
    if (data) {
      dispatch(setListDownload(file));
    } else {
      dispatch(removeListDownload(file));
    }
  };

  const handleRightClick = (event) => {
    setSelectAll();
    setTimeout(() => {
      setSelect(true);
      dispatch(setOneUpload(file));
    }, 100);
  };

  // console.log(previewMovie);
  return (
    <div>
      <div className="file__container">
        <ContextMenuTrigger id={file.currentId}>
          <div
            className={select ? "file__item__select" : "file__item"}
            // style={{ display: "flex" }}
            // onClick={() => selectFile(!select)}
            onContextMenu={handleRightClick}
            onDoubleClick={() => setPreviewBox(true)}
          >
            <div className="file__item__desc">
              <Checkbox
                color="default"
                style={{
                  paddingLeft: "0",
                  margin: "0",
                  color: "#000000",
                  paddingRight: "15px",
                }}
                checked={select}
                onClick={() => selectFile(!select)}
              />

              {preview ? (
                <Image
                  style={{
                    width: "20px",
                    marginRight: "10px",
                    backgroundColor: "#c4c4c4",
                    borderRadius: "3px",
                  }}
                  src={preview}
                />
              ) : (
                <img
                  style={{
                    backgroundColor: "#025074",
                    padding: "2px",
                    marginRight: "10px",
                    borderRadius: "3px",
                  }}
                  src={typeFile(file.type)}
                  alt=""
                />
              )}
              <label className="file__label__overflow">
                {file.name}
                {file.type}
              </label>
            </div>
            <div className="file__date">
              <label className="file__label__overflow">
                {moment(file.createdAt).subtract(10, "days").calendar()}
              </label>
            </div>
            <div className="file__size">
              <label
                className="file__label__overflow"
                style={{
                  width: "100%",
                  textAlign: "right",
                  marginRight: "20px",
                }}
              >
                {getReadableFileSizeString(file.size)}
              </label>
            </div>
          </div>
        </ContextMenuTrigger>

        <ContextMenu id={file.currentId}>
          <MenuItem data={{ action: "preview" }} onClick={handleClick}>
            <ImportContactsIcon
              style={{ marginRight: "10px", color: "#ffffff" }}
            />
            <small style={{ color: "#ffffff" }}>เปิดไฟล์</small>
          </MenuItem>
          <MenuItem data={{ action: "download" }} onClick={handleClick}>
            <CloudDownloadIcon
              style={{ marginRight: "10px", color: "#ffffff" }}
            />
            <small style={{ color: "#ffffff" }}>ดาวน์โหลด</small>
          </MenuItem>
          <MenuItem data={{ action: "move" }} onClick={handleClick}>
            <ExitToAppIcon style={{ marginRight: "10px", color: "#ffffff" }} />
            <small style={{ color: "#ffffff" }}>ย้ายไปที่</small>
          </MenuItem>
          <MenuItem data={{ action: "share" }} onClick={handleClick}>
            <PeopleOutlineIcon
              style={{ marginRight: "10px", color: "#ffffff" }}
            />
            <small style={{ color: "#ffffff" }}>แชร์</small>
          </MenuItem>
          <MenuItem data={{ action: "delete" }} onClick={handleClick}>
            <DeleteOutlineIcon
              style={{ marginRight: "10px", color: "#ffffff" }}
            />
            <small style={{ color: "#ffffff" }}>นำออก</small>
          </MenuItem>
        </ContextMenu>
      </div>

      {previewBox && (
        <PreviewImage
          uid={user.uid}
          username={username}
          file={{ ...file, preview: preview }}
          type={"file"}
          move={() => setFolderMove(true)}
          share={() => setShareBox(true)}
          remove={deleteFolder}
          download={downloadFile}
          close={() => setPreviewBox(false)}
        />
      )}

      {folderMove && (
        <FolderMove
          folder={{
            ...file,
            name: file.name,
            username: username,
          }}
          uid={user.uid}
          click={() => setFolderMove(false)}
          onLoad={() => handleMoveFile(file)}
          // isloading={() => dispatch(setIsLoading(true))}
        />
      )}

      {shareBox && (
        <ShareFile
          uid={user.uid}
          myEmail={myEmail}
          username={username}
          file={file}
          close={() => setShareBox(false)}
        />
      )}
    </div>
  );
};

export default File;
