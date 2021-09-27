export const SET_USER = "services/SET_USER";
export const SET_DETAIL = "services/SET_DETAIL";
export const SET_ONLOAD = "services/SET_ONLOAD";
export const SET_LOADBIN = "services/SET_LOADBIN";
export const SET_ISLOADING = "services/SET_ISLOADING";
export const SET_SIDEBARCSS = "services/SET_SIDEBARCSS";
export const SET_OPENSIDEBAR = "services/SET_OPENSIDEBAR";
export const SET_STARTDOWLOAD = "services/SET_STARTDOWLOAD";
export const SET_HIDELIST = "services/SET_HIDELIST";
export const SET_PARENTID = "services/SET_PARENTID";
export const SET_PATH = "services/SET_PATH";
export const SET_BACK_PATH = "services/SET_BACK_PATH";
export const SET_ALLUSED = "services/SET_BACK_PATH";
export const RESERVATION_SIZE = "services/RESERVATION_SIZE";
export const Exit = "services/Exit";

export const LOGOUT = "services/LOGOUT";

const INITIAL_STATE = {
  user: null,
  detail: null,
  onload: false,
  loadBin: false,
  isLoading: true,
  sideBarCss: false,
  openSideBar: false,
  startDownload: false,
  hideList: true,
  parentId: "",
  currentId: "",
  path: [],
  exitUpload: false,
  sizeUsed: [],
  reserSize: [],
};

const services = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    //กำหนดข้อมูลผู้ใช้ Firebase Auth
    case "SET_USER":
      return {
        ...state,
        user: action.data,
      };

    //กำหนดข้อมูลผู้ใช้
    case "SET_DETAIL":
      return {
        ...state,
        detail: action.data,
      };

    //กำหนดสถานะโหลดข้อมูล
    case "SET_ONLOAD":
      return {
        ...state,
        onload: action.data,
      };
    //กำหนดสถานะโหลดข้อมูล
    case "SET_LOADBIN":
      return {
        ...state,
        loadBin: action.data,
      };
    //กำหนดสถานะโหลดข้อมูล
    case "SET_ISLOADING":
      return {
        ...state,
        isLoading: action.data,
      };
    //กำหนดสถานะโมบายหรือเดสท็อป
    case "SET_SIDEBARCSS":
      return {
        ...state,
        sideBarCss: action.data,
      };
    //กำหนดสถานะเปิดเมนูข้าง
    case "SET_OPENSIDEBAR":
      return {
        ...state,
        openSideBar: action.data,
      };
    //กำหนดสถานะเริ่มดาวน์โหลด
    case "SET_STARTDOWLOAD":
      return {
        ...state,
        startDownload: action.data,
      };
    //กำหนดสถานะลิสอัพโหลด
    case "SET_HIDELIST":
      return {
        ...state,
        hideList: action.data,
      };
    //กำหนดโฟล์เดอร์ของไฟล์
    case "SET_PARENTID":
      return {
        ...state,
        parentId: action.data,
      };
    //เพิ่มเส้นทางโฟล์เดอร์
    case "SET_PATH":
      return {
        ...state,
        path: [...state.path, action.data],
      };
    //กำหนดเส้นทางโฟล์เดอร์
    case "SET_BACK_PATH":
      return {
        ...state,
        path: action.data,
      };
    //กำหนดปิดลิสอัพโหลด
    case "EXIT":
      return {
        ...state,
        exitUpload: action.data,
      };
    //กำหนดขนาดทั้งหมด
    case "SET_ALLUSED":
      if (action.data === null) {
        return state;
      }
      return {
        ...state,
        sizeUsed: [...state.sizeUsed, action.data],
      };
    //เพิ่มขนาดที่จอง
    case "RESERVATION_SIZE":
      return {
        ...state,
        reserSize: [...state.reserSize, action.data],
      };
    //เคลียร์
    case "LOGOUT":
      return INITIAL_STATE;
    default:
      return state;
  }
};
//เรียกใช้ฟังก์ชันข้างบน
export const setUser = (data) => {
  return (dispatch) =>
    dispatch({
      type: "SET_USER",
      data,
    });
};

export const setDetail = (data) => {
  return (dispatch) =>
    dispatch({
      type: "SET_DETAIL",
      data,
    });
};

export const setOnload = (data) => {
  return (dispatch) => {
    dispatch({
      type: "SET_ONLOAD",
      data,
    });
  };
};

export const setLoadBin = (data) => {
  return (dispatch) =>
    dispatch({
      type: "SET_LOADBIN",
      data,
    });
};

export const setIsLoading = (data) => {
  return (dispatch) =>
    dispatch({
      type: "SET_ISLOADING",
      data,
    });
};

export const setSideBarCss = (data) => {
  return (dispatch) =>
    dispatch({
      type: "SET_SIDEBARCSS",
      data,
    });
};

export const setOpenSideBar = (data) => {
  return (dispatch) =>
    dispatch({
      type: "SET_OPENSIDEBAR",
      data,
    });
};

export const setStartDownload = (data) => {
  return (dispatch) =>
    dispatch({
      type: "SET_STARTDOWLOAD",
      data,
    });
};

export const setHideList = (data) => {
  return (dispatch) =>
    dispatch({
      type: "SET_HIDELIST",
      data,
    });
};

export const setParentId = (data) => {
  return (dispatch) =>
    dispatch({
      type: "SET_PARENTID",
      data,
    });
};

export const setPath = (data) => {
  return (dispatch) =>
    dispatch({
      type: "SET_PATH",
      data,
    });
};

export const setBackPath = (data) => {
  return (dispatch) =>
    dispatch({
      type: "SET_BACK_PATH",
      data,
    });
};

export const setAllused = (data) => {
  return (dispatch) =>
    dispatch({
      type: "SET_ALLUSED",
      data,
    });
};

export const setExitUpload = (data) => {
  return (dispatch) =>
    dispatch({
      type: "EXIT",
      data,
    });
};

export const setReserSize = (data) => {
  return (dispatch) =>
    dispatch({
      type: "RESERVATION_SIZE",
      data,
    });
};

export const resetService = () => {
  return (dispatch) =>
    dispatch({
      type: "LOGOUT",
    });
};

export default services;
