const express = require("express");
const admin = require("firebase-admin");
const { client } = require("../AlibabaOss");
const router = express.Router();

const { db, dbFile, dbShare, logFile } = require("../firebase");

router.post("/", async (req, res) => {
  try {
    let { uid } = req.body;
    let data = await db
      .collection("drive")
      .doc(uid)
      .collection("share")
      .get()
      .then((snap) => {
        let list = [];
        snap.forEach((doc) => {
          list.push(doc.data());
        });
        return list;
      });
    res.send(data);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

router.post("/download", async (req, res) => {
  try {
    let { name, type, owner, parentId, fileId, username, uid } = req.body;

    let response = {
      "content-disposition": `attachment; filename=${encodeURIComponent(
        name + type
      )}`,
    };

    let pathOss = owner + "/" + parentId + "/" + fileId + type;
    let url = await client.signatureUrl(pathOss, {
      response,
    });

    let file = {
      name: name,
      type: type,
      currentId: fileId,
      owner: owner,
    };
    logFile(uid, username, file, "download");
    res.send(url);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

router.post("/add", async (req, res) => {
  try {
    let { email, file, username, uid } = req.body;

    let shareFile;

    let sharing = await db
      .collection("drive")
      .where("email", "==", email)
      .get();

    if (sharing.empty) {
      throw new Error("ไม่เจออีเมลนี้");
    }

    sharing.forEach((doc) => {
      shareFile = { ...doc.data(), docId: doc.id };
    });

    let check = await dbFile(file.owner)
      .where("currentId", "==", file.currentId)
      .get()
      .then((snap) => {
        let data;
        snap.forEach((doc) => {
          data = doc.data().share;
        });
        return data;
      });

    // let shared = await check.forEach((doc) => {
    //   return doc.data().share;
    // });
    let findEmail = await check.find((item) => item.email === email);
    // console.log(check);
    // console.log("findEmail", findEmail);

    if (findEmail !== undefined) {
      throw new Error("คุณได้เพิ่มผู้ใช้นี้แล้ว");
    }

    dbShare(shareFile.docId).doc().set({
      owner: file.owner,
      by: username,
      currentId: file.currentId,
      parentId: file.parentId,
      createdAt: file.createdAt,
      size: file.size,
      type: file.type,
      name: file.name,
    });

    let updateShare = await dbFile(file.owner)
      .where("currentId", "==", file.currentId)
      .get();

    updateShare.forEach(async (doc) => {
      doc.ref.update({
        share: admin.firestore.FieldValue.arrayUnion({
          uid: shareFile.docId,
          avatar: shareFile.img_profile,
          email: email,
          name: shareFile.name,
          role: "ผู้ใช้",
        }),
      });
    });

    logFile(uid, username, file, "share");

    res.send({
      avatar: shareFile.img_profile,
      email: email,
      name: shareFile.name,
      role: "ผู้ใช้",
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

module.exports = router;
