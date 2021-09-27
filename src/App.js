import "./App.css";
import React, { useEffect, useState } from "react";
import { connect, useSelector } from "react-redux";
import { setUser, setDetail, setAllused } from "./redux/services";

import "bootstrap/dist/css/bootstrap.min.css";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory,
  Redirect,
} from "react-router-dom";

import { auth, db } from "./firebase";

import SideBar from "./components/SideBar";
import SideMenu from "./components/SideMenu";
import SideMenuBar from "./components/SideMenuBar";
import UploadBox from "./components/UploadBox";
import Personal_2 from "./components/Personal_2";

import MyCloud from "./pages/MyCloud";
import Dashboard from "./pages/Dashboard";
import Setting from "./pages/Setting";
import Bin from "./pages/Bin";
import axios from "./axios";
import Share from "./pages/Share";
import SignIn from "./pages/SignIn";
import Signup from "./pages/SignUp";
import Sharing from "./pages/Sharing";
import FullScreenLoading from "./components/FullScreenLoading";

const App = ({ setUser, setDetail, setAllused }) => {
  const startDownload = useSelector((state) => state.service.startDownload);
  const listUpload = useSelector((state) => state.listValue.listUpload);
  const user = useSelector((state) => state.service.user);

  const [loading, setLoading] = useState(true);

  const uploaded = listUpload.filter((upload) => upload.uploaded === false);
  if (startDownload && uploaded.length > 0) {
    window.onbeforeunload = (event) => {
      const e = event || window.event;
      // Cancel the event
      e.preventDefault();
      if (e) {
        e.returnValue = ""; // Legacy method for cross browser support
      }
      return ""; // Legacy method for cross browser support
    };
  } else {
    window.onbeforeunload = function () {
      // blank function do nothing
    };
  }

  useEffect(() => {
    auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        setUser(authUser);
      }
      setLoading(false);
    });

    if (user) {
      const subscriber = db
        .collection("drive")
        .doc(user.uid)
        .onSnapshot((doc) => {
          // console.log("User data: ", doc.data());
          setDetail(doc.data());
        });

      // Stop listening for updates when no longer required
      return () => subscriber();
    }
    // return () => {
    //   isComponentMounted = false;
    // };
  }, [setDetail, setUser, user]);

  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/bin">
            {loading ? (
              <FullScreenLoading />
            ) : (
              <>
                {!user ? (
                  <SignIn />
                ) : (
                  <>
                    <SideBar />
                    <SideMenu />
                    <SideMenuBar />
                    <Bin />
                    <UploadBox />
                  </>
                )}
              </>
            )}
          </Route>

          <Route path="/setting">
            {loading ? (
              <FullScreenLoading />
            ) : (
              <>
                {!user ? (
                  <SignIn />
                ) : (
                  <>
                    <SideBar />
                    <SideMenu />
                    <SideMenuBar />
                    <Setting />
                    <UploadBox />
                  </>
                )}
              </>
            )}
          </Route>
          <Route path="/info">
            {loading ? (
              <FullScreenLoading />
            ) : (
              <>
                {!user ? (
                  <SignIn />
                ) : (
                  <>
                    <SideBar />
                    <SideMenu />
                    <SideMenuBar />
                    <Personal_2 />
                    <UploadBox />
                  </>
                )}
              </>
            )}
          </Route>

          <Route path="/sharing/:path">
            {loading ? (
              <FullScreenLoading />
            ) : (
              <>
                {!user ? (
                  <SignIn />
                ) : (
                  <>
                    <Sharing />
                  </>
                )}
              </>
            )}
          </Route>

          <Route path="/share">
            {loading ? (
              <FullScreenLoading />
            ) : (
              <>
                {!user ? (
                  <SignIn />
                ) : (
                  <>
                    <SideBar />
                    <SideMenu />
                    <SideMenuBar />
                    <Share />
                    <UploadBox />
                  </>
                )}
              </>
            )}
          </Route>

          <Route path="/myCloud/:folderId">
            {loading ? (
              <FullScreenLoading />
            ) : (
              <>
                {!user ? (
                  <SignIn />
                ) : (
                  <>
                    <SideBar />
                    <SideMenu />
                    <SideMenuBar />
                    <MyCloud />
                    <UploadBox />
                  </>
                )}
              </>
            )}
          </Route>

          <Route path="/myCloud">
            {loading ? (
              <FullScreenLoading />
            ) : (
              <>
                {!user ? (
                  <SignIn />
                ) : (
                  <>
                    <SideBar />
                    <SideMenu />
                    <SideMenuBar />
                    <MyCloud />
                    <UploadBox />
                  </>
                )}
              </>
            )}
          </Route>

          <Route path="/dashboard">
            {loading ? (
              <FullScreenLoading />
            ) : (
              <>
                {!user ? (
                  <SignIn />
                ) : (
                  <>
                    <SideBar />
                    <SideMenu />
                    <SideMenuBar />
                    <Dashboard />
                    <UploadBox />
                  </>
                )}
              </>
            )}
          </Route>
          <Route path="/signup">
            <Signup />
          </Route>
          <Route path="/">
            <SignIn />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

/* const mapStateToProps = (state) => {
  return {
    user: state.service.user,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setDetail: (data) => dispatch(setDetail(data)),
    setUser: (data) => dispatch(setUser(data)),
    setAllused: (data) => dispatch(setAllused(data)),
  };
}; */

export default connect(null, { setDetail, setUser, setAllused })(App);
