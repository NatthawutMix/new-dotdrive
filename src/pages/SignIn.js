import React, { useState, useEffect } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { setUser, setDetail, setAllused } from "../redux/services";
import { firebaseApp, google, facebook, auth } from "../firebase";
import { useForm } from "react-hook-form";
import "../css/LoginForm.css";
import dotdrive from "../images/Dotdrive.png";
import { useHistory, Link } from "react-router-dom";
import axios from "../axios";
import { db } from "../firebase";

const LoginForm = ({ setUser, setDetail }) => {
  const user = useSelector((state) => state.service.user);
  const dispatch = useDispatch();
  const history = useHistory();
  const [passwordShown, setPasswordShown] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [resemail, setEmail] = useState([]);

  useEffect(() => {
    if (user) {
      const userInformation = db
        .collection("drive")
        .doc(user.uid)
        .onSnapshot((doc) => {
          // setEmail(doc.data().email);
        });
      return userInformation();
    }
  }, [user]);

  //Even
  const togglePasswordVisiblity = () => {
    setPasswordShown(passwordShown ? false : true);
  };

  const signInWithGoogle = (e) => {
    e.preventDefault(); // NO Submit form
    auth
      .signInWithPopup(google)
      .then((userCredential) => {
        // setUser(userCredential.user);
          db
          .collection("drive")
          .doc(userCredential.user.uid)
          .get()
          .then((doc) => {
          // console.log("Email Google", userCredential.user.email)
          // console.log("Email Firebase",doc)
          if (doc.data()) {
            history.push("/setting"); //Login with Google should to ("/setting") always
          } else {
            let u_data = {
              max: 16106127360,
              used: 0,
              name: userCredential.user.displayName,
              img_profile: userCredential.user.photoURL,
              createdAt: Date.now(),
              email: userCredential.user.email,
              setpassword: false,
            };
            db
            .collection("drive").doc(userCredential.user.uid).set(u_data)
            .then(() => {
              console.log("User google create successfully");
              history.push("/info");
            })
            .catch((error) => {
              console.error("Error writing create user: ", error);
            });
          }
        })
        .catch((error) => {
          console.log(error.message);
        });
        // -----------
      })
      .catch((error) => {
        console.log(error.message);
      });
  };
// ------------------Google ^ -------------------------- //
  const signInWithFacebook = (e) => {
    e.preventDefault();
    auth
      .signInWithPopup(facebook)
      .then((res) => {
        history.push("/dashboard");
        // console.log('RES:', res);

        axios
          .post("/users/regisApp", {
            email: res.user.email,
            fname: res.user.displayName,
            uid: res.user.uid,
            // img: res.user.
            returnSecureToken: true,
          })
          .then((res) => {
            console.info(res);
          })
          .catch((error) => {
            console.error(error);
          });
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  const { register, handleSubmit, errors } = useForm();

  const onSubmit = (even) => {
    // console.log("data:", e);
    let isComponentMounted = true;
    firebaseApp
      .auth()
      .signInWithEmailAndPassword(even.email, even.password)
      .then((userCredential) => {
        setUser(userCredential.user);

        if (userCredential.user.emailVerified === false) {
          // alert("ท่านยังไม่ได้ยืนยัน Email");
          history.push("/setting");
        }
        else {
          // alert("กรุณายืนยัน Email ก่อนเข้าสู่ระบบ");
          history.push("/dashboard");
        }

        const userInformation = db
          .collection("drive")
          .doc(userCredential.user.uid)
          .onSnapshot((doc) => {
            if (isComponentMounted) {
              dispatch(setAllused(doc.data().used));
              setDetail(doc.data());
            }
          });
        return userInformation();

      })
      .catch((error) => alert(error.message));
    return () => {
      isComponentMounted = false;
    };
  };

  return (
    <div class="form_page_signin">
      <div class="form_page_periphery">
        <form class="form_page_inner" onSubmit={handleSubmit(onSubmit)}>
          {/* <form onSubmit={onSubmit}> */}
          {/* <form> */}
          <div class="container-center">
            <div class="col-12">

              <br />
              <div class="imgcontainer">
                <img src={dotdrive} alt="Avatar" />
              </div>
              <br />
              <p class="normal-1">Welcome to Dotdrive</p>
              <p class="normal-2">Sign in to continue</p>
              <div class="inputWithIcon">
                <input
                  type="text"
                  name="email"
                  placeholder="Your Email"
                  ref={register({
                    required: "Email is required.",
                    pattern: {
                      value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                      message: "Email is not valid.",
                    },
                  })}
                />
                <i class="fa fa-envelope fa-lg fa-fw" aria-hidden="true"></i>
                {errors.email && (
                  <p className="alert-error">{errors.email.message}</p>
                )}
              </div>

              <div class="inputWithIcon-password">
                <input
                  type={passwordShown ? "text" : "password"}
                  name="password"
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
                <i
                  class={
                    passwordShown
                      ? "fa fa-eye fa-lg fa-fw keep_right"
                      : "fa fas fa-eye-slash fa-lg fa-fw keep_right"
                  }
                  onClick={togglePasswordVisiblity}
                ></i>
                {errors.password && (
                  <p class="alert-error">{errors.password.message}</p>
                )}
              </div>

              <div class="container-left">
                <label class="rem">
                  <input type="checkbox" name="remember" ref={register()} />
                  &nbsp;&nbsp; Remember me
                </label>
              </div>
              <button id="signin" class="button button-1">Sign In</button>
              <p class="or-line">
                <span> OR </span>
              </p>
              {/* <br /> */}
              <div>
                <button onClick={signInWithGoogle} class="btn-G">
                  Login with Google
                </button>
              </div>
              <br />
              <div>
                {/* <button onClick={signInWithFacebook} class="btn-F">
                  Login with Facebook
                </button> */}
              </div>
              <a class="col-s-12 forgot" href="#">
                Forgot Password?
              </a>
              <div class="col-12 border-c">
                <div class="col-12 col-s-12">
                  <p class="normal-2">
                    Don’t have an account?<span>&nbsp;&nbsp;</span>
                    <Link to={"/signup"}>
                      <a class="reg">Register</a>
                    </Link>
                  </p>
                </div>
              </div>
              <br />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    setDetail: (data) => dispatch(setDetail(data)),
    setUser: (data) => dispatch(setUser(data)),
  };
};
export default connect(null, mapDispatchToProps)(LoginForm);
