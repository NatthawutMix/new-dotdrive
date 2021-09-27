import axios from "axios";

const instance = axios.create({
  // baseURL: "http://localhost:8001/",
  // baseURL: "https://new-dotdrive.herokuapp.com/",
  baseURL: "https://test-dotdrive.herokuapp.com/",
});

export default instance;
