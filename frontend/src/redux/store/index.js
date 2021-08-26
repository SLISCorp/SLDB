import { createStore, applyMiddleware, combineReducers } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension/logOnlyInProduction";
import ProfileReducer from "../reducers/profileReducer";
import DeviceInfo from "../reducers/deviceInfoReducer";
import LoadingReducer from "../reducers/loadingReducer";
import ActiveClassReducer from "../reducers/activeClassReducer";
import RefreshBrowser from "../reducers/browserReload";
import groupReducer from "../reducers/groupReducer";
import sideShowReducer from "../reducers/sideShowReducer";
var rootReducer = combineReducers({
  user: ProfileReducer,
  deviceInfo: DeviceInfo,
  loading: LoadingReducer,
  activeClass: ActiveClassReducer,
  browserReload: RefreshBrowser,
  groupData: groupReducer,
  sideSHow: sideShowReducer,
});

function configureStore(state = { rotating: true }) {
  return createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk)));
}

export default configureStore;
