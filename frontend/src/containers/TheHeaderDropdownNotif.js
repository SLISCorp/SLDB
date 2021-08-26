import React, { useState, useEffect } from "react";
import { CBadge, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CCardBody, CProgress } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import Http from "../constants/http";
import apiPath from "../constants/apiPath";
import { showAlert, showDangerToast, showToast, SwalConfig } from "../components/toastMessage";


const TheHeaderDropdownNotif = () => {
  const itemsCount = 5
  const [tableData, setData] = useState([]);

  const handleClick = () => {
    Http("POST", apiPath.notificationList)
      .then((res) => {
        res = res.data;
        if (res.status) {
          setData(res.data.data);
        } else {
          showDangerToast(res.message);
        }
      })
      .catch((err) => {
        showDangerToast(err.message);
      });
  };

  // useEffect(() => {
  //   console.log('-tableData----->', tableData);
  // }, [tableData]);


  return (
    <CDropdown inNav className="c-header-nav-item mx-2 ">
      <CDropdownToggle className="c-header-nav-link" caret={false} onClick={(e)=>{handleClick()}}>
        <span className={"mr-1 font-weight-bold"}>Notifications</span>  <CIcon name="cil-bell" />
        {/* <CBadge shape="pill" color="danger">{itemsCount}</CBadge> */}
      </CDropdownToggle>
      <CDropdownMenu placement="bottom-end" className="pt-0 width-500">
        <CDropdownItem header tag="div" className="text-center" color="light"        >
          {/* <strong>You have {itemsCount} notifications</strong> */}
        </CDropdownItem>
        <CCardBody>
          <table className="table">
            <tbody>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Message</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {
                  tableData.map((val, i) => {
                    return (
                      <>
                        <tr>
                          <td>{val.title}</td>
                          <td>{val.message}</td>
                          <td>{val.time}</td>
                        </tr>
                      </>
                    )
                  })
                }
              </tbody>

            </tbody>
          </table>
        </CCardBody>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default TheHeaderDropdownNotif