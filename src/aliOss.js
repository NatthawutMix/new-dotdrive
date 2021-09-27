import { logFile } from "./firebase";

const OSS = require("ali-oss");

const client = new OSS({
  bucket: "test-newdotdrive",
  region: "oss-ap-southeast-2",
  // bucket: "saimdrive",
  // region: "oss-ap-southeast-5",
  accessKeyId: "LTAI5tGJHkEp24L4RaRHVSPi",
  accessKeySecret: "A6M4u6cJhdx9VsgUJqyh9rdXYfuebB",
});

const downloadFile = async (uid, username, file, currentId) => {
  let response = {
    "content-disposition": `attachment; filename=${encodeURIComponent(
      file.name + file.type
    )}`,
  };

  let pathOss = uid + "/" + file.parentId + "/" + currentId + file.type;

  let url = await client.signatureUrl(pathOss, {
    response,
  });
  console.log("https" + url.substr(4), url);
  // window.open("https" + url.substr(4), "_blank");
  window.open(url);

  logFile(uid, username, file, "download");
};

export { client, downloadFile };
