import { Checkbox } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { getReadableFileSizeString } from "../util/util";
import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";
import { useDispatch, useSelector } from "react-redux";
import { changeDuplicateList, setDupliRestore } from "../redux/listValue";

const DuplicateRestore = ({ file }) => {
  const [duplicateFile, setDuplicateFile] = useState(false);
  const [checkFile, setCheckFile] = useState(false);
  const [newFile, setNewFile] = useState(file);

  const dispatch = useDispatch();

  const { uid } = useSelector((state) => state.service.user);
  const { name, email, avatar } = useSelector((state) => state.service.detail);

  useEffect(() => {
    dispatch(setDupliRestore({ ...file, replace: false }));
  }, []);

  //ประมวลผลไฟล์ซ้ำ
  const handleSelectFile = () => {
    if (!duplicateFile) {
      dispatch(setDupliRestore({ ...file, replace: true })); //ส่งค่าสำหรับการแทนที่ไฟล์
    } else {
      dispatch(setDupliRestore({ ...file, replace: false })); //ส่งค่าสำหรับอัพโหลดไฟล์ใหม่
    }
    setDuplicateFile(!duplicateFile);
  };

  return (
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
          <InsertDriveFileIcon /> {file.bin.name}.{file.bin.type}
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
        <label>{getReadableFileSizeString(file.bin.size)}</label>
      </div>
    </div>
  );
};

export default DuplicateRestore;
