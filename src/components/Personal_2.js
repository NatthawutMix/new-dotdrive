import React, { useRef, useState, useEffect } from "react";
import { Redirect, useHistory, Route, Link } from "react-router-dom";
import Loading from "./Loading";
import { useSelector } from "react-redux";
import dotdrive from "../images/Dotdrive.png";
import { useForm } from "react-hook-form";
import { firebaseApp, auth } from "../firebase";
import "../css/Setting.css";
import axios from "../axios";
import { db } from "../firebase";
import shieldcheck from "../images/fi-rr-shield-check.svg";

const Personal_2 = () => {
  const user = useSelector((state) => state.service.user);
  const detail = useSelector((state) => state.service.detail);
  const sideBarCss = useSelector((state) => state.service.sideBarCss);
  // -----------------------------------------------------------------------
  const [currentUser, setCurrentUser] = useState(null);

  const [progress, setProgress] = useState(0);

  const [resfullname, setFullname] = useState([]);
  const [resfullname_re, setFullname_re] = useState([]);
  const [resemail, setEmail] = useState([]);
  const [resemail_re, setEmail_re] = useState([]);
  const [file, setFile] = useState(null);
  const [scale, setScale] = useState(1.2);
  const [newimage, setNewimage] = useState();
  const [resultImage, setResultImage] = useState([]);
  const [typeFile, setTypeFile] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const searchInput = useRef();
  const [imageShown, setImageShow] = useState(false);

  const [profileEdit, setProfileEditTrue] = useState(null);
  const [profilecancel, setProfileCancelTrue] = useState();
  const [newlogin, setNewlogin] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [spinner, setSpinner] = useState(true);
  const [resemailverified, setEmailverified] = useState(null)

  const [value, setValue] = useState();

  const toggleEditClick = () => {
    setProfileEditTrue(profileEdit ? false : true);
  };

  const history = useHistory();

  // console.log("user.providerData", user.providerData);

  useEffect(() => {
    if (user) {
      const userInformation = db
        .collection("drive")
        .doc(user.uid)
        .onSnapshot((doc) => {
          // console.log("Current data: ", doc.data());
          setFullname(doc.data().name);
          setFullname_re(doc.data().name);
          setEmail(doc.data().email);
          setEmail_re(doc.data().email);
          setNewlogin(doc.data().setpassword);
          setEmailverified(user.emailVerified);
          // console.log("user.emailVerified:",user.emailVerified);
          setTimeout(() => setSpinner(false));
        });
      return () => {
        userInformation();
      };
    }

  }, [user]);

  //Call info start
  // useEffect(() => {
  //   if (user) {
  //     axios
  //       .post("/users/detail", {
  //         uid: user.uid,
  //       })
  //       .then((res) => {
  //         // setImgProfile(res.data.img_profile);
  //         // console.log("RestData:👋👋", res);
  //       });
  //   }
  // }, [user]);

  const defaultValues = {
    // password1: "",
    // password2: "",
  };

  // Validation Form
  const { register, handleSubmit, watch, errors } = useForm({
    defaultValues: {
      // fullname: "",
      // email: "",
      password1: "",
      password2: "",
    },
  });

  const methods = useForm({ defaultValues });

  // --------------------------------------------
  const onSubmit = (e_data) => {
    // console.log("e_data", e_data);
    if (e_data.fullname != resfullname_re ) {
      let inforDocRef = db.collection("drive").doc(user.uid);
        inforDocRef
        .update({
          name: e_data.fullname,
        })
        .then(() => {
          alert("Full name successfully updated!");
          history.push("/setting");
        })
        .catch(function (error) {
          console.error("Error updating full name: ", error);
        });

    } 
    else if
      // Only change password 
      (e_data.password1 !== "") {
      auth
      .signInWithEmailAndPassword(e_data.email, e_data.currentpassword)
      .then((userCredential) => {

      firebaseApp
        .auth()
        .currentUser.updatePassword(e_data.password1)
        .then(() => {
          alert("Password update successfully updated!");
          history.push("/");
          const passwordupdated = db
            .collection("drive")
            .doc(user.uid)
            .onSnapshot((doc) => {

            });
          return passwordupdated;
        })
        .catch(function (error) {
          console.error("Error updating password: ", error);
        });
      
      }).catch((error) => alert(error.message));  
    } else if

    // console.log("Before", resemail_re);
    // console.log("After",  e_data.email);

    // Send info name info
    (e_data.fullname != resfullname_re || e_data.email != resemail_re) {

      firebaseApp
      .auth()
      .currentUser.updateEmail(e_data.email)  //Use current password
      .then((userCredential) => {
        setCurrentUser(userCredential);  //For Change email use this;
        //UpdateEmail data
        var inforDocRef = db.collection("drive").doc(user.uid);
        inforDocRef
          .update({
            name: e_data.fullname,
            email: e_data.email,
          })
          .then(() => {

            // console.log("firebaseApp.auth().currentUser",firebaseApp.auth().currentUser);
            let ProviderData0 = firebaseApp.auth().currentUser.providerData[0].providerId;  //providerData[0] == "google.com" (เมลเดิม)
            let ProviderData1 = firebaseApp.auth().currentUser.providerData[1].providerId;  //providerData[1] == "password"   (เมลใหม่)

            firebaseApp.auth().currentUser
            .unlink(ProviderData0).then(() => {
              // console.log("Unlink ProviderData0", ProviderData0)
              //history.push("/");
            }).catch((error) => {
              console.log("Unlink error",error)
            });

            const userupdated = db
              .collection("drive")
              .doc(user.uid)
              .onSnapshot((doc) => {

                //Email sent.
                var veri_user = firebaseApp.auth().currentUser;  //currentUser: data atter submit
                veri_user.sendEmailVerification().then(function() {
                  console.log("Email sent");
                  alert("กรุณายืนยัน Email เพื่อสู่ระบบใหม่อีกครั้ง");
                  history.push("/");
                }).catch(function(error) {
                  console.log("An error Email sent:",error);
                });

              });
            return userupdated;
          })
          .catch(function (error) {
            console.error("Error updating info data: ", error);
          });
      // -------------
      })
      .catch(function (error) {
        console.error("Error Authen email update: ", error);
      }); 
    }
  };

   // ------------------------------------------------ //
  const onSubmit_2 = (e_data) => {
    // console.log("e_data", e_data);

    // Only change name
    if (e_data.fullname !== resfullname_re) {
      let inforDocRef = db.collection("drive").doc(user.uid);
        inforDocRef
        .update({
          name: e_data.fullname,
        })
        .then(() => {
          alert("Full name successfully updated!");
          history.push("/setting");
        })
        .catch(function (error) {
          console.error("Error updating full name: ", error);
        });
    }
    // Only create password 
    else if (e_data.password1 !== "" && e_data.email === resemail_re) {
      firebaseApp
      .auth()
      .currentUser.updatePassword(e_data.password1)
      .then((userCredential) => {
        setCurrentUser(userCredential);
        let inforDocRef = db.collection("drive").doc(user.uid);
          inforDocRef
            .update({
              setpassword: "true",
            })
            .then(() => {
              console.log("setpassword:true")
              history.push("/");
            })
            .catch(function (error) {
              console.error("Error updating info data: ", error);
            });
            // -------------    
        alert("Password successfully updated!");
      })
      .catch(function (error) {
        console.error("Error updating password: ", error);
      });
    }
    // Only change email 
    else if (e_data.email !== resemail_re && e_data.password1 === "") {
      alert("Please create password !!");
    }
    // Only change email and create password 
    else if (e_data.email !== resemail_re && e_data.password1 !== "") {
      firebaseApp
      .auth()
      .currentUser.updateEmail(e_data.email)
      .then((userCredential) => {
        setCurrentUser(userCredential);  //For Change email use this;
        //Update Firestore data
        let inforDocRef2 = db.collection("drive").doc(user.uid);
        inforDocRef2
          .update({
            email: e_data.email,
          })
          .then(() => {
            const userupdated2 = db
              .collection("drive")
              .doc(user.uid)
              .onSnapshot((doc) => {
                var veri_user = firebaseApp.auth().currentUser;  //currentUser: data atter submit
                // console.log("veri_user",veri_user);
                veri_user.sendEmailVerification().then(function() {
                // console.log("firebaseApp.auth().currentUser",firebaseApp.auth().currentUser);
                let ProviderData0 = firebaseApp.auth().currentUser.providerData[0].providerId;  //providerData[0] == "google.com" (เมลเดิม)
                // let ProviderData1 = firebaseApp.auth().currentUser.providerData[1].providerId;  //providerData[1] == "password"   (เมลใหม่)
              
                //Sure  firebaseApp.auth().currentUser.unlink(ProviderData0)
                firebaseApp.auth().currentUser
                .unlink(ProviderData0)
                .then(() => {
                  console.log("Unlink ProviderData0", ProviderData0);
                  // ---------------pw-------------------- // 
                  firebaseApp
                  .auth()
                  .currentUser.updatePassword(e_data.password1)
                  .then((userCredential) => {
                    setCurrentUser(userCredential);
                    let inforDocRef = db.collection("drive").doc(user.uid);
                      inforDocRef
                        .update({
                          setpassword: "true",
                        })
                        .then(() => {
                          console.log("setpassword:true")
                          history.push("/");
                        })
                        .catch(function (error) {
                          console.error("Error updating info data: ", error);
                        });
                        // -------------    
                    // alert("Password successfully updated!");
                  })
                  .catch(function (error) {
                    console.error("Error updating password: ", error);
                  });
                  // ---------------pw-------------------- //
                  // history.push("/");
                }).catch((error) => {
                  console.log("Unlink error",error)
                });
                console.log("Email sent acgoogle change email");
                alert("กรุณายืนยัน Email เพื่อสู่ระบบใหม่อีกครั้ง");

                })
                .catch(function(error) {
                  console.log("An error Email sent:",error);
                });

              });
            return userupdated2;
          })
          .catch(function (error) {
            console.error("Error updating info data: ", error);
          });
          // -------------

      })
      .catch(function (error) {
        console.error("Error Authen email update: ", error);
      }); 
    }
  };

  if (currentUser) {
    // return <Redirect to="/setting" />;
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

  /* The handleChange() function to set a new state for input */
  const fullname_handleChange = (event) => {
    setFullname(event.target.value);
  };
  const email_handleChange = (event) => {
    setEmail(event.target.value);
  };

  // -----------------------------------------------------------------//
  return (
    <div className="hp__bg__hide">
      <div className="homepage__background__inside">
        {/* <DashCloud/> */}
        {spinner && (
          <div className="homepage__loading">
            <Loading size={"5rem"} />
          </div>
        )}
        {!spinner && (
          <>
            <div className="setting_page_periphery">
              <br />
              <div class="imgcontainer">
                <img src={dotdrive} alt="" class="" />
              </div>
              <br />

              { newlogin ?  
              <form id="info-form" class="setting_page_inner" onSubmit={handleSubmit(onSubmit)}>
                {/* form_2_1 */}
                <br />
                <hr />
                <div>
                  <h4>ข้อมูลโปรไฟล์</h4>
                </div>

                <div class="inputWithIcon">
                  <input
                    type="text"
                    name="fullname"
                    placeholder="Full Name"
                    ref={register({
                      // required: "Full name is required.",
                      minLength: {
                        value: 4,
                        message: "Fullname length must be 4 to 25 characters.",
                      },
                      maxLength: {
                        value: 25,
                        message: "Fullname length must be 4 to 25 characters.",
                      },
                    })}
                    value={resfullname}
                    onChange={fullname_handleChange}
                    disabled={!disabled}
                  />
                  <i class="fa fa-user fa-lg fa-fw" aria-hidden="true"></i>
                  {errors.fullname && (
                    <p className="alert-error">{errors.fullname.message}</p>
                  )}
                </div>

                {/* ---------------------------------------- */}
                <div class="inputWithIcon">
                  <input
                    type="text"
                    name="email"
                    placeholder="Your Email"
                    ref={register({
                      required: "Email is required.",
                      pattern: {
                        value: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
                        message: "Email is not valid.",
                      },
                    })}
                    value={resemail}
                    onChange={email_handleChange}
                    disabled={!disabled}
                  />
                  <i class="fa fa-envelope fa-lg fa-fw" aria-hidden="true"></i>
                  {resemailverified ? <i className="keep_icon"><img src={shieldcheck}/></i> : ""}
                  {errors.email && (
                    <p className="alert-error">{errors.email.message}</p>
                  )}
                </div>

                <hr />

                <div>
                  <h4>เปลี่ยนรหัสผ่าน</h4>
                </div>

                  <div class="inputWithIcon">
                  <input
                    type="password"
                    name="currentpassword"
                    placeholder="Current Password"
                    ref={
                      profilecancel
                        ? methods.register()
                        : register({
                            minLength: {
                              value: 6,
                              message:
                                "Password should be at-least 6 characters.",
                            },
                          })
                    }
                  />
                  <i class="fa fa-lock fa-lg fa-fw" aria-hidden="true"></i>
                  {errors.currentpassword && (
                    <p className="alert-error">{errors.currentpassword.message}</p>
                  )}
                </div>

                <div class="inputWithIcon">
                  <input
                    type="password"
                    name="password1"
                    placeholder="New Password"
                    ref={
                      profilecancel
                        ? methods.register()
                        : register({
                            minLength: {
                              value: 6,
                              message:
                                "Password should be at-least 6 characters.",
                            },
                          })
                    }
                  />
                  <i class="fa fa-lock fa-lg fa-fw" aria-hidden="true"></i>
                  {errors.password1 && (
                    <p className="alert-error">{errors.password1.message}</p>
                  )}
                </div>

                <div class="inputWithIcon">
                  <input
                    type="password"
                    name="password2"
                    placeholder="New Password Again"
                    ref={register({
                      validate: (value) =>
                        value === watch("password1") ||
                        "Passwords don't match.",
                    })}
                  />
                  <i class="fa fa-lock fa-lg fa-fw" aria-hidden="true"></i>
                  {errors.password2 && (
                    <p className="alert-error">{errors.password2.message}</p>
                  )}
                </div>

                <div className="footbotton">
                  <Link id="go_setting" to="/setting">
                    <button class="button button-3"> ยกเลิก </button>
                  </Link>

                  <button type="submit" id="confirm" class="button button-2">
                    ยืนยัน
                  </button>
                </div>
              </form> 
                : 
                <form id="info-form" class="setting_page_inner" onSubmit={handleSubmit(onSubmit_2)}>
                {/* form_2_2 */}
                <br />
                <hr />
                <div>
                  <h4>ข้อมูลโปรไฟล์</h4>
                </div>

                <div class="inputWithIcon">
                  <input
                    type="text"
                    name="fullname"
                    placeholder="Full Name"
                    ref={register({
                      // required: "Full name is required.",
                      minLength: {
                        value: 4,
                        message: "Fullname length must be 4 to 25 characters.",
                      },
                      maxLength: {
                        value: 25,
                        message: "Fullname length must be 4 to 25 characters.",
                      },
                    })}
                    value={resfullname}
                    onChange={fullname_handleChange}
                    disabled={!disabled}
                  />
                  <i class="fa fa-user fa-lg fa-fw" aria-hidden="true"></i>
                  {errors.fullname && (
                    <p className="alert-error">{errors.fullname.message}</p>
                  )}
                </div>

                {/* ---------------------------------------- */}
                <div class="inputWithIcon">
                  <input
                    type="text"
                    name="email"
                    placeholder="Your Email"
                    ref={register({
                      // required: "Email is required.",
                      pattern: {
                        value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                        message: "Email is not valid.",
                      },
                    })}
                    value={resemail}
                    onChange={email_handleChange}
                    disabled={!disabled}
                  />
                  <i class="fa fa-envelope fa-lg fa-fw" aria-hidden="true"></i>
                  {resemailverified ? "" :  <i className="keep_icon"><img src={shieldcheck}/></i>}
                  {errors.email && (
                    <p className="alert-error">{errors.email.message}</p>
                  )}
                </div>

                <hr />

                <div>
                  <h4>สร้างรหัสผ่าน</h4>
                </div>

                <div class="inputWithIcon">
                  <input
                    type="password"
                    name="password1"
                    placeholder="New Password"
                    ref={profilecancel ? methods.register() : register({
                            minLength: {
                              value: 6,
                              message:
                                "Password should be at-least 6 characters.",
                            },
                          })
                    }
                  />
                  <i class="fa fa-lock fa-lg fa-fw" aria-hidden="true"></i>
                  {errors.password1 && (
                    <p className="alert-error">{errors.password1.message}</p>
                  )}
                </div>

                <div class="inputWithIcon">
                  <input
                    type="password"
                    name="password2"
                    placeholder="New Password Again"
                    ref={register({
                      validate: (value) =>
                        value === watch("password1") ||
                        "Passwords don't match.",
                    })}
                  />
                  <i class="fa fa-lock fa-lg fa-fw" aria-hidden="true"></i>
                  {errors.password2 && (
                    <p className="alert-error">{errors.password2.message}</p>
                  )}
                </div>

                <div className="footbotton">
                  <Link id="go_setting" to="/setting">
                    <button class="button button-3"> ยกเลิก </button>
                  </Link>

                  <button type="submit" id="confirm" class="button button-2">
                    ยืนยัน
                  </button>
                </div>
              </form> }
              {/* onSubmit_2 */}

             {resemailverified ? "" : <div className="alert-confirmemal">
               <h2>ท่านยังไม่ได้ยืนยัน Email </h2>
                <button type="submit" id="confirm" class="button button_4" onClick={reSend}>
                  ส่งการยืนยันอีกครั้ง ?
                </button>
               </div> }
 
            </div>
          </>
        )}
      </div>
      {/* In END --------------------------------------------------*/}
    </div>
  );
};

export default Personal_2;
