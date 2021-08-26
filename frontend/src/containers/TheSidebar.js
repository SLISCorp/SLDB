import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  CCreateElement,
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CSidebarNavDivider,
  CSidebarNavTitle,
  CSidebarMinimizer,
  CSidebarNavDropdown,
  CSidebarNavItem,
} from "@coreui/react";
import logo from "../assets/logos/sldb.png";
import logo2 from "../assets/logos/sldb-2.png";
// import CIcon from "@coreui/icons-react";

// sidebar nav config
import navigation from "./_nav";

const TheSidebar = () => {
  const dispatch = useDispatch();
  const show = useSelector((state) => state.sideSHow.sidebarShow);
  const user = useSelector((state) => state.user);
  const [logoImage, setLogo] = useState(true);
  var nav = navigation.filter((ele) => {
    if (ele.isAdmin && (user.role_id == "admin" || user.role_id == "company")) {
      return ele;
    } else if (!ele.isAdmin) {
      return ele;
    }
  }); 

  return (
    <CSidebar
      show={show}
      id={'show-toggle'}
      onShowChange={(val) => dispatch({ type: "set", sidebarShow: val })}
    >
      <CSidebarBrand className="d-md-down-none" to="/">
        {logoImage && <img src={logo} alt={"Logo"} />}
        {!logoImage && (
          <img src={logo2} alt={"Logo"} className={"minimize-logo"} />
        )}
      </CSidebarBrand>
      <CSidebarNav>
        <CCreateElement
          items={nav}
          components={{
            CSidebarNavDivider,
            CSidebarNavDropdown,
            CSidebarNavItem,
            CSidebarNavTitle,
          }}
        />
      </CSidebarNav>
      <div
        onClick={() => {
          setLogo(!logoImage);
        }}
      >
        <CSidebarMinimizer className="c-d-md-down-none" />
      </div>
    </CSidebar>
  );
};

export default React.memo(TheSidebar);
