import React, { useState, useRef, useEffect } from "react";

import swal from "sweetalert";

import { countSize } from "../util/util";
import { saveAs } from 'file-saver';

import { useDispatch, useSelector } from "react-redux";
import {
  setBackPath,
  setIsLoading,
  setHideList,
  setReserSize,
} from "../redux/services";

import {
  removeListDownloadAll,
  setListUpload,
  setMyFiles,
  setMyFolders,
  deleteDuplicateList,
} from "../redux/listValue";

import { Link, useHistory } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { useParams } from "react-router-dom";

import axios from "../axios";
import Folder from "../components/Folder";
import DialogAgreement from "../util/DialogAgreement";
import DashCloud from "../components/DashCloud";
import Loading from "../components/Loading";

import "../css/Homepage.css";

import logoNew from "../images/new.png";

import CloudDownloadIcon from "@material-ui/icons/CloudDownload";

import DeleteRoundedIcon from "@material-ui/icons/DeleteRounded";

import CloseIcon from "@material-ui/icons/Close";

import { FormControl, InputGroup } from "react-bootstrap";

import {
  Button,
  Menu,
  MenuItem,
  Checkbox,
  // InputBase,
  Breadcrumbs,
  IconButton,
} from "@material-ui/core";

import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import DuplicateFileUpload from "../components/DuplicateFileUpload";
import File from "../components/File";
import { auth, db, dbFile, dbFolder, firebase, logFile } from "../firebase";
import { client } from "../aliOss";
import JSZip from "jszip";

const MyCloud = () => {
  const dispatch = useDispatch();
  const myFiles = useSelector((state) => state.listValue.myFiles);
  const myFolders = useSelector((state) => state.listValue.myFolders);
  const user = useSelector((state) => state.service.user);
  const path = useSelector((state) => state.service.path);
  const detail = useSelector((state) => state.service.detail);
  const onload = useSelector((state) => state.service.onload);
  const sideBarCss = useSelector((state) => state.service.sideBarCss);
  const isLoading = useSelector((state) => state.service.isLoading);
  const sizeUsed = useSelector((state) => state.service.sizeUsed);
  const reserSize = useSelector((state) => state.service.reserSize);
  const listDownload = useSelector((state) => state.listValue.listDownload);
  const duplicateFiles = useSelector((state) => state.listValue.duplicateFiles);

  const { folderId } = useParams();
  const [files, setFiles] = useState(null);
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [agreeDownload, setAgreeDownload] = useState(false);
  const [agreeDelete, setAgreeDelete] = useState(false);
  const [agreeUpload, setAgreeUpload] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  const [duplicateBox, setDuplicateBox] = useState(false);
  const [upload, setUpload] = useState(false);
  const [uploadAll, setUploadAll] = useState(false);
  const [countFileUpload, setCountFileUpload] = useState(null);

  const inputFile = useRef(null);

  const history = useHistory();

  useEffect(() => {
    dispatch(setIsLoading(true));
    dispatch(removeListDownloadAll([])); //เคลียร์ลิสดาวน์โหลด
    dispatch(deleteDuplicateList());  //เคลียร์ลิสไฟล์ซ้ำ

    // หาเส้นทางปัจจุบัน
    const breadcrumbs = async () => {
      let path = await dbFolder(user.uid)
        .where("currentId", "==", folderId)
        .get()
        .then((snap) => {
          let data;
          snap.forEach((doc) => {
            data = doc.data();
          });
          return data;
        })
        .catch((err) => console.log({ message: err.message }));
      dispatch(
        setBackPath([...path.path, { id: path.currentId, name: path.name }]) //กำหนดเส้นทางไฟล์
      );
    };

    if (user && folderId !== undefined && user.uid !== folderId) {
      breadcrumbs();
    } else if (user) {
      dispatch(setBackPath([{ id: user.uid, name: "Home" }]));
    }

    // let isComponentMounted = true;
    if (user) {
      // check verified
      if (!auth.currentUser.emailVerified) {
        swal("กรุณายืนยันอีเมล์", {
          icon: "error",
          button: false,
        }).then(() => {
          history.push("setting");
          return;
        });
      }
      //เช็ครูท
      if (folderId === undefined || folderId === user.uid) {
        //ดึงข้อมูลไฟล์จาก firestore
        const subFiles = db
          .collection("drive")
          .doc(user.uid)
          .collection("files")
          .onSnapshot((querySnapshot) => {
            //ไม่มีไฟล์
            if (querySnapshot.empty) {
              dispatch(setIsLoading(false));
              dispatch(setMyFiles([])); //กำหนดไฟล์
              return;
            }
            let files = [];
            querySnapshot.forEach((doc) => {
              if (
                doc.data().parentId === user.uid &&
                doc.data().bin === false
              ) {
                files.push(doc.data());
              }
            });
            dispatch(setIsLoading(false));
            dispatch(setMyFiles(files)); //กำหนดไฟล์
          });
        //ดึงข้อมูลโฟล์เดอร์จาก firestore
        const subFolders = db
          .collection("drive")
          .doc(user.uid)
          .collection("folders")
          .onSnapshot((querySnapshot) => {
            //ไม่มีโฟล์เดอร์
            if (querySnapshot.empty) {
              dispatch(setIsLoading(false));
              dispatch(setMyFolders([])); //กำหนดโฟล์เดอร์
              return;
            }
            let folders = [];
            querySnapshot.forEach((doc) => {
              if (
                doc.data().parentId === user.uid &&
                doc.data().bin === false
              ) {
                folders.push(doc.data());
              }
            });
            dispatch(setIsLoading(false));
            dispatch(setMyFolders(folders)); //กำหนดโฟล์เดอร์
          });
        dispatch(setBackPath([{ id: user.uid, name: "Home" }])); //กำหนดเส้นทางเป็นรูท
        return () => {
          subFiles();
          subFolders();
        };
      } else {
        const subFiles = db
          .collection("drive")
          .doc(user.uid)
          .collection("files")
          .onSnapshot((querySnapshot) => {
            if (querySnapshot.empty) {
              dispatch(setIsLoading(false));
              dispatch(setMyFiles([]));
              return;
            }
            let files = [];
            querySnapshot.forEach((doc) => {
              if (
                doc.data().parentId === folderId &&
                doc.data().bin === false
              ) {
                files.push(doc.data());
              }
            });
            dispatch(setIsLoading(false));
            dispatch(setMyFiles(files));
          });
        const subFolders = db
          .collection("drive")
          .doc(user.uid)
          .collection("folders")
          .onSnapshot((querySnapshot) => {
            if (querySnapshot.empty) {
              dispatch(setIsLoading(false));
              dispatch(setMyFolders([]));
              return;
            }
            let folders = [];
            querySnapshot.forEach((doc) => {
              if (
                doc.data().parentId === folderId &&
                doc.data().bin === false
              ) {
                folders.push(doc.data());
              }
            });
            dispatch(setIsLoading(false));
            dispatch(setMyFolders(folders));
          });
        return () => {
          subFiles();
          subFolders();
        };
      }
    }
  }, [dispatch, folderId, user]);

  //รับไฟล์จากเดสท็อป*
  const handleAdd = (event) => {
    setUpload(false);
    setFiles([]);

    let files = event.target.files;
    if (event.target.files.length === 0) return;

    let listFiles = [];
    let checkFile = false;

    let parentId;

    //เช็ค path folder
    if (folderId === undefined) {
      parentId = user.uid;
    } else {
      parentId = folderId;
    }

    //for list file upload
    for (let i = 0; i < files.length; i++) {
      let newName = files[i].name.split("."); //กำหนดชิ่อไฟล์
      newName.splice(newName.length - 1, 1); //เอานามสกุลไฟล์ออก

      let id = uuidv4(); //กำหนด id ไฟล์

      //กำหนดดาต้าที่จะอัพโหลด
      let data = {
        uid: user.uid,
        id: id,
        file: files[i],
        parentId: parentId,
        uploaded: false,
        name: newName.join(" "),
        size: files[i].size,
        type: "." + files[i].name.split(".").pop(),
        path: JSON.stringify(path),
        replace: false,
        username: detail.name,
        email: detail.email,
        avatar: detail.img_profile,
      };

      dispatch(setReserSize(files[i].size)); // จองพื้นที่

      listFiles.push(data); //เก็บไฟล์ทั้งหมด

      //เช็คไฟล์ซ้ำ
      let index = myFiles.findIndex(
        (file) => file.name + file.type === files[i].name
      );
      if (index >= 0) {
        checkFile = true;
      }
    }

    if (!files) {
      return;
    }
    else if (checkFile) {
      setFiles(listFiles); //กำหนดไฟล์ที่จะอัพโหลด
      setDuplicateBox(true); //เปิด modal เลือกอัพเดทไฟล์
      event.target.value = null;
    } else {
      setCountFileUpload(listFiles.length); //จำนวนที่ไฟล์อัพโหลด
      setFiles(listFiles); //กำหนดไฟล์ที่จะอัพโหลด
      setAgreeUpload(true); //เปิด modal อัพโหลดปกติ
      event.target.value = null;
    }
  };

  //ส่งไฟล์ไปอัพโหลดที่ UploadFile.js*
  const uploadFile = () => {
    //เช็คพื้นที่ที่เหลือ
    if (parseInt(detail.used) + countSize(reserSize) > parseInt(detail.max)) {
      swal("พื้นที่เต็ม!", {
        icon: "error",
        button: false,
      }).then(() => {
        files.forEach((file) => {
          dispatch(setReserSize(-file.size))
        });
        setFiles(null)
        dispatch(removeListDownloadAll([]));
        setAgreeUpload(false);
        return;
      })
    }
    else if (listDownload.length !== 0) {
      dispatch(removeListDownloadAll([]));
      return;
    } else {
      setAgreeUpload(false);
      files.forEach((file) => {
        dispatch(setListUpload(file)); //กำหนดค่า listUpload
      });
      dispatch(setHideList(false)); // เปิดลิสอัพโหลด
    }
  };

  //ยกเลิกอัพโหลด*
  const handleCancelUpload = () => {
    setAgreeUpload(false)
    files.forEach((file) => {
      dispatch(setReserSize(-file.size)) //ลดพื้นที่ที่จองไว้
    });
  }

  const handleInput = () => {
    handleClose();
    inputFile.current.click();
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  //สร้างโฟล์เดอร์*
  const handleCreateFolder = () => {
    if (detail && user) {
      let parentId;
      //เช็ค path folder
      if (folderId === undefined) {
        parentId = user.uid;
      } else {
        parentId = folderId;
      }
      if (listDownload.length !== 0) dispatch(removeListDownloadAll([]));
      if (folderName === "") {
        return;
      }
      setFolder(false);
      dispatch(setIsLoading(true));
      let id = uuidv4(); //กำหนด id folder
      //กำหนดข้อมูลที่จะอัพโหลด
      let data = {
        currentId: id,
        parentId: parentId,
        name: folderName,
        bin: false,
        type: "folder",
        path: path,
        owner: user.uid,
        share: [
          {
            name: detail.name,
            avatar: detail.img_profile,
            email: detail.email,
            role: "เจ้าของ",
          },
        ],
        createdAt: Date.now(),
      };
      //อัพโหลดโฟล์เดอร์
      dbFolder(user.uid)
        .doc(id)
        .set(data)
        .then(() => {
          logFile(user.uid, detail.name, data, "สร้างโฟล์เดอร์");
          dispatch(setIsLoading(false));
          setFolderName("");
        });
    }
  };
  //ยกเลิกสร้างโฟล์เดอร์*
  const handleCloseFolder = () => {
    setFolderName("");
    setFolder(false);
  };
  //นำไฟล์ออกไปที่ถังขยะ*
  const handleRemove = async () => {
    await Promise.all(
      //loop ข้อมูลทั้งหมด
      listDownload.map(async (item) => {
        //โฟล์เดอร์
        if (item.type === "folder") {
          //ย้ายไปที่ถังขยะ
          await dbFolder(item.owner).doc(item.currentId).update({
            bin: true,
          });
          logFile(user.uid, detail.name, item, "นำออก");
        } else {
          //ไฟล์
          let share = [];
          await dbFile(item.owner)
            .doc(item.currentId)
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
            });
          logFile(user.uid, detail.name, item, "นำออก");

          //ลบข้อมูลไฟล์ที่ผู้ใช้ได้รับการแชร์ไฟล์
          share.forEach((item) => {
            db.collection("drive")
              .doc(item.uid)
              .collection("share")
              .doc(item.currentId)
              .delete();
          });
        }
      })
    )
      .then(() => {
        setAgreeDelete(false);
        setSelectAll(false);
        swal("นำออกสำเร็จ", {
          icon: "success",
          button: false,
        });
      })
      .catch((err) =>
        swal(err.message, {
          icon: "error",
          button: false,
        })
      );
  };

  // ส่งไฟล์ไปอัพโหลด หลังจากประมวลผลการแทนที่ไฟล์หรือสร้างไฟล์ใหม่*
  const selectedDuplicate = () => {
    dispatch(setHideList(false));
    duplicateFiles.map((file) => dispatch(setListUpload(file))); // กำหนดค่า listUpload
    // setUploadBox();
    setTimeout(() => {
      setDuplicateBox(false);
      setUpload(false);
      setFiles([]);
    }, 100);
  };

  //ยกเลิกอัพโหลด*
  const cancelDuplicate = () => {
    files.forEach((file) => {
      dispatch(setReserSize(-file.size)) //ลบพื้นที่ที่จองไว้
    });
    //เคลียร์ค่า
    dispatch(deleteDuplicateList());
    setFiles([]);
    setDuplicateBox(false);
    setUploadAll(false);
    setUpload(false);
  };
  //ดาวน์โหลดแบบหลายไฟล์*
  const handleMultiDownload = async () => {
    const zipped = new JSZip();
    //ลูปไฟล์ที่จะทำการดาวน์โหลด
    const promise = listDownload.map(async (file) => {
      let path = `${file.owner}/${file.currentId}${file.type}`; //กำหนดไฟล์ที่จะทำการดาวน์โหลด
      let result = await client.get(path) //ดึงข้อมูลจาก OSS ***บัคไฟล์ขนาดใหญ่
      zipped.file(file.name + file.type, result.content, { binary: true });  //บีบอัดไฟล์ที่โหลด
    })

    await Promise.all(promise)

    //โหลดไฟล์บีบอัด
    zipped.generateAsync({ type: "blob" })
      .then(function callback(blob) {
        saveAs(blob, "example.zip");
      });
  }

  return (
    <div className={sideBarCss ? "hp__bg__hide" : "hp__bg__show"}>
      <div className="homepage__background__inside">
        {detail && <DashCloud sizeUsed={sizeUsed} detail={detail} />}
        <div>
          {user && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                margin: "15px 30px 0 30px",
              }}
            >
              <Button
                aria-controls="simple-menu"
                aria-haspopup="true"
                style={{
                  display: "flex",
                  backgroundImage: `linear-gradient(89.78deg, #025376 -17.59%, #01B3BC 135.89%)`,
                  borderRadius: "15px",
                  width: "100px",
                  color: "#ffffff",
                  boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2)",
                }}
                onClick={handleClick}
              >
                <img src={logoNew} alt="" />
                สร้าง
              </Button>

              <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                disableScrollLock={true}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem
                  style={{ fontFamily: "mainFont" }}
                  onClick={handleInput}
                >
                  อัพโหลดไฟล์
                </MenuItem>
                <MenuItem
                  style={{ fontFamily: "mainFont" }}
                  onClick={() => {
                    setFolder(true);
                    handleClose();
                  }}
                >
                  สร้างโฟล์เดอร์
                </MenuItem>
              </Menu>

              <input
                id="addFile"
                ref={inputFile}
                type="file"
                onChange={handleAdd}
                style={{ display: "none" }}
                multiple
              />
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              margin: "15px 0 0 0",
            }}
          >
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              aria-label="breadcrumb"
              style={{
                width: "100%",
                borderRadius: "10px",
                marginLeft: "30px",
                paddingLeft: "15px",
                backgroundImage: `linear-gradient(90deg, #025477 -3.94%, #01B6BF 68.83%)`,
                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2)",
              }}
            >
              {user &&
                path.map((childs, index) => (
                  <div key={index} style={{ margin: "5px 10px 5px 10px" }}>
                    {path.length === index + 1 && index !== 0 ? (
                      <label
                        style={{
                          color: "#c4c4c4",
                          textDecoration: "none",
                          fontSize: "17px",
                          fontWeight: "bold",
                        }}
                      >
                        {childs.name}
                      </label>
                    ) : (
                      <>
                        {user.uid === folderId || folderId === undefined ? (
                          <Link
                            to={"/myCloud/" + user.uid}
                            style={{
                              color: "#ffffff",
                              textDecoration: "none",
                              fontSize: "17px",
                              fontWeight: "bold",
                            }}
                          >
                            {childs.name}
                          </Link>
                        ) : (
                          <Link
                            to={"/myCloud/" + childs.id}
                            style={{
                              color: "#ffffff",
                              textDecoration: "none",
                              fontSize: "17px",
                              fontWeight: "bold",
                            }}
                            onClick={() => dispatch(setIsLoading(true))}
                          >
                            {childs.name}
                          </Link>
                        )}
                      </>
                    )}
                  </div>
                ))}
            </Breadcrumbs>

            <IconButton
              style={{
                backgroundImage: `linear-gradient(89.78deg, #025376 -17.59%, #01B3BC 135.89%)`,
                margin: "0 5px 0 5px",
                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2)",
                borderRadius: "15px",
                padding: "7px",
              }}
              onClick={() => setAgreeDownload(true)}
            >
              <CloudDownloadIcon style={{ color: "#ffffff" }} />
            </IconButton>

            <IconButton
              style={{
                backgroundImage: `linear-gradient(89.78deg, #025376 -17.59%, #01B3BC 135.89%)`,
                margin: "0 30px 0 5px",
                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2)",
                borderRadius: "15px",
                padding: "7px",
              }}
              onClick={() => setAgreeDelete(true)}
            >
              <DeleteRoundedIcon style={{ color: "#ffffff" }} />
            </IconButton>
          </div>

          <div className="homepage__data">
            <div className="homepage__title">
              <div className="file__item__desc">
                <Checkbox
                  style={{
                    color: "#ffffff",
                    paddingLeft: "0",
                    paddingRight: "15px",
                    margin: "0",
                  }}
                  checked={selectAll}
                  onClick={() => setSelectAll(!selectAll)}
                />
                <label>ชื่อ</label>
              </div>
              <label className="homepage__title__date">เวลา</label>
              <label className="homepage__title__size">ขนาด</label>
            </div>
            <div className="homepage__items">
              {isLoading ? (
                <div className="homepage__loading">
                  <Loading size={"5rem"} />
                </div>
              ) : (
                <>
                  {myFolders.length === 0 && myFiles.length === 0 ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <h1 style={{ color: "#AFAFAF" }}>No Data</h1>
                    </div>
                  ) : (
                    <>
                      {myFolders.length !== undefined &&
                        user &&
                        detail &&
                        myFolders
                          .filter(
                            (item) =>
                              item.name !== undefined &&
                              item.name
                                .split(".")[0]
                                .toLowerCase()
                                .includes(search.trim())
                          )
                          .map((folder, index) => (
                            <Folder
                              selectAll={selectAll}
                              key={index}
                              folder={folder}
                              user={user}
                              username={detail.name}
                              setSelectAll={() => setSelectAll(false)}
                              onload={onload}
                            />
                          ))}
                      {myFiles.length !== undefined &&
                        user &&
                        detail &&
                        myFiles
                          .filter(
                            (item) =>
                              item.name !== undefined &&
                              item.name
                                .split(".")[0]
                                .toLowerCase()
                                .includes(search.trim())
                          )
                          .map((file, index) => (
                            <File
                              selectAll={selectAll}
                              setSelectAll={() => setSelectAll(false)}
                              key={file.currentId}
                              file={file}
                              user={user}
                              username={detail.name}
                              myEmail={detail.email}
                              onload={onload}
                            />
                          ))}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <DialogAgreement
        // title={`ยืนยันการลบไฟล์ ?`}
        description={
          <strong style={{ color: "#ffffff" }}>Next version...</strong>
        }
        open={agreeDownload}
        handleClose={() => setAgreeDownload(false)}
        handleAgree={handleMultiDownload}
        textClose={"ยกเลิก"}
        textSubmit={"ยืนยัน"}
        hidenBtn={true}
      />

      <DialogAgreement
        title={
          <label
            style={{ fontSize: "30px", fontWeight: "bold", color: "#ffffff" }}
          >
            ยืนยันการนำไฟล์ออกจากคราวด์
          </label>
        }
        description={
          <label style={{ color: "#ffffff" }}>
            ท่านต้องการลบไฟล์ทั้งหมด{" "}
            <strong style={{ color: "#ffffff" }}>
              {listDownload.length} ไฟล์
            </strong>
          </label>
        }
        // description={<strong>Next version...</strong>}
        open={agreeDelete}
        handleClose={() => setAgreeDelete(false)}
        // handleAgree={() => setAgreeDelete(false)}
        handleAgree={handleRemove}
        textClose={"ยกเลิก"}
        textSubmit={"ยืนยัน"}
      // hidenBtn={true}
      />

      <DialogAgreement
        title={
          <label
            style={{ fontSize: "30px", fontWeight: "bold", color: "#ffffff" }}
          >
            ยืนยันการอัพโหลด ?
          </label>
        }
        description={
          <label style={{ color: "#ffffff" }}>
            ท่านต้องการอัพโหลดไฟล์ทั้งหมด{" "}
            <strong style={{ color: "#ffffff" }}>
              {countFileUpload ? countFileUpload : 0} ไฟล์
            </strong>
          </label>
        }
        open={agreeUpload}
        handleClose={handleCancelUpload}
        handleAgree={uploadFile}
        textClose={"ยกเลิก"}
        textSubmit={"ยืนยัน"}
      />

      <DialogAgreement
        title={
          <label
            style={{ fontSize: "30px", fontWeight: "bold", color: "#ffffff" }}
          >
            สร้างโฟล์เดอร์
          </label>
        }
        description={
          <InputGroup className="mb-3">
            <FormControl
              style={{ fontSize: "20px" }}
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              aria-label="Small"
              aria-describedby="inputGroup-sizing-sm"
            />
          </InputGroup>
        }
        open={folder}
        handleClose={handleCloseFolder}
        handleAgree={handleCreateFolder}
        textClose={"ยกเลิก"}
        textSubmit={"ยืนยัน"}
      />

      {duplicateBox && files && (
        <div className="sidebar__back">
          <div className="duplicate__container">
            <div className="duplicate__header">
              <div className="duplicate__title">
                <label style={{ color: "#ffffff" }}>ไฟล์ที่ต้องการอัพเดต</label>
                <IconButton
                  style={{ padding: "5px" }}
                  onClick={cancelDuplicate}
                >
                  <CloseIcon />
                </IconButton>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: "40%",
                  paddingLeft: "10px",
                  backgroundColor: "#FFFFFF",
                  width: "100%",
                }}
              >
                <label>กรุณาเลือกไฟล์ที่ท่านต้องการอัพเดต</label>
              </div>
            </div>
            <div className="duplicate__items">
              {files &&
                files.map((file, index) => (
                  <DuplicateFileUpload
                    key={index}
                    file={file}
                    upload={upload}
                    uploadAll={uploadAll}
                    myFiles={myFiles}
                    uid={user.uid}
                    username={detail.name}
                    avatar={detail.img_profile}
                    email={detail.email}
                    parentId={folderId === undefined ? user.uid : folderId}
                    path={path}
                  />
                ))}
            </div>
            <div className="duplicate__btn">
              <Button
                style={{
                  backgroundColor: "#ffffff",
                  height: "75%",
                  marginRight: "10px",
                }}
                onClick={selectedDuplicate}
              >
                อัพเดตที่เลือก
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCloud;
