import React, { useState, useEffect } from "react";
import { useSelector, connect, useDispatch } from 'react-redux'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CImg, } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import Session from "../helpers/session";
import { confirmAlert } from "../components/toastMessage";
import { Link, useHistory } from "react-router-dom";
import Http from "../constants/http";
import {
  showAlert,
  showDangerToast,
  showToast,
} from "../components/toastMessage";
import apiPath from "../constants/apiPath";
var disable = false;
const TheHeaderDropdown = (props) => {
  let history = useHistory()
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const User = useSelector(state => state.user)
  const onLogout = async () => {
    if (
      await confirmAlert(
        "Are you sure you want to log out?",
        "Logout",
        "success",
        false,
        "Success"
      )
    ) {
      let body = {};
      body["device_type"] = props.state.deviceInfo.device_type;
      if (props.state.deviceInfo.fcmToken) {
        body["fcmToken"] = props.state.deviceInfo.fcmToken;
      }
      setLoading(true);
      Http("POST", apiPath.adminLogout, JSON.stringify(body))
        .then((response) => {
          disable = false;
          response = response.data;
          if (response) {
            showToast(response.message);
            setLoading(false);
            Session.clearItem("ModexWeb");
            Session.clearItem("token");
            dispatch({ type: "logout", payload: null });
            history.replace("/admin/login")
          } else {
            setLoading(false);
            setLoading(false);
            Session.clearItem("ModexWeb");
            Session.clearItem("token");
            dispatch({ type: "logout", payload: null });
            history.replace("/admin/login")
            showDangerToast(response.message);
          }
        })
        .catch((err) => {
          disable = false;
          showDangerToast(err.message);
          setLoading(false);
          setLoading(false);
          Session.clearItem("ModexWeb");
          Session.clearItem("token");
          dispatch({ type: "logout", payload: null });
          history.replace("/admin/login")
        });

      // props.history.replace("/admin/login");
    }
  };

  return (
    <CDropdown inNav className="c-header-nav-items mx-2" direction="down">
      <CDropdownToggle className="c-header-nav-link" caret={false}>
        <span><b>{User.username}</b></span>
        <div className="c-avatar ml-2">
          <CImg src={User.image} className="c-avatar-img" alt={User.email} />
        </div>
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownItem
          onClick={() => {
            document.getElementById("navigate2").click();
          }}
        >
          <CIcon name="cil-user" className="mfe-2" />
          Profile
        </CDropdownItem>
        <CDropdownItem
          onClick={() => {
            document.getElementById("navigate").click();
          }}
        >
          <CIcon name="cil-settings" className="mfe-2" />
          Settings
        </CDropdownItem>
        <CDropdownItem onClick={onLogout}>
          <CIcon name="cil-lock-locked" className="mfe-2" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
      <Link to="/admin/user-settings" hidden={true} id="navigate"></Link>
      <Link to="/admin/profile" hidden={true} id="navigate2"></Link>

    </CDropdown>
  );
};

const mapStateToProps = function (state) {
  return {
    state: state,
  };
};
export default connect(mapStateToProps)(TheHeaderDropdown);

