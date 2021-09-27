import React from "react";
import {
  getReadableFileSizeString,
  getFileSizeMax,
  countSize,
} from "../util/util";

import LogoDD from "../images/dotdrive.svg";
// import LogoDD from "../images/DashCloud/LogoDD.png";
import NotificationsNoneIcon from "@material-ui/icons/NotificationsNone";

import { IconButton, LinearProgress } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

const BorderLinearProgress = withStyles(() => ({
  root: {
    height: 20,
    borderRadius: 10,
  },
  colorPrimary: {
    backgroundColor: "#ECF9F9",
  },
  bar: {
    borderRadius: 10,
    backgroundImage: "linear-gradient(90deg, #025477 -3.94%, #01B6BF 68.83%)",
  },
}))(LinearProgress);

const DashCloud = ({ detail, handleSearch, sizeUsed }) => {
  // console.log(countSize(sizeUsed));
  return (
    <div>
      <div className="homepage__title__drive">
        <div style={{ marginLeft: "20px" }}>
          <img src={LogoDD} alt="" />
          {/* <h1 style={{ fontFamily: "psl159" }}>DOT</h1>
          <h1>DRIVE</h1> */}
        </div>
        {/* <IconButton
          style={{
            color: "#DADADA",
            float: "right",
            marginRight: "50px",
          }}
        >
          <NotificationsNoneIcon
            style={{
              fontSize: "50px",
              color: "#A8A8A8",
            }}
          />
        </IconButton> */}
      </div>
      {/* <div className="homepage__noti">
          
          <div className="homepage__search">{handleSearch}</div>
        </div> */}

      <div className="homepage__container">
        <h3>คลาวด์ของฉัน</h3>
        {detail && (
          <div>
            <div className="homepage__textused">
              <div>
                <label>{getReadableFileSizeString(detail.used)}</label>
                {"  "}
                <small style={{ fontWeight: "bold" }}>ถูกใช้งาน</small>
              </div>
              <div>
                <label>{getReadableFileSizeString(detail.max)}</label>
                {"  "}
                <small style={{ fontWeight: "bold" }}>พื้นที่ทั้งหมด</small>
              </div>
            </div>
            <div className="homepage__progressbar">
              <BorderLinearProgress
                style={{
                  size: "30",
                }}
                variant="determinate"
                value={
                  detail ? getFileSizeMax(detail.max, countSize(sizeUsed)) : 0
                }
              />
              {/* <label>
                {getFileSizeMax(detail.max, countSize(sizeUsed)).toFixed(0)}%
              </label> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashCloud;
