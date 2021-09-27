import React from "react";
import CloseIcon from "@material-ui/icons/Close";
import { IconButton, LinearProgress } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { typeFile } from "../util/util";

const BorderLinearProgress = withStyles((theme) => ({
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

const UploadedFile = ({ file, remove, exit }) => {
  if (exit) {
    remove();
  }

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
        <IconButton style={{ padding: "5px" }}>
          <CloseIcon fontSize="small" onClick={remove} onTouchStart={remove} />
        </IconButton>
      </div>
      <div>
        <BorderLinearProgress
          style={{ size: "30", marginLeft: "5px", marginRight: "5px" }}
          variant="determinate"
          value={100}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "row-reverse",
            borderBottom: "1px solid #c4c4c4",
          }}
        >
          <label
            style={{
              // float: "right",
              fontSize: "15px",
              marginRight: "5px",
              color: "#025074",
            }}
          >
            successful
          </label>
        </div>
      </div>
    </div>
  );
};

export default UploadedFile;
