const express = require("express");
const router = express.Router();

const { db, st } = require("../firebase");

router.post("/regisApp", async (req, res) => {
  try {
    let { uid, fname, img, email } = req.body;
    let connect = await db.collection("drive").doc(uid);
    // let stconnect = await st.collection("profileimage").doc(uid);

    connect
      .get()
      .then(async (doc) => {
        if (doc.exists) {
          db.collection("drive")
            .doc(uid)
            .get()
            .then((doc) => {
              return res.send(doc.data());
            })
            .catch((err) => res.status(500).send({ message: err.message }));
        } else {
          let data = {
            max: 2147483648,
            used: 0,
            name: fname,
            img_profile: img,
            createdAt: Date.now(),
            email: email,
          };
          await db
            .collection(`drive`)
            .doc(uid)
            .set(data)
            .then(() => {
              res.send(data);
            })
            .catch((err) => {
              res.status(500).send({ message: err.message });
            });
        }
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

router.post("/register", async (req, res) => {
  try {
    let { uid, fname, email, img } = req.body;

    let data = {
      max: 2147483648,
      used: 0,
      name: fname,
      img_profile: img,
      createdAt: Date.now(),
      email: email,
    };

    await db
      .collection(`drive`)
      .doc(uid)
      .set(data)  
      .then(() => {
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

router.post("/detail", async (req, res) => {
  try {
    let { uid } = req.body;
    await db
      .doc(`drive/${uid}`)
      .get()
      .then((doc) => {
        return res.send(doc.data());
      })
      .catch((err) => res.status(500).send({ message: err.message }));
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

router.post("/edit", async (req, res) => {
  try {
    let { uid, email, name} = req.body;

    let data = {
      email: email,
      name: name,
    };
    // console.log(data);
    await db
      .doc(`drive/${uid}`)
      .update(data)
      .then(() => {
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

router.post("/edit_img", async (req, res) => {
  try {
    let { uid, img_file } = req.body;

    let data = {
      img_profile: img_file,
    };
    // console.log(data);
    await db
      .doc(`drive/${uid}`)
      .update(data)
      .then(() => {
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

module.exports = router;


// max: drivelimit
