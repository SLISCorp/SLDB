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
import { freeSet } from "@coreui/icons";
import { useHistory, useLocation, Link } from "react-router-dom";


const Entities = (props) => {
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
  const [usersData, setUsersData] = useState([]);
  const [selectedUser, setSelectedUser] = useState("ANY_OWNER");
  const [selectedType, setSelectedType] = useState("DATA");
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
  const getusers = (page = 1) => {
    Http("GET", apiPath.ownerList)
      .then((res) => {
        res = res.data;
        if (res.status) {
          showToast(res.message);
          setUsersData(res.data);
        } else {
          showDangerToast(res.message);
        }
      })
      .catch((err) => {
        showDangerToast(err.message);
      });
  };
  const getData = (owner_id, event_type) => {
    Http("GET", apiPath.getEvents + '?owner_id=' + owner_id + '&event_type=' + event_type)
      .then((res) => {
        res = res.data;
        if (res.status) {
          showToast(res.message);
          res.data = res.data.map((ele, ind) => {
            ele.event_owner_name = ele.event_owner.username;
            ele.entity_name = ele.event_type == 'DATA' ? ele.entity_id.name : ele.entity_id;
            ele.enable_event = ele.enable_event;
            return ele;
          })
          setData(res.data);
        } else {
          showDangerToast(res.message);
        }
      })
      .catch((err) => {
        showDangerToast(err.message);
      });
  };
  const fields = [
    { key: "event_name", label: "Event Name ", _style: { width: "15%" } },
    { key: "entity_name", label: "Entity ", _style: { width: "15%" } },
    { key: "type", label: "Type", _style: { width: "10%" } },
    { key: "publishing_uri", label: "Publishing URI", _style: { width: "20%" } },
    { key: "created_at", _style: { width: "20%" } },

    {
      key: "show_details",
      label: "Actions",
      _style: { width: "15%" },
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
  const handleOwnerChange = (e) => {
    setSelectedUser(e.target.value);
    getData(e.target.value, selectedType);
  }
  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
    getData(selectedUser, e.target.value);
  }
  const onEventDelete = async (event_id) => {
    let SwalData = SwalConfig("You want to delete this event");
    const result = await Swal(SwalData);
    if (result) {
      Http("DELETE", apiPath.DeleteEvent + event_id)
        .then((res) => {
          res = res.data;
          if (res.status) {
            showToast(res.message);
            getData(selectedUser, selectedType);
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
    getData(selectedUser, selectedType);
    getusers();
  }, []);

  return (
    <CRow>
      <CCol xl={12}>
        <CCard>
          <CCardHeader>
            Event Managment
          </CCardHeader>
          <CCardBody>
            <CSelect
              custom
              size="md"
              className="col-3 mb-2 mr-1"
              name="data_type"
              id="selectLg"
              value={selectedUser._id}
              onChange={(e) => {
                handleOwnerChange(e)
              }}
            >
              {usersData.map((ele, ind) => {
                return <option key={ind} value={ele._id}>{ele.username}</option>;
              })}
            </CSelect>
            <CSelect
              custom
              size="md"
              className="col-3 mb-2"
              name="data_type"
              id="selectLg"
              value={selectedType._id}
              onChange={(e) => {
                handleTypeChange(e)
              }}
            >
              <option value={"DATA"}>Data Events</option>
              <option value={"SYSTEM"}>System Events</option>
            </CSelect>
            <Link className="btn btn-info float-right" to="/admin/events/add">
              Add Event
            </Link>
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
                created_at: (item) => (
                  <td>
                    {formateDate(item.created_at, "LLL")}
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
                          history.push("/admin/events/edit/" + item._id);
                        }}
                      >
                        Edit
                        </CButton>
                      <CButton
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
                        </CButton>
                    </td>
                  );
                },
                details: (item, index) => {
                  return (
                    <CCollapse show={details.includes(index)}>
                      <CCardBody>
                        <table className="table">
                          <tbody>
                            <tr>
                              <td>Username</td>
                              <td>{item.event_owner.username}</td>
                            </tr>
                            <tr>
                              <td>Data Type</td>
                              <td>{item.event_type}</td>
                            </tr>
                            <tr>
                              <td>Event Name</td>
                              <td>{item.event_name}</td>
                            </tr>
                            <tr>
                              <td>Entity Id</td>
                              <td>
                                {item.entity_id._id}
                              </td>
                            </tr>
                            <tr>
                              <td>Entity Name</td>
                              <td>
                                {item.entity_id.name}
                              </td>
                            </tr>
                            <tr>
                              <td>Publishing URL</td>
                              <td>{item.publishing_uri}</td>
                            </tr>
                            <tr>
                              <td>Enable Event </td>
                              <td>{item.enable_event ? 'Enable' : 'Disable'}</td>
                            </tr>
                            <tr>
                              <td>Triggres</td>
                              <td>{item.triggers.join(", ")}</td>
                            </tr>
                            <tr>
                              <td>Created Date </td>
                              <td>{formateDate(item.created_at, "LLL")}</td>
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
export default connect(mapStateToProps)(Entities);
