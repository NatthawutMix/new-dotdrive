import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { changeDuplicateList, setDuplicateList } from "../redux/listValue";
import { getReadableFileSizeString } from "../util/util";
import "../css/Duplicate.css";
import { Checkbox } from "@material-ui/core";

import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";

const DuplicateFileUpload = ({
  myFiles,
  file,
  upload,
  parentId,
  uploadAll,
  uid,
  username,
  email,
  avatar,
  path,
}) => {
  const [duplicateFile, setDuplicateFile] = useState(false);
  const [checkFile, setCheckFile] = useState(false);
  const [index, setIndex] = useState(null);
  const [newFile, setNewFile] = useState();

  const dispatch = useDispatch();

  useEffect(() => {
    //เช็ตไฟล์ที่ซ้ำ
    let index = myFiles.findIndex(
      (item) => item.type === file.type && item.name === file.name
    );
    setIndex(index);
    if (index >= 0) {
      setCheckFile(true);
    }
    setNewFile(file); //กำหนดสร้างไฟล์ใหม่
    dispatch(setDuplicateList(file)); //กำหนดแทนที่ไฟล์เดิม
  }, [dispatch, file, myFiles]);

  //ประมวลผลไฟล์ซ้ำ
  const handleSelectFile = () => {
    //เช็คสถานะว่าผู้ใช้เลือกแทนที่หรือสร้างไฟล์ใหม่
    if (!duplicateFile) {
      let newSize = myFiles[index].size - file.size;
      let replace = {
        ...myFiles[index],
        id: myFiles[index].currentId,
        replace: true,
        uploaded: false,
        file: file.file,
        uid: uid,
        size: file.size,
        newSize: -newSize,
        username: username,
        email: email,
        avatar: avatar,
      };
      dispatch(changeDuplicateList(replace)); //ส่งค่าสำหรับการแทนที่ไฟล์
    } else {
      dispatch(changeDuplicateList(newFile)); //ส่งค่าสำหรับอัพโหลดไฟล์ใหม่
    }
    setDuplicateFile(!duplicateFile);
  };

  return (
    <>
      {checkFile && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              width: "70%",
              overflow: "hidden",
              whiteSpace: "nowrap",
              // textOverflow: "ellipsis",
            }}
          >
            <Checkbox
              style={{
                paddingLeft: "0",
                paddingRight: "15px",
                margin: "0",
              }}
              color="default"
              checked={duplicateFile}
              onClick={handleSelectFile}
            />
            <label>
              <InsertDriveFileIcon /> {file.name}.{file.type}
            </label>
          </div>
          <div
            style={{
              width: "30%",
              overflow: "hidden",
              whiteSpace: "nowrap",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <label>{getReadableFileSizeString(file.size)}</label>
          </div>
        </div>
      )}
    </>
  );
};

export default DuplicateFileUpload;
