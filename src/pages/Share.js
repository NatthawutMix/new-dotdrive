import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import DashCloud from "../components/DashCloud";

import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import { Checkbox, IconButton, InputBase } from "@material-ui/core";

import Loading from "../components/Loading";
import FileShare from "../components/FileShare";
import DialogAgreement from "../util/DialogAgreement";
import { auth, db } from "../firebase";
import { useHistory } from "react-router";
import swal from "sweetalert";

const Share = () => {
  const sideBarCss = useSelector((state) => state.service.sideBarCss);
  const user = useSelector((state) => state.service.user);
  const detail = useSelector((state) => state.service.detail);
  const sizeUsed = useSelector((state) => state.service.sizeUsed);

  const [selectAll, setSelectAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shareFiles, setShareFiles] = useState(null);
  const [agreeDownload, setAgreeDownload] = useState(false);
  const [search, setSearch] = useState("");

  const history = useHistory();

  useEffect(() => {
    if (user) {
      //เช็คยืนยันตัวตน
      if (!auth.currentUser.emailVerified) {
        swal("กรุณายืนยันอีเมล์", {
          icon: "error",
          button: false,
        }).then(() => {
          history.push("setting");
          return;
        });
      }
      setIsLoading(true);
      //ดึงไฟล์ที่ได้รับการแชร์
      const subscriber = db
        .collection("drive")
        .doc(user.uid)
        .collection("share")
        .onSnapshot((querySnapshot) => {
          if (querySnapshot.empty) {
            setIsLoading(false);
            setShareFiles([]);
            return;
          }
          var cities = [];
          querySnapshot.forEach((doc) => {
            cities.push(doc.data());
          });
          setIsLoading(false);
          setShareFiles(cities); //กำหนดไฟล์
        });
      return () => {
        subscriber();
      };
    }
  }, [user]);

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
            justifyContent: "flex-end",
            margin: "20px 30px 0 0",
          }}
        >
          <IconButton
            style={{
              backgroundImage: `linear-gradient(89.78deg, #025376 -17.59%, #01B3BC 135.89%)`,
              margin: "0 5px 0 5px",
              boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2)",
              borderRadius: "15px",
              padding: "7px",
            }}
            onClick={() => setAgreeDownload(true)}
          >
            <CloudDownloadIcon style={{ color: "#ffffff" }} />
          </IconButton>
        </div>
        <div className="homepage__data">
          <div className="homepage__title">
            <div className="file__item__desc">
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
            <label className="homepage__title__by">แชร์โดย</label>
            <label className="homepage__title__date">เวลา</label>
            <label className="homepage__title__size">ขนาด</label>
          </div>

          <div className="homepage__items">
            {isLoading ? (
              <div className="homepage__loading">
                <Loading size={"5rem"} />
              </div>
            ) : (
              <>
                {shareFiles?.length === 0 ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <h1 style={{ color: "#AFAFAF" }}>No Data</h1>
                  </div>
                ) : (
                  <>
                    {shareFiles
                      ?.filter(
                        (item) =>
                          item.name !== undefined &&
                          item.name
                            .split(".")[0]
                            .toLowerCase()
                            .includes(search.trim())
                      )
                      .map((file, index) => (
                        <FileShare
                          key={index}
                          file={file}
                          selectAll={selectAll}
                          username={detail.name}
                          uid={user.uid}
                        />
                      ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <DialogAgreement
        // title={<label>ยืนยันการลบไฟล์ ?</label>}
        description={
          <strong style={{ color: "#ffffff" }}>Next version...</strong>
        }
        open={agreeDownload}
        handleClose={() => setAgreeDownload(false)}
        handleAgree={() => setAgreeDownload(false)}
        textClose={"ยกเลิก"}
        textSubmit={"ยืนยัน"}
        hidenBtn={true}
      />
    </div>
  );
};

export default Share;
