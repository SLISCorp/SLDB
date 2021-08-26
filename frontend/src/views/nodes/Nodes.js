import React, { useState, useEffect } from "react";
import { CBadge, CLabel, CCard, CCardBody, CSelect, CCardHeader, CCol, CDataTable, CRow, CPagination, CInputCheckbox, CButton, CCollapse, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from "@coreui/react";
import { connect, useDispatch } from "react-redux";
import Http from "../../constants/http";
import apiPath from "../../constants/apiPath";
import { ErrorMessage, useForm } from "react-hook-form";
import { showAlert, showDangerToast, showToast, SwalConfig } from "../../components/toastMessage";
import { formateDate } from "../../helpers/commonHelpers";
import Swal from "sweetalert";
import CIcon from "@coreui/icons-react";
import Timer from "../../components/timer"
import { freeSet } from "@coreui/icons";
import { useHistory, useLocation, Link } from "react-router-dom";
import { element } from "prop-types";


const Nodes = (props) => {
  var disabled = false;
  const [status, setStatus] = useState({
    1: "Active",
    2: "Inactive",
    3: "Deleted",
    4: "Blocked",
  });
  const { register, handleSubmit, errors, setError, clearErrors, watch, } = useForm();
  const history = useHistory();
  const queryPage = useLocation().search.match(/page=([0-9]+)/, "");
  const currentPage = Number(queryPage && queryPage[1] ? queryPage[1] : 1);
  const [page, setPage] = useState(currentPage);
  const [tableData, setData] = useState([]);
  const [details, setDetails] = useState([]);

  const pageChange = (newPage) => {
    currentPage !== newPage && history.push(`/events?page=${newPage}`);
  };
  const toggleDetails = (index) => {
    const position = details.indexOf(index);
    let newDetails = details.slice();
    if (position !== -1) {
      newDetails.splice(position, 1);
    } else {
      newDetails = [...details, index];
    }
    setDetails(newDetails);
  };

  const getData = () => {
    Http("GET", apiPath.getNodes)
      .then((res) => {
        res = res.data;
        if (res.status) {
          showToast(res.message);
          setData(res.data || []);
        } else {
          showDangerToast(res.message);
        }
      })
      .catch((err) => {
        showDangerToast(err.message);
      });
  };
  const fields = [
    { key: "node_name", label: "Node Name ", _style: { width: "10%" } },
    { key: "public_id", label: "Public Ip", _style: { width: "10%" } },
    { key: "node_licence", label: "Node Licence", _style: { width: "10%" } },
    { key: "node_type", label: "Node Type", _style: { width: "10%" } },
    { key: "user_id", label: "Updated By", _style: { width: "10%" } },
    { key: "created_at", _style: { width: "15%" } },
    { key: "updated_at", _style: { width: "15%" } },
    {
      key: "show_details",
      label: "Actions",
      _style: { width: "20%" },
      sorter: false,
      filter: false,
    },
  ];
  const getBadge = (status) => {
    switch (status) {
      case 1:
        return "success";
      case "Inactive":
        return "secondary";
      case "Pending":
        return "warning";
      case "Banned":
        return "danger";
      default:
        return "primary";
    }
  };

  const onEventDelete = async (event_id) => {
    let SwalData = SwalConfig("You want to delete this event");
    const result = await Swal(SwalData);
    if (result) {
      Http("DELETE", apiPath.DeleteEvent + event_id)
        .then((res) => {
          res = res.data;
          if (res.status) {
            showToast(res.message);
            getData();
          } else {
            showDangerToast(res.message);
          }
        })
        .catch((err) => {
          showDangerToast(err.message);
        });
    }
  }
  useEffect(() => {
    getData();
  }, []);

  return (
    <CRow>
      <CCol xl={12}>
        <CCard>
          <CCardHeader>
            Nodes Managment
          </CCardHeader>
          <CCardBody>
            {/* <Link className="btn btn-info float-right" to="/admin/nodes/add">
              Add Node
            </Link> */}
            <CDataTable
              items={tableData}
              fields={fields}
              columnFilter
              footer
              itemsPerPage={10}
              hover
              sorter
              pagination
              scopedSlots={{

                node_licence: (item) => (
                  <td>
                    {item.licence_id ? item.licence_id.license_lable ? item.licence_id.license_lable : "NA" : "NOT ADDED"}
                  </td>
                ),

                node_type: (item) => (
                  <td>
                    {item.node_type ? item.node_type == 1 ? 'DATA NODE' : item.node_type == 2 ? "AUTH NODE" : "NA" : "NA"}
                  </td>
                ),

                created_at: (item) => (
                  <td>
                    {formateDate(item.created_at, "LLL")}
                  </td>
                ),
                updated_at: (item) => (
                  <td>
                    {formateDate(item.updated_at, "LLL")}
                  </td>
                ),

                user_id: (item) => (
                  <td>
                    {item.user_id ? item.user_id.username ? item.user_id.username : "NA" : "NA"}
                  </td>
                ),

                status: (item) => (
                  <td>
                    <CBadge color={getBadge(item.status)}>
                      {status[item.status]}
                    </CBadge>
                  </td>
                ),

                show_details: (item, index) => {
                  return (
                    <td className="py-2">
                      <CButton
                        color="primary"
                        variant="outline"
                        shape="square"
                        size="sm"
                        onClick={() => {
                          toggleDetails(index);
                        }}
                      >
                        {details.includes(index) ? "Hide" : "Show"}
                      </CButton>
                      <CButton
                        size="sm"
                        color="info"
                        className={"ml-2"}
                        variant="outline"
                        shape="square"
                        onClick={() => {
                          history.push("/admin/nodes/edit/" + item._id);
                        }}
                      >
                        Edit
                        </CButton>
                      {/* <CButton
                        size="sm"
                        className={"ml-2"}
                        color="danger"
                        variant="outline"
                        shape="square"
                        onClick={() => {
                          onEventDelete(item._id);
                        }}
                      >
                        Delete
                        </CButton> */}
                    </td>
                  );
                },
                details: (item, index) => {
                  let counter = 0;
                  if (item.expire_date && item.start_date) {
                    counter = new Date(item.expire_date) - new Date();
                    counter = counter / 1000
                  }
                  return (
                    <CCollapse show={details.includes(index)}>
                      <CCardBody>
                        <table className="table">
                          <tbody>
                            <tr>
                              <td>Node Name</td>
                              <td>{item.node_name}</td>
                            </tr>
                            <tr>
                              <td>Node Type</td>
                              <td>{item.node_type ? item.node_type == 1 ? 'DATA NODE' : item.node_type == 2 ? "AUTH NODE" : "NA" : "NA"}</td>
                            </tr>
                            <tr>
                              <td>Node Licence</td>
                              <td>{item.licence_id ? item.licence_id.license_lable ? item.licence_id.license_lable : "NA" : "No licence added"}</td>
                            </tr>
                            <tr>
                              <td>Node Licence validity(days)</td>
                              <td>{item.licence_id ? item.licence_id.validity ? item.licence_id.validity + " days" : "NA" : "No licence added"}</td>
                            </tr>

                            <tr>
                              <td>Public Ip</td>
                              <td>{item.public_id}</td>
                            </tr>


                            <tr>
                              <td>Update By</td>
                              <td>
                                {item.user_id ? item.user_id.username ? item.user_id.username : "NA" : "NA"}
                              </td>
                            </tr>

                            <tr>
                              <td>Node licence start date</td>
                              <td>
                                {item.start_date ? formateDate(new Date(item.start_date), "LLL") : "No licence added"}
                              </td>
                            </tr>

                            <tr>
                              <td>Node licence expire date</td>
                              <td>
                                {item.expire_date ? formateDate(new Date(item.expire_date), "LLL") : "No licence added"}
                              </td>
                            </tr>

                            <tr>
                              <td>Node Licence expire in</td>
                              <td><Timer counter={item.counter || 0} onFinish={() => { }} /></td>
                            </tr>

                            <tr>
                              <td>Created Date </td>
                              <td>{formateDate(item.created_at, "LLL")}</td>
                            </tr>

                            <tr>
                              <td>Update Date </td>
                              <td>{formateDate(item.updated_at, "LLL")}</td>
                            </tr>

                          </tbody>
                        </table>
                      </CCardBody>
                    </CCollapse>
                  );
                },
              }}
            />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow >
  );
};

const mapStateToProps = function (state) {
  return {
    state: state,
  };
};
export default connect(mapStateToProps)(Nodes);
