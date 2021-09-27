import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  setListDownload,
  removeListDownload,
  removeFileBin,
  removeFile,
  setOneUpload,
} from "../redux/listValue";

import axios from "../axios";

import FolderOpenIcon from "@material-ui/icons/FolderOpen";
// import FolderIcon from "@material-ui/icons/Folder";
// import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";
import RestoreIcon from "@material-ui/icons/Restore";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import CloseIcon from "@material-ui/icons/Close";
import { Checkbox, IconButton } from "@material-ui/core";

import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import "../css/menu.css";
import { client } from "../aliOss";
import { toBase64, typeFile } from "../util/util";
import { Image } from "react-bootstrap";
import { dbFile, dbFolder, logFile, updateSize } from "../firebase";
import DialogAgreement from "../util/DialogAgreement";

import swal from "sweetalert";
import { setAllused } from "../redux/services";

const FileBin = ({ file, selectAll, setSelectAll, user, username }) => {
  const dispatch = useDispatch();

  const listDownload = useSelector((state) => state.listValue.listDownload);

  const [select, setSelect] = useState(false);
  const [toggle, setToggle] = useState(false);
  const [duplicate, setDuplicate] = useState(false);
  const [fileDuplicate, setFileDuplicate] = useState(null);

  const [agreeRestore, setAgreeRestore] = useState(false);
  const [agreeDelete, setAgreeDelete] = useState(false);

  const [preview, setPreview] = useState(null);

  useEffect(() => {
    let isComponentMounted = true;
    let path = `${file.owner}/${file.currentId}${file.type}`; //กำหนดเส้นทางไฟล์ Oss
    async function getPreview() {
      let result = await client.get(path); //ดึงข้อมูลไฟล์ Oss
      if (isComponentMounted) {
        setPreview(toBase64(result.content)); 
      }
    }
    if (file.type === ".png" || file.type === ".jpg" || file.type === ".jpeg") {
      getPreview();
    }
    return () => {
      isComponentMounted = false;
    };
  }, [file.currentId, file.owner, file.type]);

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

  //รีสโตร์ไฟล์ การรีสโตร์ไปยังไฟล์ซ้ำ จะมีการเปลี่ยนชื่อไฟล์ หรือทำการอัพโหลดไฟล์ใหม่
  const restore = async () => {
    if (file.type === "folder") {
      //กำหนดชื่อใหม่ และ อัพเดทข้อมูลโฟล์เดอร์
      await dbFolder(file.owner)
        .doc(file.currentId)
        .update({
          bin: false,
          name: file.name + " (recovery)",
        })
        .then(async () => {
          //หาไฟล์ลูก
          await dbFolder(file.owner)
            .where("path", "array-contains", {
              id: file.currentId,
              name: file.name,
            })
            .get()
            .then((snap) => {
              if (snap.empty) {
                return;
              }
              //อัพเดทเส้นทางโฟล์เดอร์
              snap.forEach(async (doc) => {
                let newData = await doc
                  .data()
                  .path.map((item) =>
                    item.id === file.currentId
                      ? { ...item, name: file.name + " (recovery)" }
                      : item
                  );
                doc.ref.update({ path: newData });
              });
            });
          setDuplicate(false);
          dispatch(removeListDownload(file));

          logFile(user.uid, username, file, "รีสโตร์");
          swal("รีสโตร์สำเร็จ", {
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
    } else {
      //เช็คไฟล์ซ้ำ
      let checkDuplicate = await dbFile(file.owner)
        .where("parentId", "==", file.parentId)
        .where("type", "==", file.type)
        .where("name", "==", file.name)
        .where("bin", "==", false)
        .get();
      //ไม่มีไฟล์ซ้ำ
      if (checkDuplicate.empty) {
        //กำหนดสถานะถังขยะเป็นผิด
        await dbFile(file.owner)
          .doc(file.currentId)
          .update({
            bin: false,
          })
          .then(() => {
            setDuplicate(false);
            logFile(user.uid, username, file, "รีสโตร์");
            dispatch(removeListDownload(file));
            swal("รีสโตร์สำเร็จ", {
              icon: "success",
              button: false,
            });
          })
          .catch(() => {
            swal("Error !", {
              icon: "error",
              button: false,
            });
          });
        return;
      } else {
        //เก็บข้อมูลไฟล์ซ้ำ
        await checkDuplicate.forEach((doc) => {
          setFileDuplicate(doc.data());
        });
        setDuplicate(true);
      }
    }
  };
  //ลบไฟล์ถาวร
  const deleteFile = async () => {
    if (file.type === "folder") {
      //เช็คโฟล์เดอร์ลูก
      let findFolder = await dbFolder(user.uid)
        .where("path", "array-contains", {
          id: file.currentId,
          name: file.name,
        })
        .get();
      //เช็คไฟล์ลูก
      let findFile = await dbFile(user.uid)
        .where("path", "array-contains", {
          id: file.currentId,
          name: file.name,
        })
        .get();
      //ลบข้อมูลโฟล์เดอร์ออกจาก Firestore
      findFolder.forEach(async (doc) => {
        logFile(user.uid, username, doc.data(), "นำออกจากถังขยะ");
        doc.ref.delete();
      });
      //ลบข้อมูลไฟล์ออกจาก Firestore
      findFile.forEach((doc) => {
        let size = doc.data().size;
        let from = `${user.uid}/${doc.data().currentId}${doc.data().type}`; //กำหนดเส้นทางไฟล์ Oss

        let to = `${user.uid}/keep/${doc.data().currentId}${doc.data().type}`;

        client.delete(from); //ลบไฟล์ออกจา่ก Oss
        /* let oss = await client.copy(to, from).then(() => {
          client.delete(from);
        }); */
        updateSize(user.uid, size, "minus");

        logFile(user.uid, username, doc.data(), "นำออกจากถังขยะ");
        // keepLogFile(uid, doc.data().currentId);
        doc.ref.delete();
      });

      //ลบไฟล์ตั้งตน
      await dbFolder(user.uid)
        .doc(file.currentId)
        .delete()
        .then(() => {
          logFile(user.uid, username, file, "นำออกจากถังขยะ");
          swal("นำออกจากถังขยะสำเร็จ", {
            icon: "success",
            button: false,
          });
          setPreview(null);
          dispatch(removeListDownload(file));
        })
        .catch((err) => {
          swal(err.message, {
            icon: "error",
            button: false,
          });
          dispatch(removeListDownload(file));
        });
    } else {
      //ลบข้อมูลออกจาก Firestore
      await dbFile(user.uid)
        .doc(file.currentId)
        .delete()
        .then(() => {
          let from = `${file.owner}/${file.currentId}${file.type}`; //กำหนดเส้นทางไฟล์ Oss
          let to = `${file.owner}/keep/${file.currentId}${file.type}`;
          client.delete(from); //ลบไฟล์ออกจา่ก Oss
          /* let oss = await client.copy(to, from).then(() => {
              client.delete(from);
            }); */
          updateSize(user.uid, file.size, "minus");
          logFile(user.uid, username, file, "นำออกจากถังขยะ");
          swal("นำออกจากถังขยะสำเร็จ", {
            icon: "success",
            button: false,
          });
          setPreview(null);
          dispatch(removeListDownload(file));

          // setDetail();
        })
        .catch((err) => {
          swal(err.message, {
            icon: "error",
            button: false,
          });

          dispatch(removeListDownload(file));
        });
    }
  };

  const updateList = (data) => {
    setSelect(data);
    if (data) {
      dispatch(setListDownload(file));
    } else {
      dispatch(removeListDownload(file));
    }
  };

  const handleClick = (event, data) => {
    if (data.action === "restore") {
      restore();
    } else if (data.action === "delete") {
      deleteFile();
    }
  };

  const handleRestore = () => {
    restore(file);
    setToggle(false);
  };

  //แทนที่ไฟล์เดิม
  const handleReplace = async () => {
    //ลบไฟล์เก่าออกจาก Oss
    client.delete(
      `${fileDuplicate.owner}/${fileDuplicate.currentId}${fileDuplicate.type}`
    );
    //ลบข้อมูลไฟล์เก่าออกจาก Firestore
    await dbFile(fileDuplicate.owner)
      .doc(fileDuplicate.currentId)
      .delete()
      .then(() => {
        logFile(user.uid, username, file, "ลบถาวร");
        dispatch(setAllused(-fileDuplicate.size));
        updateSize(file.owner, file.size, "minus");
      });

    //กำหนดสถานะถังขยะเป็นผิด (ไฟล์ที่ทำการรีสโตร์)
    await dbFile(file.owner)
      .doc(file.currentId)
      .update({
        bin: false,
      })
      .then(() => {
        setDuplicate(false);
        dispatch(removeFile(fileDuplicate));
        logFile(user.uid, username, file, "รีสโตร์");
        swal("รีสโตร์สำเร็จ", {
          icon: "success",
          button: false,
        });
      })
      .catch(() => {
        swal("Error !", {
          icon: "error",
          button: false,
        });
      });
  };
  //เปลี่ยนชื่อใหม่
  const handleChangeName = async () => {
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
    let nameRecovery = fileDuplicate.name + " (recovery)";
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
      newName = file.name + ` (recovery) (${filterName.length + 1})`;
    } else {
      let index = countNumber.findIndex((item) => item.name === nameRecovery);
      if (index >= 0) {
        newName = file.name + " (recovery) (1)";
      } else {
        newName = file.name + " (recovery)";
      }
    }
    //กำหนดสถานะถังขยะเป็นผิด และอัพเดทชื่อไฟล์ใหม่
    await dbFile(file.owner)
      .doc(file.currentId)
      .update({
        bin: false,
        name: newName,
      })
      .then(() => {
        setDuplicate(false);
        // dispatch(removeFileBin(file));
        logFile(user.uid, username, file, "รีสโตร์");
        swal("รีสโตร์สำเร็จ", {
          icon: "success",
          button: false,
        });
      })
      .catch(() => {
        swal("Error !", {
          icon: "error",
          button: false,
        });
      });
  };

  const handleRightClick = (event) => {
    setSelectAll();
    setTimeout(() => {
      setSelect(true);
      dispatch(setOneUpload(file));
    }, 100);
  };

  return (
    <div className="file__container">
      {file.type === "folder" ? (
        <>
          <ContextMenuTrigger id={file.currentId}>
            <div
              className={select ? "file__item__select" : "file__item"}
              onContextMenu={handleRightClick}
              onDoubleClick={() => setToggle(true)}
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
                  onClick={() => updateList(!select)}
                />
                <FolderOpenIcon
                  style={{
                    color: "#01758E",
                    marginRight: "10px",
                  }}
                />
                <label className="file__label__overflow">{file.name}</label>
              </div>
              <div style={{ width: "30%" }}>
                {file.path.map((value, index) => (
                  <label key={index}>{value.name}/</label>
                ))}
              </div>
            </div>
          </ContextMenuTrigger>
          <ContextMenu id={file.currentId}>
            <MenuItem
              data={{ action: "restore", file: file }}
              onClick={handleClick}
            >
              <RestoreIcon style={{ marginRight: "10px" }} />
              รีสโตร์
            </MenuItem>
            <MenuItem
              data={{ action: "delete", file: file }}
              onClick={handleClick}
            >
              <DeleteOutlineIcon style={{ marginRight: "10px" }} />
              นำออกจากถังขยะ
            </MenuItem>
          </ContextMenu>
        </>
      ) : (
        <>
          <ContextMenuTrigger id={file.currentId}>
            <div
              className={select ? "file__item__select" : "file__item"}
              onContextMenu={handleRightClick}
              onDoubleClick={() => setToggle(true)}
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
                  onClick={() => updateList(!select)}
                />
                {preview ? (
                  <Image
                    style={{
                      width: "20px",
                      marginRight: "10px",
                      backgroundColor: "#c4c4c4",
                      borderRadius: "3px",
                    }}
                    src={`data:image/png;base64,${preview}`}
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
                <label
                  className="file__label__overflow"
                  style={{ marginRight: "10px" }}
                >
                  {file.name}
                  {file.type}
                </label>
              </div>
              <div style={{ width: "30%" }}>
                {file.path.map((value, index) => (
                  <label key={index}>{value.name}/</label>
                ))}
              </div>
            </div>
          </ContextMenuTrigger>
          <ContextMenu id={file.currentId}>
            <MenuItem
              data={{ action: "restore", file: file }}
              onClick={handleClick}
            >
              <RestoreIcon style={{ marginRight: "10px", color: "#ffffff" }} />
              <small style={{ color: "#ffffff" }}>รีสโตร์</small>
            </MenuItem>
            <MenuItem
              data={{ action: "delete", file: file }}
              onClick={handleClick}
            >
              <DeleteOutlineIcon
                style={{ marginRight: "10px", color: "#ffffff" }}
              />
              <small style={{ color: "#ffffff" }}>นำออกจากถังขยะ</small>
            </MenuItem>
          </ContextMenu>
        </>
      )}

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
              {file.name}
              {file.type} ?
            </strong>
          </label>
        }
        open={duplicate}
        handleClose={handleChangeName}
        handleAgree={handleReplace}
        textClose={"สร้างไฟล์ใหม่"}
        textSubmit={"แทนที่ไฟล์เดิม"}
      />

      <DialogAgreement
        title={<label>ยืนยันการรีสโตร์ไฟล์ ?</label>}
        description={
          <label>
            ท่านต้องการรีสโตร์ไฟล์{" "}
            <strong style={{ color: "#000000" }}>
              {file.name}
              {file.type} ?
            </strong>
          </label>
        }
        open={toggle}
        handleClose={() => setToggle(false)}
        handleAgree={handleRestore}
        textClose={"ยกเลิก"}
        textSubmit={"ยืนยัน"}
      />
    </div>
  );
};

export default FileBin;
