const express = require("express");
const router = express.Router();

const { db } = require("../firebase");

router.post("/getDatas", async (req, res) => {
  try {
    let { uid } = req.body;
    let response = [];
    let detail = await db
      .collection("drive")
      .doc(uid)
      .get()
      .then((doc) => {
        return doc.data();
      })
      .catch((err) => res.status(500).json({ message: err.message }));

    let recentActivity = await db
      .collection("drive")
      .doc(uid)
      .collection("logs")
      .orderBy("updatedAt", "desc")
      .limit(5)
      .get()
      .then((snap) => {
        let listActivity = [];
        snap.forEach((doc) => {
          listActivity.push(doc.data());
        });
        return listActivity;
      })
      .catch((err) => res.status(500).json({ message: err.message }));

    let recentFile = await db
      .collection("drive")
      .doc(uid)
      .collection("files")
      .orderBy("createdAt", "desc")
      .limit(3)
      .get()
      .then((snap) => {
        let list = [];
        snap.forEach((doc) => {
          list.push(doc.data());
        });
        return list;
      })
      .catch((err) => res.status(500).json({ message: err.message }));

    let countDownload = await db
      .collection("drive")
      .doc(uid)
      .collection("logs")
      .where("topic", "==", "download")
      .get()
      .then((snap) => {
        return snap.size;
      })
      .catch((err) => res.status(500).json({ message: err.message }));

    let countUpload = await db
      .collection("drive")
      .doc(uid)
      .collection("logs")
      .where("topic", "==", "upload")
      .get()
      .then((snap) => {
        snap.forEach((doc) => {});
        return snap.size;
      })
      .catch((err) => console.log(err));

    let countUploadperMonth = await db
      .collection("drive")
      .doc(uid)
      .collection("logs")
      .where("topic", "==", "upload")
      .get()
      .then((snap) => {
        let list = [];
        snap.forEach((doc) => {
           list.push({ updatedAt: (doc.data().updatedAt) });
        });
        return list;
      })
      .catch((err) => console.log(err));

      let countMonnth = await db
      .collection("drive")
      .doc(uid)
      .collection("logs")
      .where("topic", "==", "upload")
      .get()
      .then((snap) => {
        let list = [];
        snap.forEach((doc) => {
          list.push({ updatedAt: doc.data().updatedAt });

        });
        return list;
      })
      .catch((err) => console.log(err));  


    let countDownloadperMonth = await db
      .collection("drive")
      .doc(uid)
      .collection("logs")
      .where("topic", "==", "download")
      .get()
      .then((snap) => {
        let list = [];
        snap.forEach((doc) => {
          list.push({ updatedAt: (doc.data().updatedAt) });
        });
        return list;
      })
      .catch((err) => console.log(err));

    await Promise.all([
      detail,
      recentActivity,
      countUpload,
      countDownload,
      countUploadperMonth,
      countDownloadperMonth,
      countMonnth
    ])
      .then(() => {
        response = {
          detail: detail,
          recentActivity: recentActivity,
          recentFile: recentFile,
          countDownload: countDownload,
          countUpload: countUpload,
          countUploadperMonth: countUploadperMonth,
          countDownloadperMonth: countDownloadperMonth,
          countMonnth
        };
        res.send(response);
      })
      .catch((err) => res.send(err));
  } catch (err) {
    res.send(err);
  }
});

module.exports = router;
