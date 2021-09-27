import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  deleteDuplicateList,
  setParentRestore,
  removeFileBin,
  removeListDownload,
  removeListDownloadAll,
  removeRR,
  setDuplicateList,
  setListUpload,
  setRestoreRemove,
} from "../redux/listValue";
// import { changeDuplicateList } from "../redux/listValue";

import axios from "../axios";

import FileBin from "../components/FileBin";
import Loading from "../components/Loading";
import DashCloud from "../components/DashCloud";
import DialogAgreement from "../util/DialogAgreement";

import "../css/Bin.css";

import DeleteIcon from "@material-ui/icons/Delete";
import RestoreIcon from "@material-ui/icons/Restore";
import CloseIcon from "@material-ui/icons/Close";

import { Checkbox, IconButton, InputBase, Button } from "@material-ui/core";
import { auth, db, dbFile, dbFolder, logFile, updateSize } from "../firebase";
import swal from "sweetalert";
import { client } from "../aliOss";
import DuplicateFileUpload from "../components/DuplicateFileUpload";
import DuplicateRestore from "../components/DuplicateRestore";
import { useHistory } from "react-router";

const Bin = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.service.user);
  const detail = useSelector((state) => state.service.detail);
  const sideBarCss = useSelector((state) => state.service.sideBarCss);

  const sizeUsed = useSelector((state) => state.service.sizeUsed);
  const listDownload = useSelector((state) => state.listValue.listDownload);
  const restoreDup = useSelector((state) => state.listValue.restoreDup);
  const duplicateFileRestore = useSelector(
    (state) => state.listValue.duplicateFiles
  );

  // const myBin = useSelector((state) => state.listValue.myBin);
  // const myBinFolder = useSelector((state) => state.listValue.myBinFolder);

  const [agreeDelete, setAgreeDelete] = useState(false);
  const [agreeRestore, setAgreeRestore] = useState(false);
  const [search, setSearch] = useState("");
  const [selectAll, setSelectAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileBin, setFileBin] = useState([]);
  const [folderBin, setFolderBin] = useState([]);

  const history = useHistory();


  useEffect(() => {
    setIsLoading(true);
    dispatch(removeListDownloadAll([]));
    dispatch(deleteDuplicateList());

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
      //ดึงข้อมูลไฟล์จาก firestore
      const subFiles = db
        .collection("drive")
        .doc(user.uid)
        .collection("files")
        .onSnapshot((querySnapshot) => {
          //ไม่มีไฟล์
          if (querySnapshot.empty) {
            setIsLoading(false);
            setFileBin([]); //กำหนดไฟล์
            return;
          }
          let files = [];
          querySnapshot.forEach((doc) => {
            if (doc.data().bin === true) {
              files.push(doc.data());
            }
          });
          setIsLoading(false);
          setFileBin(files); //กำหนดไฟล์
        });
      const subFolders = db
        .collection("drive")
        .doc(user.uid)
        .collection("folders")
        .onSnapshot((querySnapshot) => {
          //ไม่มีโฟล์เดอร์
          if (querySnapshot.empty) {
            setIsLoading(false);
            setFolderBin([]); //กำหนดโฟล์เดอร์
            return;
          }
          let folders = [];
          querySnapshot.forEach((doc) => {
            if (doc.data().bin === true) {
              folders.push(doc.data());
            }
          });
          setIsLoading(false);
          setFolderBin(folders); //กำหนดโฟล์เดอร์
        });
      return () => {
        subFiles();
        subFolders();
      };
    }
  }, [dispatch, setIsLoading, user]);

  //ลบไฟล์ถาวร แบบหลายไฟล์
  const handleDelete = async () => {
    await Promise.all(
      listDownload.map(async (item) => {
        //เช็ตชนิดไฟล์
        if (item.type === "folder") {
          // หาโฟล์เดอร์ลูกทั้งหมด
          let findFolder = await dbFolder(user.uid)
            .where("path", "array-contains", {
              id: item.currentId,
              name: item.name,
            })
            .get();
          // หาไฟล์ลูกทั้งหมด
          let findFile = await dbFile(user.uid)
            .where("path", "array-contains", {
              id: item.currentId,
              name: item.name,
            })
            .get();

          // ลบโฟล์เดอร์ลูกทั้งหมด
          findFolder.forEach(async (doc) => {
            logFile(user.uid, detail.name, doc.data(), "นำออกจากถังขยะ");
            // keepLogFile(uid, doc.data().currentId);
            doc.ref.delete();
          });
          // ลบไฟล์ลูกทั้งหมด
          findFile.forEach((doc) => {
            let size = doc.data().size;
            let from = `${user.uid}/${doc.data().currentId}${doc.data().type}`; //เส้นทางไฟล์ Oss

            let to = `${user.uid}/keep/${doc.data().currentId}${doc.data().type
              }`;
            client.delete(from); //ลบไฟล์ออกจาก Oss

            /* let oss = await client.copy(to, from).then(() => {
            client.delete(from);
          }); */
            updateSize(user.uid, size, "minus");
            logFile(user.uid, detail.name, doc.data(), "นำออกจากถังขยะ");
            // keepLogFile(uid, doc.data().currentId);
            doc.ref.delete(); //ลบข้อมูลออกจาก Firestore
          });

          //ลบโฟล์เดอร์ตั้งต้น
          await dbFolder(user.uid)
            .doc(item.currentId)
            .delete()
            .then(() => {
              logFile(user.uid, detail.name, item, "นำออกจากถังขยะ");
            });

        } else {
          //ลบข้อมูลออกจาก Firestore
          await dbFile(user.uid)
            .doc(item.currentId)
            .delete()
            .then(() => {
              let from = `${item.owner}/${item.currentId}${item.type}`;
              let to = `${item.owner}/keep/${item.currentId}${item.type}`;
              client.delete(from); //ลบไฟล์ OSS
              updateSize(user.uid, item.size, "minus");
              logFile(user.uid, detail.name, item, "นำออกจากถังขยะ");
            });
        }
      })
    )
      .then(() => {
        swal("นำออกจากถังขยะสำเร็จ", {
          icon: "success",
          button: false,
        });
        setAgreeDelete(false);
        setSelectAll(false);
        dispatch(removeListDownloadAll([]));
      })
      .catch((err) => {
        swal(err.message, {
          icon: "error",
          button: false,
        });
        setSelectAll(false);
        setAgreeDelete(false);
        dispatch(removeListDownloadAll([]));
      });
  };
  //รีสโตร์ไฟล์ แบบหลายไฟล์
  const handleRestore = async () => {
    await Promise.all(
      listDownload.map(async (item) => {
        if (item.type === "folder") {
          //รีสโตร์โฟล์เดอร์ กำหนดชื่อโฟล์เดอร์ใหม่
          await dbFolder(item.owner)
            .doc(item.currentId)
            .update({
              bin: false,
              name: item.name + " (recovery)",
            })
            .then(async () => {
              //เปลี่ยนเส้นทางโฟล์เดอร์ลูก
              await dbFolder(item.owner)
                .where("path", "array-contains", {
                  id: item.currentId,
                  name: item.name,
                })
                .get()
                .then((snap) => {
                  if (snap.empty) {
                    return;
                  }
                  snap.forEach(async (doc) => {
                    //อัพเดทเส้นทางโฟล์เดอร์ลูก
                    let newData = await doc
                      .data()
                      .path.map((itemPath) =>
                        itemPath.id === item.currentId
                          ? { ...itemPath, name: item.name + " (recovery)" }
                          : itemPath
                      );
                    doc.ref.update({ path: newData });
                  });
                });
              dispatch(removeListDownload(item)); //ลบไฟล์ที่ทำการรีสโตร์เสร็จแล้วจากลิส
              logFile(user.uid, detail.name, item, "รีสโตร์"); 
              dispatch(removeRR(item)); //ลบไฟล์ที่ทำการรีสโตร์เสร็จแล้วจากลิส
            })
            .catch((err) => {
              swal(err, {
                icon: "error",
                button: false,
              });
            });
        } else {
          //เช็คไฟล์ซ้ำ
          let checkDuplicate = await dbFile(item.owner)
            .where("parentId", "==", item.parentId)
            .where("type", "==", item.type)
            .where("name", "==", item.name)
            .where("bin", "==", false)
            .get();
          //ไม่ซ้ำรีสโตร์ปกติ
          if (checkDuplicate.empty) {
            //กำหนดสถานะถังขยะเป็นผิด
            await dbFile(item.owner)
              .doc(item.currentId)
              .update({
                bin: false,
              })
              .then(() => {
                logFile(user.uid, detail.name, item, "รีสโตร์");
                dispatch(removeListDownload(item)); //ลบลิสไฟล์
              })
              .catch(() => {
                swal("Error !", {
                  icon: "error",
                  button: false,
                });
              });
          } else {
            await checkDuplicate.forEach((doc) => {
              dispatch(setDuplicateList({ cloud: doc.data(), bin: item })); //เก็บไฟล์ที่ซ้ำเพื่อทำไปประมวลผล
            });
          }
        }
      })
    ).then(() => {
      setAgreeRestore(false);
    });
  };

  const handleBoxRestore = () => {
    setAgreeRestore(false);
    setIsLoading(false);
  };

  const handleBoxDelete = () => {
    setAgreeDelete(false);
    setIsLoading(false);
  };
  //คัดกรองข้อมูลที่จะทำการรีสโตร์ไฟล์ 
  const selectedDuplicate = async () => {
    await Promise.all(
      restoreDup.map(async (item) => {
        //แทนที่ไฟล์เดิม
        if (item.replace === true) {
          if (item.cloud.type === "folder") {
          } else {
            let pathOss =
              item.cloud.owner + "/" + item.cloud.currentId + item.cloud.type; //เส้นทางไฟล์ Oss
            client.delete(pathOss); //ลบไฟล์เก่าจาก Oss
            dbFile(item.cloud.owner).doc(item.cloud.currentId).delete(); //ลบข้อมูลไฟล์เก่าจาก Firestore
            updateSize(item.cloud.owner, item.cloud.size, "minus"); 
            //กำหนดสถานะถังขยะเป็นผิด
            dbFile(item.bin.owner)
              .doc(item.bin.currentId)
              .update({
                bin: false,
              })
              .then(() => {
                logFile(user.uid, detail.name, item.bin, "รีสโตร์");
                dispatch(removeRR(item)); //ลบไฟล์ที่ทำการรีสโตร์เสร็จแล้วจากลิส
              });
          }
        } else {
          //สร้างไฟล์ใหม่
          dbFile(item.cloud.owner)
            .where("parentId", "==", item.cloud.parentId)
            .get()
            .then((snap) => {
              let newList = [];
              snap.forEach((doc) => {
                newList.push(doc.data());
              });
              //กำหนดชื่อใหม่
              let nameRecovery = item.bin.name;
              let filterName = newList.filter(
                (data) =>
                  data.name.substring(0, nameRecovery.length) ===
                  nameRecovery &&
                  data.name[nameRecovery.length] === " " &&
                  data.name[nameRecovery.length + 1] === "(" &&
                  data.name[nameRecovery.length + 3] === ")" &&
                  data.name.length === nameRecovery.length + 4
              );
              let newName;
              if (filterName.length > 0) {
                newName = item.bin.name + ` (${filterName.length + 1})`;
              } else {
                newName = item.bin.name + " (1)";
              }
              //อัพเดทไฟล์ด้วยชื่อใหม่ที่ทำการประมวลผลมา
              dbFile(item.bin.owner).doc(item.bin.currentId).update({
                name: newName,
                bin: false,
              });
            });
        }
      })
    )
      .then(() => {
        swal("รีสโตร์สำเร็จ", {
          icon: "success",
          button: false,
        });
        setAgreeRestore(false); //ปิดหน้าต่างรีสโตร์
        setSelectAll(false); //เคลียร์ไฟล์
        dispatch(removeListDownloadAll([])); //ลบไฟล์จากลิสทั้งหมด
        dispatch(deleteDuplicateList()); //ลบไฟล์ซ้ำจากลิสทั้งหมด
      })
      .catch((err) => {
        swal(err.message, {
          icon: "error",
          button: false,
        });
        setAgreeRestore(false);
        setAgreeDelete(false);
        dispatch(removeListDownloadAll([]));
        dispatch(deleteDuplicateList());
      });
  };

  return (
    <div className={sideBarCss ? "hp__bg__hide" : "hp__bg__show"}>
      <div className="homepage__background__inside">
        {detail && (
          <DashCloud
            updateSize={detail.used}
            detail={detail}
            sizeUsed={sizeUsed}
            handleSearch={
              <InputBase
                style={{ width: "100%" }}
                value={search}
                onChange={(e) => setSearch(e.target.value.toLocaleLowerCase())}
                placeholder="Search…"
              />
            }
          />
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginRight: "30px",
          }}
        >
          <div className="bin__text">
            <label style={{ fontWeight: "bold" }}>
              ถังขยะสำหรับไดร์ฟของฉัน
            </label>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "75px",
            }}
          >
            <IconButton
              style={{
                backgroundImage: `linear-gradient(89.78deg, #025376 -17.59%, #01B3BC 135.89%)`,
                margin: "0 5px 0 5px",
                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2)",
                borderRadius: "15px",
                heigth: "40px",
                padding: "7px",
              }}
              onClick={() => setAgreeRestore(true)}
            >
              <RestoreIcon style={{ color: "#ffffff" }} />
            </IconButton>

            <IconButton
              style={{
                backgroundImage: `linear-gradient(89.78deg, #025376 -17.59%, #01B3BC 135.89%)`,
                margin: "0 5px 0 5px",
                boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2)",
                borderRadius: "15px",
                padding: "7px",
              }}
              onClick={() => setAgreeDelete(true)}
            >
              <DeleteIcon style={{ color: "#ffffff" }} />
            </IconButton>
          </div>
        </div>
        <div className="homepage__data">
          <div className="homepage__title">
            <div>
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
          </div>

          <div className="homepage__items">
            {isLoading ? (
              <div className="homepage__loading">
                <Loading size={"5rem"} />
              </div>
            ) : (
              <>
                {fileBin?.length === 0 && folderBin?.length === 0 ? (
                  <div
                    style={{
                      display: "flex",
                      marginLeft: "15px",
                    }}
                  >
                    <label style={{ color: "#AFAFAF" }}>
                      ระบบจะทำการลบรายการในถังขยะแบบภาวรหลังจากผ่านไป 30 วัน
                    </label>
                  </div>
                ) : (
                  <>
                    {folderBin !== undefined &&
                      user &&
                      detail &&
                      folderBin
                        .filter(
                          (item) =>
                            item.name !== undefined &&
                            item.name
                              .split(".")[0]
                              .toLowerCase()
                              .includes(search.trim())
                        )
                        .map((file, index) => (
                          <FileBin
                            key={file.currentId}
                            selectAll={selectAll}
                            file={file}
                            user={user}
                            setSelectAll={() => setSelectAll(false)}
                            username={detail.name}
                          />
                        ))}
                    {fileBin !== undefined &&
                      user &&
                      detail &&
                      fileBin
                        .filter(
                          (item) =>
                            item.name !== undefined &&
                            item.name
                              .split(".")[0]
                              .toLowerCase()
                              .includes(search.trim())
                        )
                        .map((file, index) => (
                          <FileBin
                            key={file.currentId}
                            selectAll={selectAll}
                            file={file}
                            user={user}
                            username={detail.name}
                            setSelectAll={() => setSelectAll(false)}
                          />
                        ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {duplicateFileRestore.length > 0 && (
        <div className="sidebar__back">
          <div className="duplicate__container">
            <div className="duplicate__header">
              <div className="duplicate__title">
                <label style={{ color: "#ffffff" }}>ไฟล์ที่ต้องการอัพเดต</label>
                <IconButton>
                  <CloseIcon
                    onClick={() => {
                      dispatch(setRestoreRemove());
                      dispatch(deleteDuplicateList());
                    }}
                  />
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
              {duplicateFileRestore?.map((item) => (
                <DuplicateRestore key={item.currentId} file={item} />
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

      <DialogAgreement
        title={
          <label
            style={{ fontSize: "30px", fontWeight: "bold", color: "#ffffff" }}
          >
            ยืนยันการรีสโตร์ไฟล์ ?
          </label>
        }
        description={
          <label>
            ท่านต้องการดาวโหลดไฟล์ทั้งหมด{" "}
            <strong>{listDownload.length} ไฟล์</strong>
          </label>
        }
        // description={<strong>Next version...</strong>}
        open={agreeRestore}
        handleClose={handleBoxRestore}
        handleAgree={handleRestore}
        textClose={"ยกเลิก"}
        textSubmit={"ยืนยัน"}
      // hidenBtn={true}
      />

      <DialogAgreement
        title={
          <label
            style={{ fontSize: "30px", fontWeight: "bold", color: "#ffffff" }}
          >
            ยืนยันการนำออกจากถังขยะ ?
          </label>
        }
        description={
          <label style={{ color: "#ffffff" }}>
            ท่านต้องการลบไฟล์ในถังขยะทั้งหมด{" "}
            <strong style={{ color: "#ffffff" }}>
              {listDownload.length} ไฟล์
            </strong>
            <br />
            หากท่านกดยืนยัน ไฟล์ในถังขยะของท่านทั้งหมดจะหายไป
          </label>
        }
        // description={<strong>Next version...</strong>}
        open={agreeDelete}
        handleClose={handleBoxDelete}
        handleAgree={handleDelete}
        textClose={"ยกเลิก"}
        textSubmit={"ยืนยัน"}
      // hidenBtn={true}
      />
    </div>
  );
};

export default Bin;
