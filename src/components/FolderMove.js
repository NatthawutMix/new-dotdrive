import React, { useState, useEffect } from "react";
import axios from "../axios";
import Loading from "./Loading";

import FolderIcon from "@material-ui/icons/Folder";
import FolderOpenIcon from "@material-ui/icons/FolderOpen";

import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";
import KeyboardBackspaceIcon from "@material-ui/icons/KeyboardBackspace";
import CloseIcon from "@material-ui/icons/Close";
import { IconButton } from "@material-ui/core";

import "../css/ViewMoveFile.css";

import { client } from "../aliOss";

import swal from "sweetalert";
import DialogAgreement from "../util/DialogAgreement";
import { useDispatch } from "react-redux";
import { setAllused } from "../redux/services";
import { db, dbFile, dbFolder, logFile, updateSize } from "../firebase";
import { removeFileBin, removeListDownload } from "../redux/listValue";

const FolderMove = ({ uid, folder, click, onLoad }) => {
  const dispatch = useDispatch();
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [current, setCurrent] = useState(uid);
  const [duplicate, setDuplicate] = useState(false);
  const [fileDuplicate, setFileDuplicate] = useState(null);

  const [path, setPath] = useState([
    {
      id: uid,
      name: "Home",
    },
  ]);
  
  useEffect(() => {
    setFolders([]);
    setFiles([]);
    //ดึงข้อมูลไฟล์จาก Firestore
    const subFiles = db
      .collection("drive")
      .doc(uid)
      .collection("files")
      .onSnapshot((querySnapshot) => {
        if (querySnapshot.empty) {
          setFiles([]);
          setIsLoading(false);
          return;
        }
        let files = [];
        querySnapshot.forEach((doc) => {
          if (doc.data().parentId === current && doc.data().bin === false) {
            files.push(doc.data());
          }
        });
        setIsLoading(false);
        setFiles(files);
      });
    //ดึงข้อมูลโฟล์เดอร์จาก Firestore
    const subFolders = db
      .collection("drive")
      .doc(uid)
      .collection("folders")
      .onSnapshot((querySnapshot) => {
        if (querySnapshot.empty) {
          setIsLoading(false);
          setFolders([]);
          return;
        }
        let folders = [];
        querySnapshot.forEach((doc) => {
          if (doc.data().parentId === current && doc.data().bin === false) {
            folders.push(doc.data());
          }
        });
        setIsLoading(false);
        setFolders(folders);
      });
    return () => {
      subFiles();
      subFolders();
    };
  }, [current, uid]);

  //เปลี่ยนเส้นทางโฟล์เดอร์ทุกๆครั้งที่เลือกโฟล์เดอร์ใหม่
  const handleSelectFolder = (folder) => {
    let isComponentMounted = true;
    if (isComponentMounted) {
      setIsLoading(true);
      setCurrent(folder.currentId); //กำหนดเส้นทางใหม่
      setPath([...path, { id: folder.currentId, name: folder.name }]); //กำหนดเส้นทางโฟล์เดอร์ใหม่
    }
    return () => {
      isComponentMounted = false;
    };
  };

  //ย้อนกลับไปยังโฟล์เดอร์ก่อนหน้า
  const backPath = () => {
    let index = path.length - 2; //ย้อนกลับไปยังเส้นทางก่อนหน้า
    if (path[index] !== undefined) {
      setIsLoading(true);
      setCurrent(path[index].id); //กำหนดเส้นทางใหม่
      setPath(path.slice(0, index + 1)); //กำหนดเส้นทางโฟล์เดอร์ใหม่
    }
  };

  const move = async () => {
    let currentPath = [...path, { id: folder.currentId, name: folder.name }];
    if (folder.parentId === current) {
      swal("ไฟล์อยู่ตำแหน่งนี้อยู่แล้ว", {
        icon: "error",
        button: false,
      });
      return;
    }
    if (folder.type === "folder") {
      db.collection("drive")
        .doc(uid)
        .collection("logs")
        .doc()
        .set({
          topic: "ย้ายโฟร์เดอร์",
          data: folder,
          from: folder.parentId,
          to: current,
          by: { uid: uid, name: folder.username },
          updatedAt: Date.now(),
        });
      await dbFolder(folder.owner)
        .doc(folder.currentId)
        .update({
          parentId: current,
          path: path,
        })
        .then(async () => {
          await dbFolder(folder.owner)
            .where("path", "array-contains", {
              id: folder.currentId,
              name: folder.name,
            })
            .get()
            .then((snap) => {
              snap.forEach((doc) => {
                doc.ref.update({
                  path: currentPath,
                });
              });
              click();
              dispatch(removeListDownload(folder));
              swal("ย้ายไฟล์สำเร็จ", {
                icon: "success",
                button: false,
              });
              setTimeout(() => {
                onLoad();
              }, 100);
            });
        })
        .catch((error) => {
          swal(error.response.data.message, {
            icon: "error",
            button: false,
          });
        });
    } else {
      await dbFile(folder.owner)
        .where("parentId", "==", current)
        .where("name", "==", folder.name)
        .where("type", "==", folder.type)
        .get()
        .then(async (snap) => {
          if (snap.empty) {
            await dbFile(folder.owner).doc(folder.currentId).update({
              parentId: current,
            });
            click();
            dispatch(removeListDownload(folder));
            swal("ย้ายไฟล์สำเร็จ", {
              icon: "success",
              button: false,
            });
            setTimeout(() => {
              onLoad();
            }, 100);
          } else {
            let data;
            snap.forEach((doc) => {
              data = doc.data();
            });
            setDuplicate(true);
            setFileDuplicate(data);
          }
        });
    }
  };
  //แทนที่ไฟล์เดิม
  const handleReplace = async () => {
    //กำหนดเส้นทางไฟล์ Oss
    let pathOss =
      fileDuplicate.owner + "/" + fileDuplicate.currentId + fileDuplicate.type;
    client.delete(pathOss); //ลบไฟล์เก่าออกจาก Oss
    //ลบข้อมูลไฟล์ออกจาก Firestore
    dbFile(fileDuplicate.owner)
      .doc(fileDuplicate.currentId)
      .delete()
      .catch((err) => {
        swal(err, {
          icon: "error",
          button: false,
        });
      });
    updateSize(fileDuplicate.owner, fileDuplicate.size, "minus");
    //เปลี่ยนที่อยู่ของไฟล์
    await dbFile(folder.owner)
      .doc(folder.currentId)
      .update({
        parentId: current,
      })
      .then(() => {
        logFile(folder.owner, folder.username, fileDuplicate, "แทนที่");
        swal("ย้ายไฟล์สำเร็จ", {
          icon: "success",
          button: false,
        });
      })
      .catch((err) => {
        swal(err, {
          icon: "error",
          button: false,
        });
      });
  };
  //สร้างไฟล์ใหม่
  const handleNewFile = async () => {
    //เช็คไฟล์ซ้ำทั้งหมด
    let countNumber = await dbFile(fileDuplicate.owner)
      .where("parentId", "==", fileDuplicate.parentId)
      .where("bin", "==", false)
      .get()
      .then((snap) => {
        let list = [];
        snap.forEach((doc) => list.push(doc.data()));
        return list;
      });

    let nameRecovery = fileDuplicate.name;
    let filterName = countNumber.filter(
      (item) =>
        item.name.substring(0, nameRecovery.length) === nameRecovery &&
        item.name[nameRecovery.length] === " " &&
        item.name[nameRecovery.length + 1] === "(" &&
        item.name[nameRecovery.length + 3] === ")" &&
        item.name.length === nameRecovery.length + 4
    );
    //กำหนดชื่อไฟล์ใหม่
    let newName;
    if (filterName.length > 0) {
      newName = fileDuplicate.name + ` (${filterName.length + 1})`;
    } else {
      newName = fileDuplicate.name + " (1)";
    }
    //ย้านที่อยู่ไฟล์ และกำหนดชื่อไฟล์ใหม่
    await dbFile(folder.owner)
      .doc(folder.currentId)
      .update({
        parentId: current,
        name: newName,
      })
      .then(() => {
        setDuplicate(false);
        dispatch(removeFileBin(folder));
        logFile(uid, folder.username, folder, "ย้ายไฟล์");
        click();
        swal("ย้ายไฟล์สำเร็จ", {
          icon: "success",
          button: false,
        });
        setTimeout(() => {
          onLoad();
        }, 100);
      })
      .catch(() => {
        swal("Error !", {
          icon: "error",
          button: false,
        });
      });
  };

  return (
    <div className="sidebar__back">
      <div className="viewMoveFile__container">
        <div className="movefile__title">
          <div className="viewMoveFile__back">
            {uid !== current ? (
              <IconButton
                style={{ padding: "10px", marginRight: "20px" }}
                onClick={() => backPath()}
              >
                <KeyboardBackspaceIcon />
              </IconButton>
            ) : (
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  padding: "10px",
                  marginRight: "20px",
                }}
              ></div>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              {path.length > 2 && (
                <div className="viewMoveFile__path">
                  <label style={{ color: "#ffffff" }}>...</label>
                </div>
              )}
              {path.map((item, index) => (
                <div className="viewMoveFile__path" key={index}>
                  <>
                    {item.id !== uid && index > path.length - 3 && (
                      <strong style={{ fontWeight: "bold" }}>{">"}</strong>
                    )}
                    {index >= path.length - 2 && (
                      <label key={index} style={{ color: "#ffffff" }}>
                        {item.name.length > 5
                          ? "..." + item.name.substring(0, 4)
                          : item.name}
                      </label>
                    )}
                  </>
                </div>
              ))}
            </div>
          </div>
          <div>
            <IconButton
              style={{ padding: "10px", marginRight: "10px" }}
              onClick={click}
            >
              <CloseIcon />
            </IconButton>
          </div>
        </div>

        {isLoading ? (
          <div className="viewMoveFile__loading">
            <Loading size={"8rem"} />
          </div>
        ) : (
          <div className="viewMoveFile__items">
            {folders.length !== 0
              ? folders.map((item, index) => (
                  <div
                    className="viewMoveFile__item"
                    onClick={() =>
                      folder.currentId === item.currentId
                        ? ""
                        : item.type === "folder" && handleSelectFolder(item)
                    }
                    key={index}
                  >
                    <div>
                      {folder.currentId === item.currentId ? (
                        <>
                          <FolderOpenIcon
                            style={{
                              marginLeft: "20px",
                              color: "#00000080",
                              marginRight: "20px",
                            }}
                          />
                          {item.name}
                        </>
                      ) : (
                        <>
                          <FolderOpenIcon
                            style={{
                              marginLeft: "20px",
                              color: "#01758E",
                              marginRight: "20px",
                            }}
                          />
                          {item.name}
                        </>
                      )}
                    </div>
                  </div>
                ))
              : ""}
            {files.length !== 0 &&
              files.map((item, index) => (
                <div className="viewMoveFile__item" key={index}>
                  <InsertDriveFileIcon
                    style={{
                      marginLeft: "20px",
                      color: "#00000080",
                      marginRight: "20px",
                    }}
                  />
                  {item.name}
                  {item.type}
                </div>
              ))}
          </div>
        )}
        <div className="movefile__submit">
          <div style={{ margin: "auto 20px auto 0" }}>
            <button
              className="viewMoveFile__btn"
              onClick={() => {
                move();
              }}
            >
              <FolderIcon style={{ marginRight: "8px" }} />
              ย้ายไปที่
            </button>
          </div>
        </div>
        <DialogAgreement
          title={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <label style={{ fontSize: "25px" }}>คุณมีไฟล์นี้อยู่แล้ว ?</label>
              <IconButton
                style={{ padding: "5px" }}
                onClick={() => setDuplicate(false)}
              >
                <CloseIcon />
              </IconButton>
            </div>
          }
          description={
            <label>
              ท่านต้องการแทนที่ไฟล์{" "}
              <strong style={{ color: "#000000" }}>
                {folder.name}
                {folder.type} ?
              </strong>
            </label>
          }
          open={duplicate}
          handleClose={handleNewFile}
          handleAgree={handleReplace}
          textClose={"สร้างไฟล์ใหม่"}
          textSubmit={"แทนที่ไฟล์เดิม"}
        />
      </div>
    </div>
  );
};

export default FolderMove;
