import React, { useState } from "react";
import { Redirect, Link, useHistory } from "react-router-dom";
import { connect, useDispatch } from "react-redux";
import { firebaseApp } from "../firebase";
import { useForm } from "react-hook-form";
import { setUser, setDetail, setAllused } from "../redux/services";
import "../css/LoginForm.css";
import dotdrive from "../images/Dotdrive.png";
import { db } from "../firebase";

const SignupForm = ({ setUser, setDetail }) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const [currentUser, setCurrentUser] = useState(null);

  const { register, handleSubmit, watch, errors } = useForm({
    defaultValues: {
      fullname: "",
      email: "",
      password1: "",
      password2: "",
    },
  });

  const onSubmit = (e) => {
    // console.log("data:", e);

    firebaseApp
      .auth()
      .createUserWithEmailAndPassword(e.email, e.password1)

      .then((userCredential) => {
        setCurrentUser(userCredential.user); //user.data
        setUser(userCredential.user);
        // console.log("userCredential:", userCredential);
        // history.push("/");

        let u_data = {
          max: 16106127360,
          used: 0,
          name: e.fullname,
          img_profile: null,
          createdAt: Date.now(),
          email: e.email,
          setpassword: true,
          // emailVerified: false,
        };

        db
          .collection("drive").doc(userCredential.user.uid)
          .set(u_data)
          .then(() => {
            console.log("User create successfully");

            //Email sent.
            var veri_user = firebaseApp.auth().currentUser;  //currentUser: data atter submit
            // console.log("veri_user",veri_user);
            veri_user.sendEmailVerification()
              .then(function (userCredential) {
                console.log("Email sent"); //มี,ไม่มีก็ส่ง
                alert("กรุณายืนยัน Email เพื่อเข้าใช้งานระบบ");
                history.push("/");

              }).catch(function (error) {
                console.log("An error Email sent:", error);
                // ถ้าไม่มีเมลปลายทาง =>
                // a: null
                // code: "auth/invalid-recipient-email"
                // message: "Missing recipients"
              })

          })
          .catch((error) => {
            console.error("Error writing create user: ", error);
          });

      })
      .catch((error) => {
        if (error.code === "auth/email-already-in-use")
          alert("Email already in use !");
      });

  };

  // if true (ผ่านการสมัครเข้ามา)
  // if (currentUser) {
  //   return <Redirect to="/" />;
  // }

  return (
    <div class="form_page_signin">
      <form class="form_page_periphery" onSubmit={handleSubmit(onSubmit)}>
        <div class="form_page_inner">
          <div class="container-center">
            <div class="col-12">
              <br />
              <div class="imgcontainer">
                <img src={dotdrive} alt="Avatar" class="dotdrive" />
              </div>
              <br />
              <p class="normal-1">Let’s Get Started</p>
              <p class="normal-2">Create an new account</p>
              <div class="inputWithIcon">
                <input
                  type="text"
                  name="fullname"
                  placeholder="Full Name"
                  ref={register({
                    required: "Full name is required.",
                    minLength: {
                      value: 4,
                      message: "Fullname length must be 4 to 25 characters.",
                    },
                    maxLength: {
                      value: 25,
                      message: "Fullname length must be 4 to 25 characters.",
                    },
                  })}
                />
                <i class="fa fa-user fa-lg fa-fw" aria-hidden="true"></i>
                {errors.fullname && (
                  <p className="alert-error">{errors.fullname.message}</p>
                )}
              </div>
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
                />
                <i class="fa fa-envelope fa-lg fa-fw" aria-hidden="true"></i>
                {errors.email && (
                  <p className="alert-error">{errors.email.message}</p>
                )}
              </div>
              <div class="inputWithIcon">
                <input
                  type="password"
                  name="password1"
                  placeholder="Password"
                  ref={register({
                    required: "Password is required.",
                    minLength: {
                      value: 6,
                      message: "Password should be at-least 6 characters.",
                    },
                  })}
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
                  placeholder="Password Again"
                  ref={register({
                    validate: (value) =>
                      value === watch("password1") || "Passwords don't match.",
                  })}
                />
                <i class="fa fa-lock fa-lg fa-fw" aria-hidden="true"></i>
                {errors.password2 && (
                  <p className="alert-error">{errors.password2.message}</p>
                )}
              </div>
              <br />
              <button id="signup" class="button button-1">
                Sign Up
              </button>
              <br /> <br />
              <div class="col-12 border-c">
                <div class="col-12 col-s-12">
                  <p class="normal-2">
                    Have an account?<span>&nbsp;&nbsp;</span>
                    <Link to={"/login"}>
                      <label id="signin" class="reg">
                        Sign In
                      </label>
                    </Link>
                  </p>
                </div>
              </div>
              <br />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    setDetail: (data) => dispatch(setDetail(data)),
    setUser: (data) => dispatch(setUser(data)),
  };
};
export default connect(null, mapDispatchToProps)(SignupForm);
