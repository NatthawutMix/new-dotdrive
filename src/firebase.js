import firebase from "firebase";
import "firebase/storage";

// var firebaseConfig = {
//   apiKey: "AIzaSyCB-wz792pt56YCUhRg5oXq9gBvin2BNsw",
//   authDomain: "dotdrive-72206.firebaseapp.com",
//   projectId: "dotdrive-72206",
//   storageBucket: "dotdrive-72206.appspot.com",
//   messagingSenderId: "658480348561",
//   appId: "1:658480348561:web:1e6c62a8b0c7bb9e90ee30",
//   measurementId: "G-C0VSR4Q8CZ",
// };

// test
const firebaseConfig = {
  apiKey: "AIzaSyBtjgAnbn92oBexnyBIqahLj2fT-xgdxAk",
  authDomain: "test-dotdrive-3aa0c.firebaseapp.com",
  projectId: "test-dotdrive-3aa0c",
  storageBucket: "test-dotdrive-3aa0c.appspot.com",
  messagingSenderId: "230613861187",
  appId: "1:230613861187:web:49226d316907704bd725f6",
  measurementId: "G-RW8HTFLV9X",
};

const firebaseApp = firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();
const db = firebaseApp.firestore();

//เชื่อมต่อโฟล์เดอร์
const dbFolder = (uid) => {
  return db.collection("drive").doc(uid).collection("folders");
};
//เชื่อมต่อไฟล์
const dbFile = (uid) => {
  return db.collection("drive").doc(uid).collection("files");
};
//เชื่อมต่อแชร์ไฟล์
const dbShare = (uid) => {
  return db.collection("drive").doc(uid).collection("share");
};

//อัพเดทพื้นที่ทั้งหมด
const updateSize = async (uid, size, topic) => {
  if (topic === "plus") {
    let washingtonRef = db.collection("drive").doc(uid);
    washingtonRef.update({
      used: firebase.firestore.FieldValue.increment(size),
    });
  } else {
    let washingtonRef = db.collection("drive").doc(uid);
    washingtonRef.update({
      used: firebase.firestore.FieldValue.increment(-size),
    });
  }
};
//เพิ่ม log การใช้งาน
const logFile = (uid, username, data, topic) => {
  db.collection("drive")
    .doc(uid)
    .collection("logs")
    .doc()
    .set({
      currentId: data.currentId,
      topic: topic,
      data: data,
      by: { uid: uid, name: username },
      updatedAt: Date.now(),
    });
};

const google = new firebase.auth.GoogleAuthProvider();
const facebook = new firebase.auth.FacebookAuthProvider();
const auth = firebaseApp.auth();

export {
  db,
  dbFile,
  dbFolder,
  dbShare,
  updateSize,
  logFile,
  google,
  facebook,
  auth,
  firebaseApp,
  firebase,
  storage,
};
