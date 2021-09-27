const express = require("express");
const router = express.Router();
const {
  dbFolder,
  dbFile,
  updateSize,
  logFile,
  keepLogFile,
} = require("../firebase");

const { client } = require("../AlibabaOss");
const reducer = (accumulator, currentValue) => accumulator + currentValue;

router.post("/", async (req, res) => {
  try {
    let { uid } = req.body;
    let response = [];
    let folders = await dbFolder(uid);
    let files = await dbFile(uid);

    let snapFolder = await folders
      .where("bin", "==", true)
      .get()
      .then((snap) => {
        let list = [];
        snap.forEach((doc) => {
          list.push(doc.data());
        });
        return list;
      })
      .catch((err) => res.status(500).send({ message: err.message }));

    let snapFile = await files
      .where("bin", "==", true)
      .get()
      .then((snap) => {
        let list = [];
        snap.forEach((doc) => {
          list.push(doc.data());
        });
        return list;
      })
      .catch((err) => res.status(500).send({ message: err.message }));

    await Promise.all([snapFolder, snapFile])
      .then(() => {
        snapFolder.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
        snapFile.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
        response = snapFolder.concat(snapFile);
        res.send(response);
      })
      .catch((err) => res.status(500).send({ message: err.message }));
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

router.post("/restore", async (req, res) => {
  try {
    let { uid, type, currentId, username } = req.body;
    if (type === "folder") {
      let folder = await dbFolder(uid);
      let findFolder = await folder
        .where("currentId", "==", currentId)
        .get()
        .then((snap) => {
          snap.forEach((doc) => {
            doc.ref.update({
              bin: false,
              name: doc.data().name + " (recovery)",
            });
          });
        })
        .then(() => {
          logFile(uid, username, req.body, "restore");
          return "Restored";
        })
        .catch((err) => {
          console.log(err);
        });
      res.send(findFolder);
    } else {
      let file = await dbFile(uid);
      let findFile = await file
        .where("currentId", "==", currentId)
        .get()
        .then((snap) => {
          snap.forEach((doc) => {
            doc.ref.update({
              bin: false,
              name: doc.data().name + " (recovery)",
            });
          });
        })
        .then(() => {
          logFile(uid, username, req.body, "restore");
          return "Restored";
        })
        .catch((err) => {
          console.log(err);
        });
      res.send(findFile);
    }
  } catch (e) {
    res.send(e);
  }
});

router.post("/delete", async (req, res) => {
  try {
    let { uid, type, currentId, name, username } = req.body;
    if (type === "folder") {
      let folder = await dbFolder(uid);
      let file = await dbFile(uid);

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

      findFolder.forEach(async (doc) => {
        await logFile(uid, username, doc.data(), "delete");
        // keepLogFile(uid, doc.data().currentId);
        doc.ref.delete();
      });
      findFile.forEach(async (doc) => {
        let size = doc.data().size;
        let from = `${uid}/${doc.data().parentId}/${
          doc.data().currentId
        }${type}`;

        let to = `${uid}/keep/${doc.data().currentId}${type}`;

        client.delete(from);
        /* let oss = await client.copy(to, from).then(() => {
          client.delete(from);
        }); */
        updateSize(uid, size, "minus");
        
        await logFile(uid, username, doc.data(), "delete");
        // keepLogFile(uid, doc.data().currentId);
        doc.ref.delete();
      });

      let response = await folder
        .where("currentId", "==", currentId)
        .get()
        .then((snap) => {
          snap.forEach((doc) => {
            doc.ref.delete();
          });
        })
        .then(async () => {
          await logFile(uid, username, req.body, "delete");
          // keepLogFile(uid, currentId);
          return "Deleted";
        });
      res.send(response);
    } else {
      let file = await dbFile(uid);
      let response = await file
        .where("currentId", "==", currentId)
        .get()
        .then((snap) => {
          snap.forEach(async (doc) => {
            let from = `${uid}/${doc.data().parentId}/${
              doc.data().currentId
            }${type}`;
            let to = `${uid}/keep/${doc.data().currentId}${type}`;
            client.delete(from);
            /* let oss = await client.copy(to, from).then(() => {
              client.delete(from);
            }); */
            let size = doc.data().size;
            updateSize(uid, size, "minus");
            await logFile(uid, username, doc.data(), "delete");
            // keepLogFile(uid, doc.data().currentId);
            doc.ref.delete();
          });
        })
        .then(() => {
          return "Deleted";
        })
        .catch((err) => console.log(err));
      res.send(response);
    }
  } catch (err) {
    res.send(err);
  }
});

router.post("/multiRestore", async (req, res) => {
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
            bin: false,
            name: doc.data().name + " (recovery)",
          });
        });
        logFile(uid, username, file, "remove");
      } else {
        let connectFile = await dbFile(uid);
        let snapshot = await connectFile
          .where("currentId", "==", file.currentId)
          .get();
        await snapshot.forEach((doc) => {
          doc.ref.update({
            bin: false,
            name: doc.data().name + " (recovery)",
          });
        });
        logFile(uid, username, file, "restore");
      }
    });

    await Promise.all(promise)
      .then(() => res.send("Restored"))
      .catch((err) => console.log(err));
  } catch (err) {
    res.send(err);
  }
});

router.post("/multiDelete", async (req, res) => {
  try {
    let { uid, username, data } = req.body;
    let size = [];
    let connectFolder = await dbFolder(uid);
    let connectFile = await dbFile(uid);

    let promise = data.map(async (file) => {
      if (file.type === "folder") {
        let findFolder = await connectFolder
          .where("path", "array-contains", {
            id: file.currentId,
            name: file.name,
          })
          .get();
        let findFile = await connectFile
          .where("path", "array-contains", {
            id: file.currentId,
            name: file.name,
          })
          .get();

        await findFolder.forEach(async (doc) => {
          await logFile(uid, username, doc.data(), "delete");
          // keepLogFile(uid, doc.data().currentId);
          doc.ref.delete();
        });

        await findFile.forEach(async (doc) => {
          size.push(parseInt(doc.data().size));
          // console.log(doc.data().name, size);
          let from = `${uid}/${doc.data().parentId}/${doc.data().currentId}${
            doc.data().type
          }`;
          let to = `${uid}/keep/${doc.data().currentId}${doc.data().type}`;
          client.delete(from);
          /* let oss = await client.copy(to, from).then(() => {
            client.delete(from);
          }); */
          await logFile(uid, username, doc.data(), "delete");
          // keepLogFile(uid, doc.data().currentId);
          doc.ref.delete();
        });

        let snapshot = await connectFolder
          .where("currentId", "==", file.currentId)
          .get();

        await snapshot.forEach((doc) => {
          doc.ref.delete();
        });

        updateSize(uid, size.reduce(reducer), "minus");
        await logFile(uid, username, file, "delete");
        // keepLogFile(uid, file.currentId);
      } else {
        let snapshot = await connectFile
          .where("currentId", "==", file.currentId)
          .get();

        await snapshot.forEach(async (doc) => {
          size.push(parseInt(doc.data().size));
          let from = `${uid}/${doc.data().parentId}/${doc.data().currentId}${
            doc.data().type
          }`;
          let to = `${uid}/keep/${doc.data().currentId}${doc.data().type}`;
          client.delete(from);
          /*  let oss = await client.copy(to, from).then(() => {
            client.delete(from);
          }); */
          await logFile(uid, username, doc.data(), "delete");
          // keepLogFile(uid, doc.data().currentId);
          doc.ref.delete();
        });
      }
    });
    await Promise.all(promise)
      .then(async () => {
        updateSize(uid, size.reduce(reducer), "minus").then(() => {
          res.send({ size: size.reduce(reducer) });
        });
      })
      .catch((err) => console.log(err));
  } catch (err) {
    res.send(err);
  }
});

module.exports = router;
