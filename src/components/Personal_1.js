import React, { useRef, useState, useEffect } from "react";
import Loading from "./Loading";
import { useSelector } from "react-redux";
import { useForm, Controller, useFormContext } from "react-hook-form";
import "../css/Setting.css";
import { db } from "../firebase";
import shieldcheck from "../images/fi-rr-shield-check.svg";


const Personal_1 = () => {

  const user = useSelector((state) => state.service.user);
  const [resfullname, setFullname] = useState([]);
  const [resemail, setEmail] = useState([]);
  const [spinner, setSpinner] = useState(true);
  const [resemailverified, setEmailverified] = useState(null)
  const [disabled ] = useState(true);

  useEffect(() => {
    if (user) {
      const userInformation = db
        .collection("drive")
        .doc(user.uid)
        .onSnapshot((doc) => {
          setFullname(doc.data().name);
          setEmail(doc.data().email);
          setTimeout(() => setSpinner(false));
          setEmailverified(user.emailVerified);
        });
        return () => {
          userInformation();
        };
    }
    
  }, [user]);

  // Validation Form   
  const { register, errors } = useForm({
    defaultValues: {
      // fullname: "",
      // email: "",
      password1: "",
      password2: "",
    },
  });
  // -----------------------------------------------------------------//
  return (
    <>
      {spinner &&
        <div className="homepage__loading">
          <Loading size={"5rem"} />
        </div>
      }
      {!spinner &&
        <>
          {/* <form id="info-form" class="setting_page_inner"> */}
            <hr />
            <div>
              <h4>ข้อมูลโปรไฟล์</h4>
            </div>

            <div class="inputWithIcon">
              <input
                type="text"
                name="fullname"
                placeholder="Full Name"
                value={resfullname}
                disabled={disabled}
              />
              <i class="fa fa-user fa-lg fa-fw" aria-hidden="true"></i>
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
                disabled={disabled}
              />
              <i class="fa fa-envelope fa-lg fa-fw" aria-hidden="true"></i>
              {resemailverified ? <i className="keep_icon"><img src={shieldcheck}/></i> : ""}
              {errors.email && (
                <p className="alert-error">{errors.email.message}</p>
              )}
            </div>
          {/* </form> */}
        </>
      }
    </>
  );
};

export default Personal_1;
