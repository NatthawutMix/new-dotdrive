import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
// import { useSelector } from "react-redux";
import { useHistory, useLocation, useParams } from "react-router";
import swal from "sweetalert";
import { client } from "../aliOss";
import PreviewImage from "../components/PreviewImage";
import { auth, db } from "../firebase";
import { toBase64 } from "../util/util";

const Sharing = () => {
  const { path } = useParams();
  const currentId = new URLSearchParams(useLocation().search).get("id"); //อ่าน params
  const user = useSelector((state) => state.service.user);

  //   const detail = useSelector((state) => state.service.detail);
  const [fileSharing, setFileSharing] = useState(null);
  const [preview, setPreview] = useState(null);

  const history = useHistory();

  useEffect(() => {
    let cleanup = true;
    //ดึงข้อมูลจาก Firestore และ Oss
    const fetchData = async () => {
      //รับเส้นทางไฟล์ Oss
      async function getPreview(pathFileOss) {
        let result = await client.get(pathFileOss); //ดึงไฟล์จาก Oss
        let data = `data:image/png;base64,${toBase64(result.content)}`; //แปลงเป็น base64
        setPreview(data); //กำหนดข้อมูลที่เป็น base64
      }
      //ดึงข้อมูลไฟล์จาก Firestore
      await db
        .collection("drive")
        .doc(path)
        .collection("files")
        .where("currentId", "==", currentId)
        .get()
        .then((snap) => {
          let data;
          snap.forEach((doc) => {
            if (cleanup) {
              data = doc.data();
              setFileSharing(doc.data());
            }
          });
          if (
            data.type === ".png" ||
            data.type === ".jpg" ||
            data.type === ".jpeg"
          ) {
            getPreview(`${data.owner}/${data.currentId}${data.type}`); //เรียกใช้ฟังก์ชันเพื่อทำการดึงรูปภา่พ
          }
        });
    };

    if (user) {
      //ยืนยันตัวตน
      if (!auth.currentUser.emailVerified) {
        swal("กรุณายืนยันอีเมล์", {
          icon: "error",
          button: false,
        }).then(() => {
          history.push("setting");
          return;
        });
      }
      fetchData();
    }

    return () => {
      cleanup = false;
    };
  }, [user]);

  //ดาวน์โหลดไฟล์
  const downloadFile = async () => {
    //กำหนดชื่อไฟล์
    let response = {
      "content-disposition": `attachment; filename=${encodeURIComponent(
        fileSharing.name + fileSharing.type
      )}`,
    };
    //กำหนดเส้นทางไฟล์
    let pathOss =
      fileSharing.owner + "/" + fileSharing.currentId + fileSharing.type;
    //สร้างลิ้ง
    let url = await client.signatureUrl(pathOss, {
      response,
    });
    //เปิดลิ้งดาวน์โหลด
    window.open(url);
  };

  return (
    <div>
      {fileSharing && (
        <PreviewImage
          uid={fileSharing.owner}
          //   username={detail.name}
          file={{ ...fileSharing, preview: preview }}
          download={downloadFile}
          type={"share"}
        />
      )}
    </div>
  );
};

export default Sharing;
