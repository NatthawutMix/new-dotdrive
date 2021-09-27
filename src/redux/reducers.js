import { combineReducers } from "redux";
import services from "./services";
import listValue from "./listValue";

const reducer = combineReducers({ service: services, listValue: listValue });

export default reducer;
