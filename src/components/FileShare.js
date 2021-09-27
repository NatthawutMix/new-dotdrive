import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { removeListDownload, setListDownload } from "../redux/listValue";
import { ContextMenu, ContextMenuTrigger, MenuItem } from "react-contextmenu";
import moment from "moment";

import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import { getReadableFileSizeString, toBase64, typeFile } from "../util/util";
import { Image } from "react-bootstrap";
import { client } from "../aliOss";
import { logFile } from "../firebase";
import PreviewImage from "./PreviewImage";
import { Checkbox } from "@material-ui/core";

const FileShare = ({ file, selectAll, username, uid }) => {
  const dispatch = useDispatch();

  const [select, setSelect] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewBox, setPreviewBox] = useState(false);

  useEffect(() => {
    let cleanup = true;
    async function getPreview() {
      let path = `${file.owner}/${file.currentId}${file.type}`; //กำหนดเส้นทางไฟล์ Oss
      let result = await client.get(path); //ดึงไฟล์ Oss
      let data = `data:image/png;base64,${toBase64(result.content)}`; //แปลงเป็น base64
      if (cleanup) {
        setPreview(data);
      }
    }
    if (file.type === ".png" || file.type === ".jpg" || file.type === ".jpeg") {
      getPreview();
    }
    return () => {
      cleanup = false;
    };
  }, []);

  useEffect(() => {
    let cleanup = true;
    if (selectAll) {
      dispatch(setListDownload(file));
      if (cleanup) {
        setSelect(true);
      }
    } else {
      dispatch(removeListDownload(file));
      if (cleanup) {
        setSelect(false);
      }
    }
    return () => {
      cleanup = false;
    };
  }, [dispatch, file, selectAll]);
  //ดาวน์โหลดไฟล์
  const downloadFile = async () => {
    let path = `${file.owner}/${file.currentId}${file.type}`; //กำหนดเส้นทางไฟล์
    //กำหนดชื่อไฟล์
    let response = {
      "content-disposition": `attachment; filename=${encodeURIComponent(
        file.name + file.type
      )}`,
    };

    let pathOss = path; //กำหนดเส้นทางไฟล์
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

    logFile(uid, username, file, "download");
  };

  const handleClick = (event, data) => {
    // console.log({ data }.data.action);
    if (data.action === "download") {
      downloadFile();
    }
  };

  const selectFile = (data) => {
    setSelect(data);
    if (data) {
      dispatch(setListDownload(file));
    } else {
      dispatch(removeListDownload(file));
    }
  };

  return (
    <div>
      <div className="file__container">
        <ContextMenuTrigger id={file.currentId}>
          <div
            className={select ? "file__item__select" : "file__item"}
            // onClick={() => selectFile(!select)}
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
                // <InsertDriveFileIcon
                //   style={{
                //     marginLeft: "10px",
                //     color: "#54EBE6",
                //     marginRight: "10px",
                //   }}
                // />
              )}

              {file.name}
              {file.type}
            </div>
            <div className="file__by">{file.by}</div>
            <div className="file__date">
              {moment(file.createdAt).subtract(10, "days").calendar()}
            </div>
            <div className="file__size">
              {getReadableFileSizeString(file.size)}
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenu id={file.currentId}>
          <MenuItem data={{ action: "download" }} onClick={handleClick}>
            <CloudDownloadIcon
              style={{ marginRight: "10px", color: "#ffffff" }}
            />
            <small style={{ color: "#ffffff" }}>ดาวน์โหลด</small>
          </MenuItem>
        </ContextMenu>
      </div>
      {previewBox && (
        <PreviewImage
          uid={file.owner}
          username={username}
          file={{ ...file, preview: preview }}
          download={downloadFile}
          type={"share"}
          close={() => setPreviewBox(false)}
        />
      )}
    </div>
  );
};

export default FileShare;
