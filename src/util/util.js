import logoCSV from "../images/type/csv.svg";
import logoDOC from "../images/type/doc.svg";
import logoEPS from "../images/type/eps.svg";
import logoGIF from "../images/type/gif.svg";
import logoJPG from "../images/type/jpg.svg";
import logoMOV from "../images/type/mov.svg";
import logoMP3 from "../images/type/mp3.svg";
import logoMP4 from "../images/type/mp4.svg";
import logoPDF from "../images/type/pdf.svg";
import logoPNG from "../images/type/png.svg";
import logoPPT from "../images/type/ppt.svg";
import logoSVG from "../images/type/svg.svg";
import logoXLS from "../images/type/xls.svg";
import logoEmptry from "../images/type/emptry.svg";

//เช็คชนิดไฟล์ และส่งรูปภาพกลับ
export const typeFile = (type) => {
  if (type === ".doc" || type === ".docs") {
    return logoDOC;
  } else if (type === ".csv") {
    return logoCSV;
  } else if (type === ".eps") {
    return logoEPS;
  } else if (type === ".gif") {
    return logoGIF;
  } else if (type === ".jpg") {
    return logoJPG;
  } else if (type === ".png") {
    return logoPNG;
  } else if (type === ".mov") {
    return logoMOV;
  } else if (type === ".mp3") {
    return logoMP3;
  } else if (type === ".mp4") {
    return logoMP4;
  } else if (type === ".pdf") {
    return logoPDF;
  } else if (type === ".ppt") {
    return logoPPT;
  } else if (type === ".svg") {
    return logoSVG;
  } else if (type === ".xls") {
    return logoXLS;
  } else {
    return logoEmptry;
  }
};

//คำนวณ Byte ()
export const getReadableFileSizeString = (fileSizeInBytes) => {
  let i = -1;
  const byteUnits = [" kB", " MB", " GB", " TB", "PB", "EB", "ZB", "YB"];
  if (fileSizeInBytes === 0) {
    return "0.00" + byteUnits[0];
  }
  if (fileSizeInBytes === 0) {
    return "0.00" + byteUnits[0];
  }
  do {
    fileSizeInBytes = fileSizeInBytes / 1024;
    i++;
  } while (fileSizeInBytes > 1024);

  return Math.max(fileSizeInBytes, 0.1).toFixed(2) + byteUnits[i];
};

export const getFileSizeMax = (max, used) => {
  if (used === 0) {
    return 0;
  }
  let res = (used / max) * 100;
  return res;
};

export const getTimeStamp = (data) => {
  let time = new Date(data).toString().split(" ").slice(1, 4).join(" ");
  return time;
};

export const countSize = (sizes) => {
  let total = 0;
  sizes.forEach((item) => {
    total += item;
  });
  return total;
};

export const toBase64 = (arr) => {
  return btoa(arr.reduce((data, byte) => data + String.fromCharCode(byte), ""));
};
