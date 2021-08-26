import React from 'react'
import {
  TheContent,
  TheSidebar,
  TheFooter,
  TheHeader
} from './index'

const TheLayout = () => {

  return (
    <div className="c-app c-default-layout">
      <TheSidebar />
      <div className="c-wrapper" onClick={() => {
        if ((window.innerWidth <= 990)) {
          let element = document.getElementById("show-toggle");
          element.classList.remove("c-sidebar-lg-show");
          element.classList.remove("left-margin-zero");
        }
      }}>
        <TheHeader />
        <div className="c-body" >
          <TheContent />
        </div>
        <TheFooter />
      </div>
    </div>
  )
}

export default TheLayout
