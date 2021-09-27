const express = require("express");
const fileUpload = require("express-fileupload");
const app = express();

const port = process.env.PORT || 8001;
const morgan = require("morgan");
const cors = require("cors");

const usersRoute = require("./routes/users");
const myCloudRoute = require("./routes/myCloud");
const recycleBinRoute = require("./routes/recycleBin");
const dashboardRoute = require("./routes/dashboard");
const shareRoute = require("./routes/share");

app.use(fileUpload());
app.use(express.json({ limit: "5gb" }));
app.use(express.urlencoded({ limit: "5gb", extended: false }));
app.use(cors());
app.use(morgan("dev"));

app.use((req, res, next) => {
  const ALLOW_ORIGIN = [
    "http://localhost:3000",
    "https://dotdrive-72206.web.app",
    "https://dotdrive.siammodintech.fund",
  ];
  const ORIGIN = req.headers.origin;

  if (ALLOW_ORIGIN.includes(ORIGIN)) {
    res.header("Access-Control-Allow-Origin", ORIGIN);
  }
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin,X-Requested-With,Content-Type,Accept,content-type,application/json"
  );
  next();
});

app.get("/", (req, res) => res.status(200).send("Connect!"));

app.use("/users", usersRoute);
app.use("/myCloud", myCloudRoute);
app.use("/recycleBin", recycleBinRoute);
app.use("/dashboard", dashboardRoute);
app.use("/share", shareRoute);

app.listen(port, () => console.log(`connent: ${port}`));
