import React, { useState, useEffect } from "react";
import CloseIcon from "@material-ui/icons/Close";
import { IconButton, LinearProgress } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

import { client } from "../aliOss";
import { useDispatch, useSelector } from "react-redux";
import {
  addMyFiles,
  removeDuplicateList,
  setRemoveListUpload,
  updateMyFile,
} from "../redux/listValue";
import { setAllused, setHideList, setReserSize } from "../redux/services";
import { dbFile, logFile, updateSize } from "../firebase";
import { typeFile, getReadableFileSizeString } from "../util/util";
import swal from "sweetalert";

const BorderLinearProgress = withStyles(() => ({
  root: {
    height: 10,
    borderRadius: 10,
  },
  colorPrimary: {
    backgroundColor: "#C3E3E1",
  },
  bar: {
    borderRadius: 10,
    backgroundImage: "linear-gradient(90deg, #025477 -3.94%, #01B6BF 68.83%)",
  },
}))(LinearProgress);

const UploadFile = ({ file, remove, uploaded, exit }) => {
  const dispatch = useDispatch();
  const myFiles = useSelector((state) => state.listValue.myFiles);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [networkSpeed, setNetworkSpeed] = useState(null);

  let nameOss = file.id + "." + file.file.name.split(".").pop();

  //อัพโหลดไฟล์
  async function multipartUpload() {
    try {
      dispatch(setHideList(false));
      const partSize = 1024 * 1024; // กำหนดขนาดที่อัพโหลด
      //อัพโหลดไฟล์
      await client
        .multipartUpload(file.uid + "/" + nameOss, file.file, {
          partSize: partSize,
          meta: { time: 2021, people: file.currentId }, 
          mime: file.mimetype,
          //เปอร์เซนต์อัพโหลด
          progress: function (p, cpt, res) {
            setUploadPercent(p * 100);
            if (res) {
              setNetworkSpeed(parseInt(partSize / res.rt) * 1000) //เน็ตเวิร์คสปีด
            }

          },
        })
        .then(async () => {
          let uploadFirestore = Object.assign({}, file);
          delete uploadFirestore["file"]; //ลบไฟล์ออก
          //กรณีแทนที่
          if (uploadFirestore.replace) {
            //อัพเดทพื้นที่ทั้งหมด
            await dbFile(uploadFirestore.owner)
              .doc(uploadFirestore.currentId)
              .update({
                size: file.size,
              })
              .then(() => {
                // dispatch(removeDuplicateList(uploadFirestore));
                logFile(
                  file.uid,
                  file.username,
                  uploadFirestore,
                  "แทนที่ไฟล์เดิม"
                );
                updateSize(file.uid, file.newSize, "plus");
                dispatch(setAllused(file.newSize));
                dispatch(setReserSize(-file.size));
                uploaded(); //เปลี่ยนสถานะอัพโหลดเสร็จสิ้น
              })
              .catch((error) => {
                swal(error.response.data.message, {
                  icon: "error",
                  button: false,
                });
              });
          } else {
            let uploadFirestore = Object.assign({}, file);
            delete uploadFirestore["file"]; //ลบไฟล์ออก
            //เช็คไฟล์ซ้ำ
            let findFile = myFiles.find(
              (item) =>
                item.name === uploadFirestore.name &&
                item.type === uploadFirestore.type
            );
            let countName = findFile
              ? myFiles.filter(
                (item) =>
                  item.name.substring(0, file.name.length) === file.name &&
                  item.name[file.name.length] === " " &&
                  item.name[file.name.length + 1] === "(" &&
                  item.name[file.name.length + 3] === ")" &&
                  item.name.length === file.name.length + 4
              ).length
              : -1;
            //กำหนดชื่อไฟล์ใหม่
            let newName =
              countName < 0 ? file.name : file.name + ` (${countName + 1})`;
            //กำหนดข้อมูลที่อัพโหลดไปยัง Firestore
            let data = {
              ...uploadFirestore,
              currentId: file.id,
              parentId: file.parentId,
              name: newName,
              type: file.type,
              size: file.size,
              path: JSON.parse(file.path),
              bin: false,
              owner: file.uid,
              share: [
                {
                  name: file.username,
                  avatar: file.avatar,
                  email: file.email,
                  role: "เจ้าของ",
                },
              ],
              createdAt: Date.now(),
            };
            //อัพโหลดข้อมูลไปยัง Firestore
            await dbFile(file.uid)
              .doc(file.id)
              .set(data)
              .then(() => {
                logFile(file.uid, file.username, data, "อัพโหลด");
                updateSize(file.uid, file.size, "plus");
                dispatch(setReserSize(-file.size)); //ลบพื้นที่ที่จองไว้
                uploaded(); //เปลี่ยนสถานะอัพโหลดเสร็จสิ้น
              })
              .catch((error) => {
                swal(error.response.data.message, {
                  icon: "error",
                  button: false,
                });
              });
          }
        })
        .catch(function (err) {
          console.error(err);
          remove();
          client.cancel();
        });
    } catch (err) {
      console.error(err);
      remove();
      client.cancel();
    }
  }

  //เน็ตหลุด
  useEffect(() => {
    if (navigator.onLine) {
      return;
    } else {
      dispatch(setReserSize(-file.size)); //ลบพื้นที่ที่จองไว้
      dispatch(setRemoveListUpload(file.id)); //ลบไฟล์ออกจากลิสอัพโหลด
      client.cancel(); //ยกเลิกการอัพโหลด
    }
  });

  useEffect(() => {
    let isComponentMounted = true;
    if (isComponentMounted) {
      // console.log(file);
      multipartUpload();
    }
    return () => {
      isComponentMounted = false;
    };
  }, []);

  if (exit) {
    dispatch(setReserSize(-file.size)); //ลบพื้นที่ที่จองไว้
    dispatch(setRemoveListUpload(file.id)); //ลบไฟล์ออกจากลิสอัพโหลด
    client.cancel(); //ยกเลิกการอัพโหลด
  }
  //ยกเลิกการอัพโหลด
  const cancelMyupload = () => {
    dispatch(setReserSize(-file.size)); //ลบพื้นที่ที่จองไว้
    dispatch(setRemoveListUpload(file.id)); //ลบไฟล์ออกจากลิสอัพโหลด
    client.cancel(); //ยกเลิกการอัพโหลด
  };

  return (
    <div style={{ padding: "2px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <label
          style={{
            color: "#025074",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <img
            style={{
              backgroundColor: "#025074",
              padding: "2px",
              marginLeft: "10px",
              marginRight: "10px",
              // width:"200px"
              width: "20px",
              height: "20px",
            }}
            src={typeFile(file.type)}
            alt=""
          />
          {file.name}
        </label>
        <IconButton style={{ padding: "5px" }} onClick={cancelMyupload}>
          <CloseIcon
            fontSize="small"
          />
        </IconButton>
      </div>
      {/* <button onClick={cancelUpload}>cancel</button> */}
      <div>
        {!file.uploaded && (
          <div>
            <BorderLinearProgress
              style={{ size: "30", marginLeft: "5px", marginRight: "5px" }}
              variant="determinate"
              value={parseInt(uploadPercent.toFixed(0))}
            />
            <div style={{ display: "flex", justifyContent: "space-between", color: "#025074", }}>

              <label
                style={{
                  marginRight: "5px",
                }}
              >
                {uploadPercent.toFixed(0)}%
              </label>

              <label>{networkSpeed ? getReadableFileSizeString(networkSpeed) + "/s" : ""}</label>
            </div>
          </div>
        )}
      </div>
      <hr />
    </div>
  );
};

export default UploadFile;
