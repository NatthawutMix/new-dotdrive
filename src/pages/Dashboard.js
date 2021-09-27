import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import axios from "../axios";
import "../css/Dashboard.css";
import DashCloud from "../components/DashCloud";
import InputBase from "@material-ui/core/InputBase";
import moment from "moment"; //Date-time format
import { Line } from "react-chartjs-2";
import { Chart } from 'react-charts'
// import ReactFrappeChart from "react-frappe-charts";
import Chartjs from "chart.js";
import { Image } from "react-bootstrap";
import { db } from "../firebase";
import Loading from "../components/Loading";
import 'moment/locale/th';

const Dashboard = ({ file }) => {
  const user = useSelector((state) => state.service.user);
  const detail = useSelector((state) => state.service.detail);
  const sizeUsed = useSelector((state) => state.service.sizeUsed);
  const sideBarCss = useSelector((state) => state.service.sideBarCss);

  const isLoading = useSelector((state) => state.service.isLoading);
  const myFolders = useSelector((state) => state.listValue.myFolders);
  const myFiles = useSelector((state) => state.listValue.myFiles);
  const onload = useSelector((state) => state.service.onload);

  const [search, setSearch] = useState("");
  const [resuploaddata, setUpLoadData] = useState([]);
  const [resdownloaddata, setDowndLoadData] = useState([]);
  // const [resfile, setFile] = useState([]);
  const [resrecentloop, setRecentLoop] = useState([]);
  const [reslistloop, setListLoop] = useState([]);
  const [resuploadgraph, setUploadgraph] = useState([]);
  const [resdownloadgraph, setDownloadgraph] = useState([]);
  const [spinner, setSpinner] = useState(true);

  const [folder, setFolder] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [preview, setPreview] = useState(null);

  const chartContainer = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);

  // useEffect(() => {
  //   if (user) {
  //     axios.post("/dashboard/getDatas", { uid: user.uid }).then((res) => {
  //       setFile(res.data);

  //     });
  //   }
  // }, [user]);

  useEffect(() => {
    //have user 
    if (user) {

      // const recentFile = db
      //   .collection("drive")
      //   .doc(user.uid);
      //   // .collection("logs");
      //   // recentFile.orderBy("updatedAt", "desc");
      //   // recentFile.limit(3)
      //   recentFile
      //   .get()
      //   .then((doc) => {
      //     let list = [];
      //     // querySnap.forEach((doc) => {
      //     //   list.push(doc.data().data);
      //       // console.log("recentFile",doc.data());
      //       setRecentLoop(list);
      //     // });
      //   });

      const countUpload = db
        .collection("drive")
        .doc(user.uid)
        .collection("logs")
        .where("topic", "==", "อัพโหลด")
        .onSnapshot((querySnap) => {
          querySnap.forEach((doc) => {
            setUpLoadData(querySnap.size);
            // console.log("countUpload",querySnap.size);
          });
        });

      const countUploadperMonth = db
        .collection("drive")
        .doc(user.uid)
        .collection("logs")
        .where("topic", "==", "อัพโหลด")
        .onSnapshot((querySnap) => {
          let list = [];
          querySnap.forEach((doc) => {
            list.push(doc.data());
            setUploadgraph(list);
          });
        });

      const countDownload = db
        .collection("drive")
        .doc(user.uid)
        .collection("logs")
        .where("topic", "==", "ดาวน์โหลด")
        .onSnapshot((querySnap) => {
          querySnap.forEach((doc) => {
            // console.log("countDownload",querySnap.size);
            setDowndLoadData(querySnap.size);
          });
        });

      const countDownloadperMonth = db
        .collection("drive")
        .doc(user.uid)
        .collection("logs")
        .where("topic", "==", "ดาวน์โหลด")
        .onSnapshot((querySnap) => {
          let list = [];
          querySnap.forEach((doc) => {
            list.push(doc.data());
            // console.log("countDownloadperMonth",querySnap.size);
            setDownloadgraph(list);
          });
        });

      setTimeout(() => setSpinner(false))

      return  () => {
        countUpload();
        countUploadperMonth();
        countDownload();
        countDownloadperMonth();
      }

    }
  }, [user]);

  useEffect(() => {
    if (user) {

      var listrecent =
      // [START get_multiple]
      db.collection("drive")
          .doc(user.uid)
          .collection("logs").orderBy("updatedAt", "desc").limit(3)
          .get()
          .then((querySnapshot) => {
              let list = [];
              querySnapshot.forEach((doc) => {
                list.push(doc.data().data);
                  // console.log("Current data",doc.data().data.name);
              });
              setRecentLoop(list);
          })
          .catch((error) => {
              console.log("Error getting documents: ", error);
          });
      
      var listtable =
      // [START get_multiple]
      db.collection("drive")
          .doc(user.uid)
          .collection("logs").orderBy("updatedAt", "desc").limit(5)
          .get()
          .then((querySnapshot) => {
              let list = [];
              querySnapshot.forEach((doc) => {
                list.push(doc.data());
                  // console.log("Current data",doc.data());
              });
              setListLoop(list);
          })
          .catch((error) => {
              console.log("Error getting documents: ", error);
          });
      return {listtable, listrecent};
    }
  }, [user]);

  // console.log("resrecentloop",resrecentloop);

  const renderRecent = () => {
    return (
      resrecentloop && resrecentloop.map(({ name }) => {
        return (
          <table class="asidetb">
            <tr>
              <td class="icon_folder">
                <i class="fa fa-folder fa-2x" aria-hidden="true"></i>
              </td>
              <td>
                <div class="overflow_1">
                  {name}
                </div>
              </td>
            </tr>
          </table>
        );
      })
    );
  };

  moment.locale('th');
  // console.log("th",moment.locale()); // th
  // console.log("resrecentloop",resrecentloop);
  // const testcountmap = [1, 2, 3, 4];


  // console.log("reslistloop",reslistloop);

  const renderBody = () => {
    return (
      reslistloop && reslistloop.map(({ by, data, topic, updatedAt }) => {
        return (
          <div className="file_item_dash">
            <div className="file_item_activity_1">
              {data.name}
            </div>
            <div className="file_item_activity_2">
              {topic}
            </div>
            <div className="file_item_activity_3">
              {moment(updatedAt).fromNow()}
            </div>
            <div className="file_item_activity_4">
              {by.name}
            </div>
          </div>
        );
      })
    );
  };

  let setmonth_dn_1 = [];
  for (let i = 0; i < resuploadgraph.length; i++) {
    let obj = resuploadgraph[i];
    let f_updatedAt = moment(obj.updatedAt).format();
    setmonth_dn_1.push({ f_updatedAt }); //return

    // console.log("resuploadgraph",resuploadgraph);
  }

  const graphUpload = () => {
    if (setmonth_dn_1 != 0) {
      const arr = setmonth_dn_1;
      //take substring and just grab unique date
      let distict_dates = [
        ...new Set(arr.map((a) => a.f_updatedAt.substring(0, 10))),  //ออก 10 หลัก
      ];
      //count each date frequency
      let reduced = distict_dates.map((a) => {
        return {
          uploadCount: arr.filter((a1) => a1.f_updatedAt.startsWith(a)).length,
          updatedAt: a,
        };
      });
      // console.log("reduced",reduced);


      const prev2_month = moment().subtract(2, "month").format("MMM");
      const prev1_month = moment().subtract(1, "month").format("MMM");
      const curr_month = moment().format("MMM");
      const next1_month = moment().add(1, "month").format("MMM");
      const next2_month = moment().add(2, "month").format("MMM");
      const next3_month = moment().add(3, "month").format("MMM");

      // console.log("มี", mar_up)

      //data for dev.
      var reduced1 = [
        {
          uploadCount: 2,
          updatedAt: "2021-02",
        },
        {
          uploadCount: 3,
          updatedAt: "2021-03",
        },
        {
          uploadCount: 6,
          updatedAt: "2021-04",
        },
      ];

      // console.log("reduced",reduced)  //ต้นทาง Graph data

      reduced.sort((a, b) => new Date(...a.updatedAt.split('-').reverse()) - new Date(...b.updatedAt.split('-').reverse())); //sort date

      // console.log("reduced",reduced) 

      let setmonthly = [];
      for (let i = 0; i < reduced.length; i++) {
        let obj = reduced[i];
        let f_obj = moment(obj.updatedAt, "YYYY-MM").format("D");
        setmonthly.push(f_obj); //return
      }
      // reduced1
      let setweekly = [0];
      for (let i = 0; i < reduced.length; i++) {
        let obj = reduced[i];
        var f_obj_dn = moment(obj.updatedAt, "YYYY-MM-DD").format("D"); //D วันที่ 
        // console.log("f_obj_dn",f_obj_dn);
        setweekly.push(f_obj_dn); //return
      }
      // setweekly.sort(function(a, b) {
      //   return a - b;
      // });

      let setupcount = [0];
      for (let i = 0; i < reduced.length; i++) {
        let obj = reduced[i];
        setupcount.push(obj.uploadCount);
      }

      // console.log("ResponM:",setmonth);
      // console.log("setupcount",setupcount);

      const dataUpload = {
        labels: setweekly,
        datasets: [
          {
            label: "dataset",
            data: setupcount,
            fill: true,
            backgroundColor: "rgba(75,192,192,0.2)",
            borderColor: "rgba(50, 115, 220, 0.3)",
          },
        ],
      };
      return dataUpload;
    }
  };

  // ----------------------------------------------------------------------------------------------//
  let setmonth_dn = [];
  for (let i = 0; i < resdownloadgraph.length; i++) {
    let obj = resdownloadgraph[i];
    let f_updatedAt = moment(obj.updatedAt).format();
    setmonth_dn.push({ f_updatedAt }); //return
  }

  const graphDownload = () => {
    if (setmonth_dn != 0) {
      const arr = setmonth_dn;
      //take substring and just grab unique date
      let distict_dates = [
        ...new Set(arr.map((a) => a.f_updatedAt.substring(0, 10))),  //ออก 10 หลัก
      ];
      //count each date frequency
      let reduced = distict_dates.map((a) => {
        return {
          downloadCount: arr.filter((a1) => a1.f_updatedAt.startsWith(a)).length,
          updatedAt: a,
        };
      });

      const prev2_month = moment().subtract(2, "month").format("MMM");
      const prev1_month = moment().subtract(1, "month").format("MMM");
      const curr_month = moment().format("MMM");
      const next1_month = moment().add(1, "month").format("MMM");
      const next2_month = moment().add(2, "month").format("MMM");
      const next3_month = moment().add(3, "month").format("MMM");

      //data for dev.
      var reduced1 = [
        {
          downloadCount: 10,
          updatedAt: "2021-02",
        },
        {
          downloadCount: 3,
          updatedAt: "2021-03",
        },
        {
          downloadCount: 6,
          updatedAt: "2021-04",
        },
      ];
      // console.log("reduced",reduced)  //ต้นทาง Graph data

      reduced.sort((a, b) => new Date(...a.updatedAt.split('-').reverse()) - new Date(...b.updatedAt.split('-').reverse())); //sort date

      // console.log("reduced_format",reduced) 
      let setmonthly = [];
      for (let i = 0; i < reduced.length; i++) {
        let obj = reduced[i];
        let f_obj = moment(obj.updatedAt, "YYYY-MM").format("D");
        setmonthly.push(f_obj); //return
      }
      // reduced1
      let setweekly = [0];
      for (let i = 0; i < reduced.length; i++) {
        let obj = reduced[i];
        var f_obj_dn = moment(obj.updatedAt, "YYYY-MM-DD").format("D"); //D วันที่ 
        // console.log("f_obj_dn",f_obj_dn);
        setweekly.push(f_obj_dn); //return
      }

      let setdowncount = [0];
      for (let i = 0; i < reduced.length; i++) {
        let obj = reduced[i];
        setdowncount.push(obj.downloadCount);
      }

      const dataDownload = {
        labels: setweekly,
        datasets: [
          {
            label: "dataset",
            data: setdowncount,
            fill: true,
            backgroundColor: "rgba(255, 99, 71, 0.5)",
            borderColor: "rgba(50, 115, 220, 0.3)",
          },
        ],
      };

      return dataDownload;
    }
  };

  // ------------------------------------------------------------------------------------------

  return (
    <div className={sideBarCss ? "hp__bg__hide" : "hp__bg__show"}>

      <div className="homepage__background__inside">

        {detail && (
          <DashCloud
            detail={detail}
            sizeUsed={sizeUsed}
          />
        )}

        {spinner &&
          <div className="homepage__loading">
            <Loading size={"5rem"} />
          </div>
        }

        {!spinner &&
          <>
            <div class="cards">
              <div class="card">
                <h5 style={{ textAlign: "center" }}>ไฟล์ล่าสุด</h5>
                {renderRecent().length === 0 ? (
                  <div class="nondata">
                    <h1>No Data</h1>
                  </div>
                ) : (
                  <>
                    {renderRecent()}
                  </>
                )}
              </div>

              <div class="card">
                <h5 style={{ textAlign: "center" }}>สถิติการอัพโหลด</h5>
                {/* {console.log("resuploaddata",resuploaddata)} */}
                {resuploaddata == 0 ? (
                  <div class="nondata">
                    <h1>No Data</h1>
                  </div>
                ) : (
                  <>
                    <h1 style={{ textAlign: "center" }}>{resuploaddata}</h1>
                    <div className="App">
                      <Line data={graphUpload()} />
                    </div>
                  </>
                )}
              </div>

              <div class="card">
                <h5 style={{ textAlign: "center" }}>สถิติการดาวน์โหลด</h5>
                {/* {console.log("resdownloaddata",resdownloaddata)} */}
                {resdownloaddata == 0 ? (
                  <div class="nondata">
                    <h1>No Data</h1>
                  </div>
                ) : (
                  <>
                    <h1 style={{ textAlign: "center" }}>{resdownloaddata}</h1>
                    <div className="App">
                      <Line data={graphDownload()} />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex_container">
              {/* th */}
              <div className="dashboard_th">
                <label className="file_item_name_1">ชื่อ</label>
                <label className="file_item_name_2">กิจกรรม</label>
                <label className="file_item_name_3">เวลา</label>
                <label className="file_item_name_4">แก้ไขโดย</label>
              </div>
              {/* list */}
              <div className="dashboard_list">
                {renderBody().length === 0 ? (
                  <div class="nondata">
                    <h1>No Data</h1>
                  </div>
                ) : (
                  <div>
                    {renderBody()}
                  </div>
                )}
              </div>
            </div>
          </>
        }
      </div>
      {/* In END --------------------------------------------------*/}
    </div>
  );
};

export default Dashboard;
