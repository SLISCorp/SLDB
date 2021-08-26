import React, { Fragment, useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux'
import { CHeader, CToggler, CHeaderBrand, CHeaderNav, CSubheader, CBreadcrumbRouter } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import logo from "../assets/logos/sldb.png";
// routes config
import routes from '../routes';
import { TheHeaderDropdown, TheHeaderDropdownNotif } from './index';

const TheHeader = () => {
  const dispatch = useDispatch()
  const sidebarShow = useSelector(state => state.sidebarShow)

  const toggleSidebar = () => {
    let element = document.getElementById("show-toggle");
    element.classList.toggle("c-sidebar-lg-show")
  }

  const toggleSidebarMobile = () => {
    let element = document.getElementById("show-toggle");
    element.classList.toggle("c-sidebar-lg-show")
    element.classList.toggle("left-margin-zero")
  }

  return (
    <CHeader withSubheader>
      <CToggler
        inHeader
        className="ml-md-3 d-lg-none"
        onClick={($event) => { toggleSidebarMobile(); $event.stopPropagation(); }}
      />
      <CToggler
        inHeader
        className="ml-3 d-md-down-none"
        onClick={($event) => { toggleSidebar(); $event.stopPropagation(); }}
      />
      <CHeaderBrand className="mx-auto d-lg-none" to="/">
        <img src={logo} alt={"Logo"} height={48} />
      </CHeaderBrand>

      <CHeaderNav className="d-md-down-none mr-auto">
        {/* <CHeaderNavItem className="px-3" >
          <CHeaderNavLink to="/dashboard">Dashboard</CHeaderNavLink>
        </CHeaderNavItem>
        <CHeaderNavItem  className="px-3">
          <CHeaderNavLink to="/users">Users</CHeaderNavLink>
        </CHeaderNavItem>
        <CHeaderNavItem className="px-3">
          <CHeaderNavLink>Settings</CHeaderNavLink>
        </CHeaderNavItem> */}
      </CHeaderNav>

      <CHeaderNav>
        <TheHeaderDropdownNotif />
        {/* <TheHeaderDropdownTasks/> */}
        {/* <TheHeaderDropdownMssg/> */}
        <TheHeaderDropdown />
      </CHeaderNav>

      <CSubheader className="px-3 justify-content-between">
        <CBreadcrumbRouter
          className="border-0 c-subheader-nav m-0 px-0 px-md-3"
          routes={routes}
        />
        {/* <div className="d-md-down-none mfe-2 c-subheader-nav">
            <CLink className="c-subheader-nav-link"href="#">
              <CIcon name="cil-speech" alt="Settings" />
            </CLink>
            <CLink
              className="c-subheader-nav-link"
              aria-current="page"
              to="/dashboard"
            >
              <CIcon name="cil-graph" alt="Dashboard" />&nbsp;Dashboard
            </CLink>
            <CLink className="c-subheader-nav-link" href="#">
              <CIcon name="cil-settings" alt="Settings" />&nbsp;Settings
            </CLink>
          </div> */}
      </CSubheader>
    </CHeader>
  )
}

export default TheHeader
