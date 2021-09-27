import React, { useState } from "react";

import { Button, IconButton, Menu, MenuItem } from "@material-ui/core";

import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import PeopleOutlineIcon from "@material-ui/icons/PeopleOutline";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import CloseIcon from "@material-ui/icons/Close";

import "../css/PreviewImage.css";

const PreviewImage = ({ file, close, move, share, remove, download, type }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMove = () => {
    move();
    setAnchorEl(null);
  };

  const handleShare = () => {
    share();
    setAnchorEl(null);
  };

  const handleRemove = () => {
    remove();
    setAnchorEl(null);
  };
  
  return (
    <div className="preview__contrainer">
      <div className="preview__header__desktop">
        {type === "file" ? (
          <div style={{ display: "flex" }}>
            <IconButton
              style={{
                borderRadius: "0",
                color: "#ffffff",
                borderRight: "1px solid #ffffff",
              }}
              onClick={download}
            >
              <CloudDownloadIcon
                style={{
                  marginRight: "10px",
                }}
              />
              ดาวน์โหลด
            </IconButton>
            <IconButton
              style={{
                borderRadius: "0",
                color: "#ffffff",
                borderRight: "1px solid #ffffff",
              }}
              onClick={handleMove}
            >
              <ExitToAppIcon
                style={{
                  marginRight: "10px",
                }}
              />
              ย้ายไปที่
            </IconButton>
            <IconButton
              style={{
                borderRadius: "0",
                color: "#ffffff",
                borderRight: "1px solid #ffffff",
              }}
              onClick={handleShare}
            >
              <PeopleOutlineIcon
                style={{
                  marginRight: "10px",
                }}
              />
              แชร์
            </IconButton>
            <IconButton
              style={{
                borderRadius: "0",
                color: "#ffffff",
                borderRight: "1px solid #ffffff",
              }}
              onClick={handleRemove}
            >
              <DeleteOutlineIcon
                style={{
                  marginRight: "10px",
                }}
              />
              นำออก
            </IconButton>
          </div>
        ) : (
          <div style={{ display: "flex" }}>
            <IconButton
              style={{
                borderRadius: "0",
                color: "#ffffff",
                borderRight: "1px solid #ffffff",
              }}
              onClick={download}
            >
              <CloudDownloadIcon
                style={{
                  marginRight: "10px",
                }}
              />
              ดาวน์โหลด
            </IconButton>
          </div>
        )}
        <div>
          {type === "file" && (
            <IconButton onClick={close}>
              <CloseIcon style={{ color: "rgba(0, 0, 0, 0.54)" }} />
            </IconButton>)}
        </div>
      </div>
      <div className="preview__header">
        {type === "file" && (
          <IconButton
            aria-controls="customized-menu"
            aria-haspopup="true"
            onClick={handleClick}
          >
            <MoreHorizIcon style={{ color: "rgba(0, 0, 0, 0.54)" }} />
          </IconButton>
        )}

        <Menu
          id="customized-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
          disableScrollLock={true}
          getContentAnchorEl={null}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
        >
          <MenuItem data={{ action: "move" }} onClick={download}>
            <CloudDownloadIcon style={{ marginRight: "10px" }} />
            <label>ดาวน์โหลด</label>
          </MenuItem>
          <MenuItem data={{ action: "move" }} onClick={handleMove}>
            <ExitToAppIcon style={{ marginRight: "10px" }} />
            <label>ย้ายไปที่</label>
          </MenuItem>
          <MenuItem data={{ action: "share" }} onClick={handleShare}>
            <PeopleOutlineIcon style={{ marginRight: "10px" }} />
            <label>แชร์</label>
          </MenuItem>
          <MenuItem data={{ action: "delete" }} onClick={handleRemove}>
            <DeleteOutlineIcon style={{ marginRight: "10px" }} />
            <label>นำออก</label>
          </MenuItem>
        </Menu>
        <div>
          {type === "file" ? (
            <div>
              <IconButton onClick={close}>
                <CloseIcon style={{ color: "rgba(0, 0, 0, 0.54)" }} />
              </IconButton>
            </div>
          ) : (<IconButton
            style={{
              borderRadius: "0",
              color: "#ffffff",
              borderRight: "1px solid #ffffff",
            }}
            onClick={download}
          >
            <CloudDownloadIcon
              style={{
                marginRight: "10px",
              }}
            />
            ดาวน์โหลด
          </IconButton>)}
        </div>


      </div>

      <div className="preview__box" onClick={close}></div>
      {file.preview ? (
        <div>
          <img className="preview__image" src={file.preview} alt="" />
        </div>
      ) : (
        <div className="preview__error">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "20px",
              color: "#ffffff",
            }}
          >
            <InsertDriveFileIcon
              style={{ fontSize: "100px", color: "#ffffff" }}
            />

            <h1>ยังไม่สามารถเปิดไฟล์ชนิดนี้ได้</h1>
            <label>กรุณาทำการดาวโหลดไฟล์ด้านล่างถึงจะสามารถเปิดไฟล์ได้</label>
            <Button
              style={{
                backgroundColor: "#02BAC2",
                borderRadius: "10px",
                boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
                color: "#ffffff",
              }}
              onClick={download}
            >
              <CloudDownloadIcon style={{ marginRight: "10px" }} /> ดาวน์โหลด
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewImage;
