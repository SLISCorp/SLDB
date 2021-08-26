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


const Licenses = (props) => {
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
    Http("GET", apiPath.getLicense)
      .then((res) => {
        res = res.data;
        if (res.status) {
          showToast(res.message);
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
    { key: "license_lable", label: "Label", _style: { width: "20%" } },
    { key: "validity", label: "Validity (days)", _style: { width: "20%" } },
    { key: "start_date", label: "Start Date", _style: { width: "20%" } },
    { key: "created_at", _style: { width: "20%" } },
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
    let SwalData = SwalConfig("You want to delete this licence");
    const result = await Swal(SwalData);
    if (result) {
      Http("DELETE", apiPath.deletelicence + event_id)
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
            Licenses Managment
          </CCardHeader>
          <CCardBody>
            <Link className="btn btn-info float-right" to="/admin/licenses/add">
              Add Licenses
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
                start_date: (item) => (
                  <td>
                    {formateDate(item.start_date, "LLL")}
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
                          history.push("/admin/licenses/edit/" + item._id);
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
                              <td>Label</td>
                              <td>{item.license_lable}</td>
                            </tr>
                            <tr>
                              <td>Validity (days)</td>
                              <td>{item.validity}</td>
                            </tr>
                            <tr>
                              <td>Start Date</td>
                              <td>{formateDate(item.start_date, "LLL")}</td>
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
export default connect(mapStateToProps)(Licenses);
