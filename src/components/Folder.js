import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  setListDownload,
  removeListDownload,
  removeFolder,
  setOneUpload,
} from "../redux/listValue";

import axios from "../axios";
import { useHistory } from "react-router-dom";

import FolderMove from "./FolderMove";

import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

import FolderOpenIcon from "@material-ui/icons/FolderOpen";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
// import PeopleOutlineIcon from "@material-ui/icons/PeopleOutline";

import "../css/File.css";
import "../css/menu.css";

import moment from "moment";
import swal from "sweetalert";
import { dbFolder, logFile } from "../firebase";
import { Checkbox } from "@material-ui/core";

const Folder = ({ folder, selectAll, setSelectAll, user, username }) => {
  const dispatch = useDispatch();

  const listDownload = useSelector((state) => state.listValue.listDownload);

  const [folderMove, setFolderMove] = useState(false);
  const [select, setSelect] = useState(false);
  const history = useHistory();

  useEffect(() => {
    if (selectAll) {
      dispatch(setListDownload(folder));
      setSelect(true);
    } else {
      dispatch(removeListDownload(folder));
      setSelect(false);
    }
  }, [dispatch, folder, selectAll]);

  useEffect(() => {
    let findItem = listDownload.findIndex(
      (item) => item.currentId === folder.currentId
    );

    if (findItem < 0) {
      setSelect(false);
    }
  }, [dispatch, folder, listDownload]);
  //ลบโฟล์เดอร์ไปที่ถังขยะ
  const deleteFolder = () => {
    //กำหนดสถานะถังขยะเป็นถูก
    dbFolder(folder.owner)
      .doc(folder.currentId)
      .update({
        bin: true,
      })
      .then(() => {
        logFile(user.uid, username, folder, "นำออก");
        swal("นำออกสำเร็จ", {
          icon: "success",
          button: false,
        });
        dispatch(removeListDownload(folder));
      })
      .catch((err) => {
        swal(err.message, {
          icon: "error",
          button: false,
        });
        dispatch(removeListDownload(folder));
      });
  };

  const selectFolder = (data) => {
    setSelect(data);
    if (data) {
      dispatch(setListDownload(folder));
    } else {
      dispatch(removeListDownload(folder));
    }
  };

  const handleClick = (event, data) => {
    if (data.action === "move") {
      setFolderMove(true);
    } else if (data.action === "delete") {
      deleteFolder();
    }
  };
  //เข้าโฟล์เดอร์
  const handleSelectFolder = () => {
    history.push("/myCloud/" + folder.currentId);
  };

  const handleMoveFile = (folder) => {
    // dispatch(setIsLoading(false));
    dispatch(removeFolder(folder));
  };

  const handleRightClick = (event) => {
    setSelectAll();
    setTimeout(() => {
      setSelect(true);
      dispatch(setOneUpload(folder));
    }, 100);
  };

  return (
    <div>
      <div className="file__container">
        <ContextMenuTrigger id={folder.currentId}>
          <div
            className={select ? "file__item__select" : "file__item"}
            onDoubleClick={handleSelectFolder}
            onContextMenu={handleRightClick}
            // onClick={() => selectFolder(!select)}
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
                onClick={() => selectFolder(!select)}
              />
              <FolderOpenIcon
                style={{
                  color: "#01758E",
                  marginRight: "10px",
                }}
              />
              <label className="file__label__overflow">{folder.name}</label>
            </div>
            <div className="file__date">
              <label className="file__label__overflow">
                {moment(folder.createdAt).subtract(10, "days").calendar()}
              </label>
            </div>
            <div className="file__size">{}</div>
          </div>
        </ContextMenuTrigger>
        <ContextMenu id={folder.currentId}>
          <MenuItem data={{ action: "move" }} onClick={handleClick}>
            <ExitToAppIcon style={{ marginRight: "10px", color: "#ffffff" }} />
            <small style={{ color: "#ffffff" }}>ย้ายไปที่</small>
          </MenuItem>
          {/* <MenuItem data={{ action: "move" }} onClick={handleClick}>
            <PeopleOutlineIcon style={{ marginRight: "10px" }} />
            Share
          </MenuItem> */}
          <MenuItem data={{ action: "delete" }} onClick={handleClick}>
            <DeleteOutlineIcon
              style={{ marginRight: "10px", color: "#ffffff" }}
            />
            <small style={{ color: "#ffffff" }}>นำออก</small>
          </MenuItem>
        </ContextMenu>
      </div>

      {folderMove && (
        <FolderMove
          folder={{
            ...folder,
            name: folder.name,
            username: username,
          }}
          uid={user.uid}
          click={() => setFolderMove(false)}
          onLoad={() => handleMoveFile(folder)}
        />
      )}
    </div>
  );
};

export default Folder;
