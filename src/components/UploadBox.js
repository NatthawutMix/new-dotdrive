import React, { useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";

import {
  setHideList,
  setOnload,
  setExitUpload,
  setDetail,
} from "../redux/services";

import {
  setRemoveListUpload,
  setUploaded,
  removeAll,
} from "../redux/listValue";

import DialogAgreement from "../util/DialogAgreement";
import UploadedFile from "./UploadedFile";
import UploadFile from "./UploadFile";

import CloudRoundedIcon from "@material-ui/icons/CloudRounded";
import { IconButton } from "@material-ui/core";

import "../css/UploadBox.css";

const UploadBox = ({
  listUpload,
  hideList,
  onload,
  detail,
  exitUpload,
  setUploaded,
  setHideList,
  setOnload,
  removeAll,
  setRemoveListUpload,
  setExitUpload,
  setDetail,
}) => {
  const dispatch = useDispatch();
  const startDownload = useSelector((state) => state.service.startDownload);
  const [closeUpload, setCloseUpload] = useState(false);
  const countUpload = () => {
    let count = listUpload?.filter((filter) => filter.uploaded === false);
    return parseInt(count.length);
  };

  const handleUploadSuccess = () => {
    setOnload(!onload);
  };

  const handleExitUpload = (id) => {
    setRemoveListUpload(id);
    setTimeout(() => {
      setExitUpload(false);
    }, 100);
  };

  const handleCloseListDownload = () => {
    if (countUpload() === 0) {
      dispatch(setHideList(true));
      // setUploadBox(false);
      // removeAll([]);
    } else {
      setCloseUpload(true);
    }
  };

  const handleCancelUpload = () => {
    setExitUpload(true);
    setCloseUpload(false);
  };

  return (
    <>
      <div className="uploadbox__container">
        <IconButton
          style={{
            backgroundColor: "#02A5B4",
            padding: "10px",
            boxShadow: `0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)`,
          }}
          onClick={() => dispatch(setHideList(!hideList))}
        >
          <CloudRoundedIcon style={{ color: "#ffffff" }} fontSize="large" />
        </IconButton>
        <div
          className={!hideList ? "uploadbox__box" : "uploadbox__box__hidden"}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <label
              style={{
                fontSize: "20px",
                color: "#fff",
                marginLeft: "10px",
                paddingTop: "5px",
              }}
            >
              ไฟล์ที่ทำงานอัพโหลดขณะนี้
            </label>
            <div>
              {/* <IconButton
                  style={{ fontSize: "15px", padding: "5px" }}
                  onClick={() => setHideList(!hideList)}
                >
                  <strong
                    style={{ color: "#ffffff" }}

                    // onTouchStart={() => setHideList(!hideList)}
                  >
                    -
                  </strong>
                </IconButton> 
               <IconButton
                style={{
                  fontSize: "15px",
                  padding: "5px",
                  marginRight: "5px",
                }}
                // onClick={handleCloseListDownload}
                onClick={() => dispatch(setHideList(true))}
              >
                <strong
                  style={{ color: "#ffffff" }}

                  // onTouchStart={handleCloseListDownload}
                >
                  x
                </strong>
              </IconButton> */}
            </div>
          </div>

          <div className="uploadbox__items">
            <div>
              <div>
                {listUpload
                  .filter((upload) => upload.uploaded === true)
                  .map((file, index) => (
                    <UploadedFile
                      key={index}
                      file={file}
                      exit={exitUpload}
                      remove={() => handleExitUpload(file.id)}
                    />
                  ))}
              </div>
              <div>
                {listUpload
                  .filter((upload) => upload.uploaded === false)
                  .map((file, index) => (
                    <UploadFile
                      key={index}
                      file={file}
                      detail={detail}
                      exit={exitUpload}
                      hideList={hideList}
                      onLoad={handleUploadSuccess}
                      remove={() => handleExitUpload(file.id)}
                      uploaded={() => setUploaded(file.id)}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <DialogAgreement
        title={`ยกเลิกอัพโหลดไฟล์ ?`}
        description={`ไฟล์ทั้งหมด ${countUpload()} ไฟล์`}
        open={closeUpload}
        handleClose={() => setCloseUpload(false)}
        handleAgree={handleCancelUpload}
        textClose={"ยกเลิก"}
        textSubmit={"ยืนยัน"}
      />
    </>
  );
};

export default connect(
  (state) => ({
    listUpload: state.listValue.listUpload,
    hideList: state.service.hideList,
    onload: state.service.onload,
    exitUpload: state.service.exitUpload,
    detail: state.service.detail,
  }),
  {
    setUploaded,
    setHideList,
    setOnload,
    removeAll,
    setRemoveListUpload,
    setExitUpload,
    setDetail,
  }
)(UploadBox);
