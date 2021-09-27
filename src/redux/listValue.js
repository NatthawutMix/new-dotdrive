export const SET_LISTDOWNLOAD = "listValue/SET_LISTDOWNLOAD";
export const REMOVE_LISTDOWNLOAD = "listValue/REMOVE_LISTDOWNLOAD";
export const REMOVE_LISTDOWNLOAD_ALL = "listValue/REMOVE_LISTDOWNLOAD_ALL";
export const SET_ONEDOWNLOAD = "listValue/SET_ONEDOWNLOAD";

export const SET_LISTUPLOAD = "listValue/SET_LISTUPLOAD";
export const SET_UPLOADED = "listValue/SET_UPLOADED";
export const REMOVE_LISTUPLOAD = "listValue/REMOVE_LISTUPLOAD";
export const REMOVE_LISTUPLOAD_ALL = "listValue/REMOVE_LISTUPLOAD_ALL";

export const SET_MYFILES = "listValue/SET_MYFILES";
export const ADD_MYFILES = "listValue/ADD_MYFILES";
export const REMOVE_MYFILE = "listValue/REMOVE_MYFILE";
export const UPDATE_MYFILE = "listValue/UPDATE_MYFILE";

export const SET_MYFOLDERS = "listValue/SET_MYFOLDERS";
export const ADD_MYFOLDERS = "listValue/ADD_MYFOLDERS";
export const REMOVE_MYFOLDERS = "listValue/REMOVE_MYFOLDERS";

export const SET_MYBIN = "listValue/SET_MYBIN";
export const REMOVE_MYBIN = "listValue/REMOVE_MYBIN";
export const SET_MYBINFOLDER = "listValue/SET_MYBINFOLDER";
export const REMOVE_MYBINFOLDER = "listValue/REMOVE_MYBINFOLDER";

export const SHARE_FILE = "listValue/SHARE_FILE";
export const SET_DUPLICATEFILES = "listValue/SET_DUPLICATEFILES";
export const CHANGE_DUPLICATEFILES = "listValue/CHANGE_DUPLICATEFILES";
export const REMOVE_DUPLICATEFILES = "listValue/REMOVE_DUPLICATEFILES";
export const DELETE_DUPLICATEFILES = "listValue/DELETE_DUPLICATEFILES";

export const RESTORE_DUPLICATEFILES = "listValue/RESTORE_DUPLICATEFILES";
export const RR_DUPLICATEFILES = "listValue/RR_DUPLICATEFILES";
export const REMOVERESTORE_DUPLICATEFILES =
  "listValue/REMOVERESTORE_DUPLICATEFILES";

export const PARENT_RESTORE = "listValue/PARENT_RESTORE";
export const PARENTREMOVE_RESTORE = "listValue/PARENTREMOVE_RESTORE";

export const LOGOUT = "services/LOGOUT";

const INITIAL_STATE = {
  myFiles: [],
  myFolders: [],
  myBin: [],
  myBinFolder: [],
  duplicateFiles: [],
  restoreDup: [],
  listDownload: [],
  listUpload: [],
  parentRestore: [],
};

const listValue = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    //กำหนดลิสไฟล์ใหม่
    case "SET_MYFILES":
      return {
        ...state,
        myFiles: action.data,
      };
    //เพิ่มไฟล์
    case "ADD_MYFILES":
      return {
        ...state,
        myFiles: [...state.myFiles, action.data],
      };
    //ลบไฟล์
    case "REMOVE_MYFILE":
      let newFiles = [...state.myFiles]; //กำหนดลิสไฟล์ใหม่
      //หาไฟล์ที่ต้องการลบ
      let indexFile = state.myFiles.findIndex(
        (item) => item.currentId === action.data.currentId
      );
      //ลบไฟล์
      if (indexFile >= 0) {
        newFiles.splice(indexFile, 1);
      }
      //กำหนดลิสไฟล์ใหม่
      return {
        ...state,
        myFiles: newFiles,
      };
    //อัพเดทขนาดไฟล์
    case "UPDATE_MYFILE":
      //หาไฟล์ที่ต้องการอัพเดท แทนที่ขนาดด้วยขนาดใหม่
      return {
        ...state,
        myFiles: state.myFiles.map((file) =>
          file.currentId === action.data.currentId
            ? { ...file, size: action.data.size }
            : file
        ),
      };
    //กำหนดลิสไฟล์ที่ซ้ำ
    case "SET_DUPLICATEFILES":
      return {
        ...state,
        duplicateFiles: [...state.duplicateFiles, action.data],
      };
    //ลบไฟล์ชื่อซ้ำออกจากลิสไฟล์ซ้ำ
    case "CHANGE_DUPLICATEFILES":
      let newDuplicateFiles = [...state.duplicateFiles]; //กำหนดลิสไฟล์ที่ซ้ำ
      //หาไฟล์ที่ต้องการลบ
      let indexDuplicate = state.duplicateFiles.findIndex(
        (item) =>
          item.name === action.data.name && item.type === action.data.type
      );
      //ลบไฟล์
      if (indexDuplicate >= 0) {
        newDuplicateFiles.splice(indexDuplicate, 1);
      }
      //กำหนดลิสไฟล์ที่ซ้ำ
      return {
        ...state,
        duplicateFiles: [...newDuplicateFiles, action.data],
      };
    //ลบไฟล์ซ้ำออกจากลิสไฟล์ซ้ำ
    case "REMOVE_DUPLICATEFILES":
      let newDF = [...state.duplicateFiles]; //กำหนดลิสไฟล์ที่ซ้ำ
      //หาไฟล์ที่ต้องการลบ
      let indexDF = state.duplicateFiles.findIndex(
        (item) => item.currentId === action.data.currentId
      );
      //ลบไฟล์
      if (indexDF >= 0) {
        newDF.splice(indexDF, 1);
      }
      //กำหนดลิสไฟล์ที่ซ้ำ
      return {
        ...state,
        duplicateFiles: newDF,
      };
    //ลบข้อมูลออกจากลิสไฟล์ซ้ำทั้งหมด
    case "DELETE_DUPLICATEFILES":
      return {
        ...state,
        duplicateFiles: [],
      };
    //กำหนดลิสโฟล์เดอร์
    case "SET_MYFOLDERS":
      return {
        ...state,
        myFolders: action.data,
      };
    //เพิ่มโฟล์เดอร์
    case "ADD_MYFOLDERS":
      return {
        ...state,
        myFolders: [...state.myFolders, action.data],
      };
    //ลบโฟล์เดอร์
    case "REMOVE_MYFOLDER":
      let newFolders = [...state.myFolders]; //กำหนดโฟล์เดอร์
      //หาโฟล์เดอร์ที่ต้องการลบ
      let indexFolder = state.myFolders.findIndex(
        (item) => item.currentId === action.data.currentId
      );
      //ลบโฟล์เดอร์
      if (indexFolder >= 0) {
        newFolders.splice(indexFolder, 1);
      }
      //กำหนดโฟล์เดอร์
      return {
        ...state,
        myFolders: newFolders,
      };
    //กำหนดไฟล์ถังขยะ
    case "SET_MYBIN":
      return {
        ...state,
        myBin: action.data,
      };
    //กำหนดโฟล์เดอร์ถังขยะ
    case "SET_MYBINFOLDER":
      return {
        ...state,
        myBinFolder: action.data,
      };
    //ลบไฟล์ถังขยะ
    case "REMOVE_MYBIN":
      let newBin = [...state.myBin]; //กำหนดไฟล์ถังขยะ
      //หาไฟล์
      let indexFileBin = state.myBin.findIndex(
        (item) => item.currentId === action.data.currentId
      );
      //ลบไฟล์
      if (indexFileBin >= 0) {
        newBin.splice(indexFileBin, 1);
      }
      //กำหนดไฟล์ถังขยะ
      return {
        ...state,
        myBin: newBin,
      };
    //ลบโฟล์เดอร์ถังขยะ
    case "REMOVE_MYBINFOLDER":
      let newBinFolder = [...state.myBin]; //กำหนดโฟล์เดอร์ฺถังขยะ
      //หาโฟล์เดอร์
      let indexFileBinFolder = state.myBin.findIndex(
        (item) => item.currentId === action.data.currentId
      );
      //ลบโฟล์เดอร์
      if (indexFileBinFolder >= 0) {
        newBinFolder.splice(indexFileBin, 1);
      }
      //กำหนดโฟล์เดอร์ฺถังขยะ
      return {
        ...state,
        myBin: newBinFolder,
      };
    //กำหนดลิสดาวน์โหลด
    case "SET_LISTDOWNLOAD":
      //เช็คว่าเพิ่มซ้ำไหม
      let findListDownload = state.listDownload.find(
        (item) => item.currentId === action.data.currentId
      );
      if (!findListDownload) {
        //กำหนดลิสดาวน์โหลดใหม่
        return {
          ...state,
          listDownload: [...state.listDownload, action.data],
        };
      } else {
        //กำหนดลิสดาวน์โหลดเดิม
        return state;
      }
    //ลบไฟล์ในลิสดาวน์โหลด
    case "REMOVE_LISTDOWNLOAD":
      let newListDownload = [...state.listDownload]; //กำหนดลิสดาวน์โหลด
      //หาไฟล์
      let index = state.listDownload.findIndex(
        (listDownloadItem) =>
          listDownloadItem.currentId === action.data.currentId
      );
      //ลบไฟล์
      if (index >= 0) {
        newListDownload.splice(index, 1);
      }
      //กำหนดลิสดาวน์โหลด
      return {
        ...state,
        listDownload: newListDownload,
      };
    //ลบลิสดาวน์โหลด
    case "REMOVE_LISTDOWNLOAD_ALL":
      return {
        ...state,
        listDownload: action.data,
      };
    //กำหนดลิสอัพโหลด
    case "SET_LISTUPLOAD":
      return {
        ...state,
        listUpload: [...state.listUpload, action.data],
      };
    //กำหนดลิสดาวน์โหลดไฟล์เดียว
    case "SET_ONEDOWNLOAD":
      return {
        ...state,
        listDownload: [action.data],
      };
    //กำหนดสถานะไฟล์อัพโหลดเสร็จสิ้น
    case "SET_UPLOADED":
      return {
        ...state,
        listUpload: state.listUpload.map((file) =>
          file.id === action.data ? { ...file, uploaded: true } : file
        ),
      };
    //ลบไฟล์ที่ทำการอัพโหลด
    case "REMOVE_LISTUPLOAD":
      let newListUpload = [...state.listUpload]; //กำหนดลิสอัพโหลด
      //หาไฟล์
      let indexFileUpload = state.listUpload.findIndex(
        (listUploadItem) => listUploadItem.id === action.data
      );
      //ลบไฟล์
      if (indexFileUpload >= 0) {
        newListUpload.splice(indexFileUpload, 1);
      }
      //กำหนดลิสอัพโหลด
      return {
        ...state,
        listUpload: newListUpload,
      };
    //ลบลิสอัพโหลด
    case "REMOVE_LISTUPLOAD_ALL":
      return {
        ...state,
        listUpload: action.data,
      };
    //แชร์ไฟล์
    case "SHARE_FILE":
      let addShare = action.data; //ข้อมูลผู้รับการแชร์
      delete addShare["currentId"]; //ลบผู้ใช้ไอดี
      //เพิ่มข้อมูลผู้รับการแชร์ให้กับผู้แชรฺ์
      return {
        ...state,
        myFiles: state.myFiles.map((item) =>
          item.currentId === action.data.id
            ? {
                ...item,
                share: [...item.share, addShare],
              }
            : item
        ),
      };
    //ลบไฟล์ซ้ำในลิสรีสโตร์
    case "RESTORE_DUPLICATEFILES":
      let newData = [...state.restoreDup]; //กำหนดลิสรีสโตร์ไฟล์ซ้ำ
      //หาไฟล์
      let FSR = state.restoreDup.findIndex(
        (item) => item.cloud.currentId === action.data.cloud.currentId
      );
      //ลบไฟล์
      if (FSR >= 0) {
        newData.splice(FSR, 1);
      }
      //กำหนดลิสรีสโตร์
      newData = [...newData, action.data];
      return {
        ...state,
        restoreDup: newData,
      };
    //ลบไฟล์ที่ทำการรีสโตร์เสร็จสิ้น
    case "RR_DUPLICATEFILES":
      let newRestore = [...state.restoreDup]; //กำหนดลิสรีสโตร์ไฟล์ซ้ำ
      //หาไฟล์
      let indexRestore = state.restoreDup.findIndex(
        (item) => item.cloud.currentId === action.data.cloud.currentId
      );
      //ลบไฟล์
      if (indexRestore >= 0) {
        newRestore.splice(indexRestore, 1);
      }
      //กำหนดลิสรีสโตร์
      return {
        ...state,
        restoreDup: newRestore,
      };
    //ลบลิสรีโตร์
    case "REMOVERESTORE_DUPLICATEFILES":
      return {
        ...state,
        restoreDup: [],
      };
    case "PARENT_RESTORE":
      return {
        ...state,
        parentRestore: [...state.parentRestore, action.data],
      };

    case "PARENTREMOVE_RESTORE":
      return {
        ...state,
        parentRestore: [],
      };

    case "LOGOUT":
      return INITIAL_STATE;
    default:
      return state;
  }
};

//เรียกใช้ฟังก์ชันข้างบน
export const setMyFiles = (data) => {
  return (dispatch) =>
    dispatch({
      type: "SET_MYFILES",
      data,
    });
};

export const addMyFiles = (data) => {
  return (dispatch) =>
    dispatch({
      type: "ADD_MYFILES",
      data,
    });
};

export const removeFile = (data) => {
  return (dispatch) =>
    dispatch({
      type: "REMOVE_MYFILE",
      data,
    });
};

export const updateMyFile = (data) => {
  return (dispatch) =>
    dispatch({
      type: "UPDATE_MYFILE",
      data,
    });
};

export const setDuplicateList = (data) => {
  return (dispatch) =>
    dispatch({
      type: "SET_DUPLICATEFILES",
      data,
    });
};

export const deleteDuplicateList = () => {
  return (dispatch) =>
    dispatch({
      type: "DELETE_DUPLICATEFILES",
    });
};

export const removeDuplicateList = (data) => {
  return (dispatch) =>
    dispatch({
      type: "REMOVE_DUPLICATEFILES",
      data,
    });
};
export const changeDuplicateList = (data) => {
  return (dispatch) =>
    dispatch({
      type: "CHANGE_DUPLICATEFILES",
      data,
    });
};

export const setMyFolders = (data) => {
  return (dispatch) =>
    dispatch({
      type: "SET_MYFOLDERS",
      data,
    });
};

export const addMyFolders = (data) => {
  return (dispatch) =>
    dispatch({
      type: "ADD_MYFOLDERS",
      data,
    });
};

export const removeFolder = (data) => {
  return (dispatch) =>
    dispatch({
      type: "REMOVE_MYFOLDER",
      data,
    });
};

export const setMyBin = (data) => {
  return (dispatch) =>
    dispatch({
      type: "SET_MYBIN",
      data,
    });
};

export const setMyBinFolder = (data) => {
  return (dispatch) =>
    dispatch({
      type: "SET_MYBINFOLDER",
      data,
    });
};

export const removeFileBin = (data) => {
  return (dispatch) =>
    dispatch({
      type: "REMOVE_MYBIN",
      data,
    });
};

export const removeFileBinFolder = (data) => {
  return (dispatch) =>
    dispatch({
      type: "REMOVE_MYBINFOLDER",
      data,
    });
};

export const setListDownload = (data) => {
  return (dispatch) =>
    dispatch({
      type: "SET_LISTDOWNLOAD",
      data,
    });
};

export const removeListDownload = (data) => {
  return (dispatch) =>
    dispatch({
      type: "REMOVE_LISTDOWNLOAD",
      data,
    });
};

export const removeListDownloadAll = (data) => {
  return (dispatch) =>
    dispatch({
      type: "REMOVE_LISTDOWNLOAD_ALL",
      data,
    });
};

export const setListUpload = (data) => {
  return (dispatch) =>
    dispatch({
      type: "SET_LISTUPLOAD",
      data,
    });
};

export const setOneUpload = (data) => {
  return (dispatch) =>
    dispatch({
      type: "SET_ONEDOWNLOAD",
      data,
    });
};

export const setUploaded = (data) => {
  return (dispatch) =>
    dispatch({
      type: "SET_UPLOADED",
      data,
    });
};

export const setRemoveListUpload = (data) => {
  return (dispatch) =>
    dispatch({
      type: "REMOVE_LISTUPLOAD",
      data,
    });
};

export const removeAll = (data) => {
  return (dispatch) =>
    dispatch({
      type: "REMOVE_LISTUPLOAD_ALL",
      data,
    });
};

export const shareFile = (data) => {
  return (dispatch) =>
    dispatch({
      type: "SHARE_FILE",
      data,
    });
};

export const setDupliRestore = (data) => {
  return (dispatch) =>
    dispatch({
      type: "RESTORE_DUPLICATEFILES",
      data,
    });
};

export const setRestoreRemove = () => {
  return (dispatch) =>
    dispatch({
      type: "REMOVERESTORE_DUPLICATEFILES",
    });
};

export const removeRR = (data) => {
  return (dispatch) =>
    dispatch({
      type: "RR_DUPLICATEFILES",
      data,
    });
};

export const setParentRestore = (data) => {
  return (dispatch) =>
    dispatch({
      type: "PARENT_RESTORE",
      data,
    });
};

export const parentRestoreRemove = () => {
  return (dispatch) =>
    dispatch({
      type: "PARENTREMOVE_RESTORE",
    });
};

export const resetStore = () => {
  return (dispatch) =>
    dispatch({
      type: "LOGOUT",
    });
};

export default listValue;
