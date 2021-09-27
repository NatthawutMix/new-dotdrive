const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");

const { v4: uuidv4 } = require("uuid");

const { db, dbFolder, dbFile, updateSize, logFile } = require("../firebase");
const { client } = require("../AlibabaOss");

router.post("/", async (req, res) => {
  try {
    let { uid, parentId } = req.body;
    let drive = dbFolder(uid);
    let driveFile = dbFile(uid);

    let newPath;

    if (uid !== parentId) {
      let path = await dbFolder(uid)
        .where("currentId", "==", parentId)
        .get()
        .then((snap) => {
          let data;
          snap.forEach((doc) => {
            data = doc.data();
          });
          return data;
        })
        .catch((err) => res.status(500).send({ message: err.message }));
      newPath = [...path.path, { id: path.currentId, name: path.name }];
    }

    let snapFolder = await drive
      .where("parentId", "==", parentId)
      .where("bin", "==", false)
      .get()
      .then((snap) => {
        let list = [];
        snap.forEach((doc) => {
          list.push(doc.data());
        });
        return list;
      })
      .catch((err) => res.status(500).send({ message: err.message }));

    let snapFile = await driveFile
      .where("parentId", "==", parentId)
      .where("bin", "==", false)
      .get()
      .then((snap) => {
        let list = [];
        snap.forEach(async (doc) => {
          // let result = await client.get(
          //   `${doc.data().owner}/${doc.data().parentId}/${
          //     doc.data().currentId
          //   }${doc.data().type}`
          // );
          list.push({ ...doc.data() });
        });
        return list;
      })
      .catch((err) => res.status(500).send({ message: err.message }));

    await Promise.all([snapFolder, snapFile])
      .then(async () => {
        // console.log(snapFile);
        snapFolder.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
        snapFile.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));

        res.send({ files: snapFile, folders: snapFolder, path: newPath });
      })
      .catch((err) => res.status(500).send({ message: err.message }));
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

router.post(`/NewFolder`, async (req, res) => {
  try {
    let { uid, parentId, name, type, path, username, avatar, email } = req.body;

    let data = {
      currentId: uuidv4(),
      parentId: parentId,
      name: name,
      bin: false,
      type: type,
      path: path,
      owner: uid,
      share: [
        {
          name: username,
          avatar: avatar,
          email: email,
          role: "เจ้าของ",
        },
      ],
      createdAt: Date.now(),
    };

    db.collection("drive")
      .doc(uid)
      .collection("folders")
      .doc()
      .set(data)
      .then(() => {
        logFile(uid, username, data, "created");
        return res.send(data);
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

router.post("/NewFile", async (req, res) => {
  try {
    let {
      uid,
      parentId,
      path,
      username,
      id,
      name,
      size,
      type,
      avatar,
      email,
    } = req.body;

    let fileDb = await dbFile(uid);

    let data = {
      currentId: id,
      parentId: parentId,
      name: name,
      type: type,
      size: size,
      path: JSON.parse(path),
      bin: false,
      owner: uid,
      share: [
        {
          name: username,
          avatar: avatar,
          email: email,
          role: "เจ้าของ",
        },
      ],
      createdAt: Date.now(),
    };

    fileDb
      .doc()
      .set(data)
      .then(() => {
        logFile(uid, username, data, "upload");
        updateSize(uid, size, "plus");
        return res.send(data);
      })
      .catch((err) => res.status(500).send({ message: err.message }));
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

router.post(`/remove`, async (req, res) => {
  try {
    let { uid, type, username, currentId } = req.body;

    if (type === "folder") {
      let folder = await dbFolder(uid);
      let response = await folder
        .where("currentId", "==", currentId)
        .get()
        .then((snap) => {
          snap.forEach((doc) => {
            doc.ref.update({
              bin: true,
            });
          });
        })
        .then(() => {
          logFile(uid, username, req.body, "remove");
          return "removed";
        })
        .catch((err) => res.status(500).send({ message: err.message }));
      res.send(response);
    } else {
      let file = await dbFile(uid);
      let share = [];
      let response = await file
        .where("currentId", "==", currentId)
        .get()
        .then((snap) => {
          snap.forEach((doc) => {
            if (doc.data().share.length > 1) {
              for (let i = 1; i < doc.data().share.length; i++) {
                share.push({
                  uid: doc.data().share[i].uid,
                  currentId: doc.data().currentId,
                });
                doc.ref.update({
                  bin: true,
                  share: admin.firestore.FieldValue.arrayRemove(
                    doc.data().share[i]
                  ),
                });
              }
            } else {
              doc.ref.update({
                bin: true,
              });
            }
          });
        })
        .then(() => {
          logFile(uid, username, req.body, "remove");
          return "removed";
        })
        .catch((err) => res.status(500).send({ message: err.message }));

      share.forEach((item) => {
        db.collection("drive")
          .doc(item.uid)
          .collection("share")
          .where("fileId", "==", item.currentId)
          .get()
          .then((snap) => {
            snap.forEach((doc) => {
              doc.ref.delete();
            });
          });
      });

      res.send(response);
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

router.post("/download", async (req, res) => {
  try {
    let { uid, name, parentId, currentId, username, type } = req.body;

    let response = {
      "content-disposition": `attachment; filename=${encodeURIComponent(
        name + type
      )}`,
    };

    let pathOss = uid + "/" + parentId + "/" + currentId + type;
    let url = await client.signatureUrl(pathOss, {
      response,
    });

    logFile(uid, username, req.body, "download");
    res.send(url);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

router.post("/move", async (req, res) => {
  try {
    let { type, uid, currentId, to, from, newPath, name, username } = req.body;
    let folder = await dbFolder(uid);
    let file = await dbFile(uid);

    let currentPath = [...newPath, { id: currentId, name: name }];

    if (type === "folder") {
      let updateParent = await folder
        .where("currentId", "==", currentId)
        .get()
        .then((snap) => {
          snap.forEach((doc) => {
            doc.ref.update({
              parentId: to,
              path: newPath,
            });
          });
        })
        .then(async () => {
          let findFolder = await folder
            .where("path", "array-contains", {
              id: currentId,
              name: name,
            })
            .get();
          let findFile = await file
            .where("path", "array-contains", {
              id: currentId,
              name: name,
            })
            .get();
          findFolder.forEach((doc) => {
            doc.ref.update({
              path: currentPath,
            });
          });
          findFile.forEach((doc) => {
            doc.ref.update({
              path: currentPath,
            });
          });

          db.collection("drive")
            .doc(uid)
            .collection("logs")
            .doc()
            .set({
              topic: "move",
              data: req.body,
              from: from,
              to: to,
              by: { uid: uid, name: username },
              updatedAt: Date.now(),
            });
          return "Moved";
        })
        .catch((err) => res.status(500).send({ message: err.message }));
      res.send(updateParent);
    } else {
      let fromOss = `${uid}/${from}/${currentId}${type}`;
      let toOss = `${uid}/${to}/${currentId}${type}`;
      let oss = await client
        .copy(toOss, fromOss)
        .then(async () => {
          client.delete(fromOss);
          db.collection("drive")
            .doc(uid)
            .collection("logs")
            .doc()
            .set({
              topic: "move",
              data: req.body,
              from: from,
              to: to,
              by: { uid: uid, name: username },
              updatedAt: Date.now(),
            });
          let updateParent = await file
            .where("currentId", "==", currentId)
            .get()
            .then((snap) => {
              snap.forEach((doc) => {
                doc.ref.update({
                  parentId: to,
                  path: newPath,
                });
              });
            })
            .then(() => {
              return "Moved";
            })
            .catch((err) => res.status(500).send({ message: err.message }));
          return updateParent;
        })
        .catch((err) => res.status(500).send({ message: err.message }));
      res.send(oss);
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

router.post("/multiDownload", async (req, res) => {
  try {
    let { uid, data } = req.body;
    const listUrl = [];
    await data.forEach(async (file, index) => {
      let response = {
        "content-disposition": `attachment; filename=${encodeURIComponent(
          file.fileName
        )}`,
      };
      let pathOss =
        uid +
        "/" +
        file.parentId +
        "/" +
        file.currentId +
        "." +
        file.fileName.split(".").pop();
      let url = await client.signatureUrl(pathOss, {
        response,
      });

      listUrl.push(url);
    });
    res.send(listUrl);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

router.post(`/multiRemove`, async (req, res) => {
  try {
    let { data, uid, username } = req.body;

    let promise = await data.map(async (file) => {
      if (file.type === "folder") {
        let connectFolder = await dbFolder(uid);
        let snapshot = await connectFolder
          .where("currentId", "==", file.currentId)
          .get();
        await snapshot.forEach((doc) => {
          doc.ref.update({
            bin: true,
          });
        });
        logFile(uid, username, file, "remove");
      } else {
        let connectFile = await dbFile(uid);
        let share = [];
        let snapshot = await connectFile
          .where("currentId", "==", file.currentId)
          .get();
        await snapshot.forEach((doc) => {
          if (doc.data().share.length > 1) {
            for (let i = 1; i < doc.data().share.length; i++) {
              share.push({
                uid: doc.data().share[i].uid,
                currentId: doc.data().currentId,
              });
              doc.ref.update({
                bin: true,
                share: admin.firestore.FieldValue.arrayRemove(
                  doc.data().share[i]
                ),
              });
            }
          } else {
            doc.ref.update({
              bin: true,
            });
          }
        });
        logFile(uid, username, file, "remove");
        share.forEach((item) => {
          db.collection("drive")
            .doc(item.uid)
            .collection("share")
            .where("fileId", "==", item.currentId)
            .get()
            .then((snap) => {
              snap.forEach((doc) => {
                doc.ref.delete();
              });
            });
        });
      }
    });
    await Promise.all(promise)
      .then(() => res.send("Removed"))
      .catch((err) => res.status(500).send({ message: err.message }));
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

router.post("/replace", async (req, res) => {
  try {
    let { uid, size, username, currentId, newSize } = req.body;

    let fileDb = await dbFile(uid);
    let response = await fileDb
      .where("currentId", "==", currentId)
      .get()
      .then((snap) =>
        snap.forEach((doc) => {
          logFile(uid, username, { ...doc.data(), size: size }, "replace");
          doc.ref.update({ size: size });
        })
      );
    updateSize(uid, newSize, "plus");
    res.send(response);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

module.exports = router;