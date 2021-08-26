import React, { useState, useEffect } from "react";
import { useHistory, useLocation, Link } from "react-router-dom";
import {
  CBadge,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDataTable,
  CRow,
  CPagination,
  CButton,
  CCollapse,
} from "@coreui/react";
import { connect, useDispatch } from "react-redux";
import Http from "../../constants/http";
import apiPath from "../../constants/apiPath";
import {
  showAlert,
  showDangerToast,
  showToast,
} from "../../components/toastMessage";
import CIcon from "@coreui/icons-react";
import { formateDate } from "../../helpers/commonHelpers";
const getBadge = (status) => {
  switch (status) {
    case "Active":
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

const Users = (props) => {
  let role = {
    user: "User",
    admin: "Admin",
  };
  const [status, setStatus] = useState({
    1: "Active",
    2: "Inactive",
    3: "Deleted",
    4: "Blocked",
  });
  const history = useHistory();
  const queryPage = useLocation().search.match(/page=([0-9]+)/, "");
  const currentPage = Number(queryPage && queryPage[1] ? queryPage[1] : 1);
  const [page, setPage] = useState(currentPage);
  const [tableData, setData] = useState([]);
  const pageChange = (newPage) => {
    currentPage !== newPage && history.push(`/users?page=${newPage}`);
  };

  const [details, setDetails] = useState([]);

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

  useEffect(() => {
    getData();
  }, []);

  const getData = (page = 1) => {
    Http("GET", apiPath.getUsers)
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

  const deleteUser = (userid) => {
    Http("GET", apiPath.deleteUser + "/" + userid)
      .then((res) => {
        setData([]);
        getData();
        showDangerToast(res.msg);
      })
      .catch((err) => {
        showDangerToast(err.message);
      });
  };

  const fields = [
    { key: "username", _style: { width: "40%" } },
    { key: "email", _style: { width: "20%" } },
    { key: "status", _style: { width: "20%" } },
    {
      key: "show_details",
      label: "",
      _style: { width: "1%" },
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

  return (
    <CRow>
      <CCol xl={12}>
        <CCard>
          <CCardHeader>
            Users
            <small className="text-muted"> Management</small>
            <Link className="btn btn-info float-right" to="/admin/users/add">
              Add User
            </Link>
          </CCardHeader>
          <CCardBody>
            <CDataTable
              items={tableData}
              fields={fields}
              columnFilter
              tableFilter
              footer
              itemsPerPageSelect
              itemsPerPage={10}
              hover
              sorter
              pagination
              scopedSlots={{
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
                    </td>
                  );
                },
                details: (item, index) => {
                  return (
                    <CCollapse show={details.includes(index)}>
                      <CCardBody>
                        <h4>{item.username}</h4>
                        <h6>User Type: {role[item.role_id] || "NA"}</h6>
                        <p className="text-muted">
                          User since: {formateDate(item.created_at, "LLL")}
                        </p>

                        <CButton
                          size="sm"
                          color="info"
                          className="ml-1"
                          variant="outline"
                          onClick={() => {
                            history.push("/admin/users/edit/" + item._id);
                          }}
                        >
                          Edit
                        </CButton>
                        <CButton
                          size="sm"
                          color="info"
                          className="ml-1"
                          variant="outline"
                          onClick={() => {
                            history.push("/admin/user-settings/" + item._id);
                          }}
                        >
                          Password
                        </CButton>
                        <CButton
                          size="sm"
                          color="danger"
                          variant="outline"
                          className="ml-1"
                          onClick={() => {
                            deleteUser(item._id);
                          }}
                        >
                          Delete
                        </CButton>
                      </CCardBody>
                    </CCollapse>
                  );
                },
              }}
            />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

const mapStateToProps = function (state) {
  return {
    state: state,
  };
};
export default connect(mapStateToProps)(Users);
