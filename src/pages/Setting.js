import React, { useRef, useState, useEffect } from "react";
import { Redirect, useHistory, Route, Link } from "react-router-dom";
import AvatarEditor from "react-avatar-editor";
import Avatar from "@material-ui/core/Avatar";
import { Grid, Button, Box } from "@material-ui/core";
import ImageIcon from "@material-ui/icons/Image";
import Slider from "@material-ui/core/Slider";
import Modal from 'react-modal';
import { Image } from "react-bootstrap";
import { useSelector } from "react-redux";
import dotdrive from "../images/Dotdrive.png";
import portrait from "../images/fi-rr-portrait.svg";                                           
import { useForm, Controller, useFormContext } from "react-hook-form";
import { TextField } from "@material-ui/core";
import { firebaseApp, auth, storage } from "../firebase";
import "../css/Setting.css";
import axios from "../axios";
import { setUser, setDetail } from "../redux/services";
import { db } from "../firebase";

import Loading from "../components/Loading";
import DashCloud from "../components/DashCloud";
import Personal_1 from "../components/Personal_1";
import Tabs_Setting from "../components/Tabs_Setting";


const SettingForm = () => {

  const user = useSelector((state) => state.service.user);
  const detail = useSelector((state) => state.service.detail);
  const sideBarCss = useSelector((state) => state.service.sideBarCss);
  // -----------------------------------------------------------------------
  const [currentUser, setCurrentUser] = useState(null);

  const [progress, setProgress] = useState(0);
  const [resfullname, setFullname] = useState([]);
  const [resfullname_re, setFullname_re] = useState([]);
  const [resemail, setEmail] = useState([]);
  const [file, setFile] = useState(null);
  const [scale, setScale] = useState(1.2);
  const [newimage, setNewimage] = useState();
  const [resultImage, setResultImage] = useState([]);
  const [imgprofile, setImgProfile] = useState([]);
  const [typeFile, setTypeFile] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const avatarEditorRef = useRef();
  const [imageShown, setImageShow] = useState(false);
  const [resemailverified, setEmailverified] = useState(false)
  const [profileEdit, setProfileEditTrue] = useState(null);
  const [pwEdit, setPasswordEditTrue] = useState(null);
  const [profilecancel, setProfileCancelTrue] = useState();
  const [disabled, setDisabled] = useState(true);
  const [spinner, setSpinner] = useState(true);
  const [newlogin, setNewlogin] = useState(false);
  const [value, setValue] = useState();
  const [restypelogin ,setTypelogin]= useState();

  const toggleEditClick = () => {
    setProfileEditTrue(profileEdit ? false : true);
  }

  const history = useHistory()

  // ---------------------------------------------------------------- //
  //Avatar  -------------->
  const [state, setState] = useState({
    cropperOpen: false,
    img: null,
    remove: "",
    zoom: 1,
    croppedImg: "",
  });

  const editorRef = useRef(null);
  const inputRef = useRef(null);

  function handleZoomSlider(event, value) {
    setState((prev) => ({ ...prev, zoom: value }));
  }

  function handleFileChange(event) {
    window.URL = window.URL || window.webkitURL;
    let urlimg = window.URL.createObjectURL(event.target.files[0]);
    // console.log(event.target.files[0]);
    setTypeFile("." + event.target.files[0].name.split(".").pop());
    inputRef.current.value = "";
    setState((prev) => ({ ...prev, img: urlimg, cropperOpen: true }));
  }

  function handleCancel() {
    setState((prev) => ({ ...prev, cropperOpen: false }));
  }

  function handleSave(e_data) {
    // console.log("e_data", e_data);

    if (editorRef.current) {
      const canvasScaled = editorRef.current.getImageScaledToCanvas();
      const croppedImg = canvasScaled.toDataURL();

      // setNewimage(croppedImg);

      setState((prev) => ({ ...prev, cropperOpen: false, croppedImg }));
      // console.log("Save",croppedImg);

      //put
      storage
        .ref(`images/${user.uid + typeFile}`)
        .putString(croppedImg, "data_url")
        .then((snapshot) => {
          // console.log("then((snapshot)", snapshot);
          // console.log(user.uid + typeFile);
          // console.log(croppedImg);

          //get
          storage
            .ref(`images/${user.uid + typeFile}`)
            .getDownloadURL()
            .then((downloadURL) => {
              setResultImage(downloadURL);
              // console.log("URLget", downloadURL);

              //Send personal info
              var imageRef = db
                .collection("drive")
                .doc(user.uid);

              return imageRef
                .update({
                  img_profile: downloadURL,
                })
                .then(function () {
                  alert("Your Image Profile is being updated!");
                })
                .catch(function (error) {
                  console.error("Error updating document: ", error);
                });
              // ----------------------------------------------------------
              // axios
              //   .post("/users/edit_img", {
              //     uid: user.uid,
              //     img_file: downloadURL,
              //   })
              //   .then((res) => {
              //     setCurrentUser(res);
              //     alert("Your Image Profile is being updated!");
              //     // window.location.reload();
              //   })
              //   .catch((error) => {
              //     console.error(error);
              //   });

            });
        });
    }
  }

  useEffect(() => {
    if (user) {
      const userInformation = db
        .collection("drive")
        .doc(user.uid)
        .onSnapshot((doc) => {
          // console.log("Current data: ", doc);
          setFullname(doc.data().name);
          setFullname_re(doc.data().name);
          setNewlogin(doc.data().setpassword);
          setEmailverified(user.emailVerified);
        });

      return () => {
        userInformation();
      };
    }
  }, [user]);

  //Call info start
  useEffect(() => {
    if (user) {
      const userInformation = db
        .collection("drive")
        .doc(user.uid)
        .onSnapshot((doc) => {
          // setImgProfile(doc.data().img_profile);
          setFullname(doc.data().name);
          setEmail(doc.data().email);
          // console.log("Current data: ", doc.data());
          setTimeout(() => setSpinner(false));
        });

      const typelogin = firebaseApp.auth().currentUser;
        setTypelogin(typelogin);
      return () => {
        userInformation();
      };
    }
  }, [user]);

  // Modal //
  const setModalIsOpenToTrue = () => {
    setModalIsOpen(true)
  }

  const setModalIsOpenToFalse = (e) => {
    // console.log("e",e);
    setModalIsOpen(false)
  }

  const reSend = () => { 
    //Email sent.
    var veri_user = firebaseApp.auth().currentUser;
    veri_user.sendEmailVerification()
    .then(function() {
      console.log("Email sent");
      alert("กรุณายืนยัน Email เพื่อเข้าใช้งานระบบ");
      history.push("/");

    }).catch(function(error) {
      console.log("An error Email sent:",error);
    })
  }

  // -----------------------------------------------------------------//
  return (
    // <div className={sideBarCss ? "hp__bg__hide" : "hp__bg__show"}>
    <div className="hp__bg__hide">

      <div className="homepage__background__inside">

        {/* <DashCloud/> */}
        {spinner &&
          <div className="homepage__loading">
            <Loading size={"5rem"} />
          </div>
        }
        {!spinner &&
          <>
            <div className="setting_page_periphery">
              <br />
              <div class="imgcontainer">
                <img src={dotdrive} alt="" class="" />
              </div>
              <br />

              <p class="thick">ตั้งค่า</p>

              {/* form_1 */}
              <form class="setting_page_inner">
                {/* ---------------------------------------------Avatar------------------------------ */}
                <div class="row">
                  <div className="d-flex justify-content-center">
                    <Avatar className="image_profile"
                      style={{ width: "140px", height: "140px" }}
                      // src={state.croppedImg}
                      src={detail && detail.img_profile ? detail.img_profile : ""}
                      size={200}
                    />
                  </div>

                  <input
                    accept="image/*"
                    ref={inputRef}
                    name="newImage"
                    onInput={
                      setModalIsOpenToTrue
                    }
                    onChange={handleFileChange}
                    id="Upload an Image"
                    multiple
                    type="file"
                    hidden
                  />
                </div>
                {/* ---------------------------------------------Avatar------------------------------ */}
              </form>

              <div class="normal-3">
                <label htmlFor="Upload an Image">
                  <Button
                    id="edit_btn"
                    class="button button_3"
                    component="Modal"   //component= Open <Box>
                  >
                    <span class="button_portrait"><img class="img_" src={portrait} /> แก้ไขโปรไฟล์   </span> 
                                   
                  </Button>
                </label>
              </div>

              <Modal isOpen={modalIsOpen}
                style={{
                  overlay: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.75)' // Cover page
                  },
                  //  Set Modal Property 
                  content: {
                    position: 'absolute',
                    top: '40px',
                    left: '5%',
                    right: '5%',
                    bottom: '5%',
                    border: '0px solid #ccc',
                    background: '',
                    overflow: 'auto',
                    WebkitOverflowScrolling: 'touch',
                    borderRadius: '4px',
                    outline: 'none',
                    padding: '20px'
                  }
                }}
                >
                <div class="cover_edit_image">

                  <Box className="periphery_edit_profile" pt={4} pl={3} pr={3} pb={10}>  {/*spacing:ระยะห่าง pt:padding-top */}
                    <h3>แก้ไขโปรไฟล์</h3>

                    {state.cropperOpen && (
                      <div className="inner_edit_profile">
                        <AvatarEditor
                          ref={editorRef}
                          image={state.img}
                          height={200}
                          width={200}
                          border={5}
                          color={[255, 255, 255, 0.6]}
                          scale={state.zoom}
                          rotate={0}
                          borderRadius={100}
                          style={{ margin: "0px" }}
                        />
                      </div>
                      // ------------------ div box inner ------------------------- //

                    )}

                    {/* ------------------Scroll image --------------------- */}
                    <br />

                    <Grid container spacing={0} mt={2}>
                      <Grid item xs={2}>

                      </Grid>
                      <div className="image_icon_small">
                        <ImageIcon fontSize="small" />
                      </div>
                      <div className="slider">
                        <Slider
                          //set defult position scrollbar at state zoom: n
                          //min  0----------10 max Line of image
                          min={1}
                          max={8}
                          step={0.1}
                          value={state.zoom}
                          onChange={handleZoomSlider}
                          style={{
                            width: 170
                          }}
                        />
                      </div>
                      <div className="image_icon_large">
                        <ImageIcon fontSize="large" />
                      </div>
                    </Grid>

                    <Grid container spacing={12} container
                      direction="row"
                      justify="center"
                      alignItems="center">
                      <Grid
                        item
                        xs={12}
                        display="flex"
                        justifyContent="center"
                      >
                        <label
                          style={{
                            fontSize: 12,
                            marginRight: 10,
                            paddingBottom: 15,
                            fontWeight: 600,
                          }}
                        >
                        </label>
                      </Grid>
                    </Grid>

                    {/* -------------------- */}
                    <Grid
                      mt={2}
                      spacing={3}
                      container
                      direction="row"
                      justify="flex-end"
                      alignItems="center"
                    >
                    </Grid>
                    <button id="cancel" class="button button_modal_2" onClick={() => { handleCancel(); setModalIsOpenToFalse(); }} >ยกเลิก</button>
                    <button id="cancel" class="button button_modal_1" onClick={() => { handleSave(); setModalIsOpenToFalse(); }} >ยืนยัน</button>
                  </Box>
                </div>
              </Modal>

              {/* -------------------------------Modal-------------------------------- */}

              {/* Switch between different views */}
              <br/>  
              {/* <hr/>         */}
              <form id="info-form" class="setting_page_inner">
                {/* <Tabs_Setting /> */}
              </form>

              {/* form_2 */}
              <form id="info-form-old" class="setting_page_inner">
                <Personal_1 />
                <div className="footbotton">
                  <Link id="go_personal_2"  to="/info"><button class="button button-2" > แก้ไข </button> </Link>
                </div>
              </form>

              {resemailverified ? "" : <div className="alert-confirmemal">
               <h2>ท่านยังไม่ได้ยืนยัน Email </h2>
                <button type="submit" id="confirm" class="button button_4" onClick={reSend}>
                  ส่งการยืนยันอีกครั้ง ?
                </button>
               </div> }

            </div>
          </>
        }
      </div>
      {/* In END --------------------------------------------------*/}
    </div>
  );
};

export default SettingForm;
