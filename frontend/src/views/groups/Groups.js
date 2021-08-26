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
import Validation from "../../validations/validation_wrapper";
import {
  showAlert,
  showDangerToast,
  showToast,
  SwalConfig
} from "../../components/toastMessage";
import { formateDate } from "../../helpers/commonHelpers";
import Swal from "sweetalert";


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

const Groups = (props) => {
  const [status, setStatus] = useState({
    1: "Active",
    2: "Inactive",
    3: "Deleted",
    4: "Blocked",
  });
  const history = useHistory();
  const dispatch = useDispatch();
  const queryPage = useLocation().search.match(/page=([0-9]+)/, "");
  const currentPage = Number(queryPage && queryPage[1] ? queryPage[1] : 1);
  const [page, setPage] = useState(currentPage);
  const [tableData, setData] = useState(props.state.groupData || []);
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

  const getData = (page = 1) => {
    Http("GET", apiPath.getGroups)
      .then((res) => {
        res = res.data;
        if (res.status) {
          showToast(res.message);
          dispatch({ type: "update-group-data", payload: res.data });
          setData(res.data);
        } else {
          showDangerToast(res.message);
        }
      })
      .catch((err) => {
        showDangerToast(err.message);
      });
  };

  const onEventDelete = async (group_id) => {
    let SwalData = SwalConfig("You want to delete this group");
    const result = await Swal(SwalData);
    if (result) {
      Http("DELETE", apiPath.deleteGroup + group_id)
        .then((res) => {
          res = res.data;
          if (res.status) {
            showToast(res.msg);
            getData();
          } else {
            showDangerToast(res.msg);
          }
        })
        .catch((err) => {
          showDangerToast(err.msg);
        });
    }
  }

  const fields = [
    { key: "title", _style: { width: "40%" } },
    { key: "description", _style: { width: "20%" } },
    { key: "created_at", _style: { width: "20%" } },
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
  useEffect(() => {
    getData();
  }, []);


  return (
    <CRow>
      <CCol xl={12}>
        <CCard>
          <CCardHeader>
            Groups
            <small className="text-muted"> Management</small>
            <Link className="btn btn-info float-right" to="/admin/groups/add">
              Add Group
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
                created_at: (item) => (
                  <td>
                    {formateDate(item.created_at, "LLL")}
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
                        <CButton size="sm" color="info" className="ml-1" variant="outline"
                          onClick={() => {
                            history.push("/admin/groups/edit/" + item._id);
                          }}>
                          Edit
                        </CButton>
                        <CButton
                          size="sm"
                          color="success"
                          variant="outline"
                          className="ml-1"
                          onClick={() => {
                            history.push("/users/1");
                          }}
                        >
                          View
                        </CButton>
                        <CButton size="sm" color="danger" variant="outline" className="ml-1" onClick={() => {
                          onEventDelete(item._id);
                        }}>
                          Delete
                        </CButton>
                        <table className="table">
                          <tbody>
                            <tr>
                              <td>Name</td>
                              <td>{item.title}</td>
                            </tr>
                            <tr>
                              <td>Description</td>
                              <td>{item.description}</td>
                            </tr>
                            <tr>
                              <td>Username</td>
                              <td>{item.user_id ? item.user_id.username : 'N/A'}</td>
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
    </CRow>
  );
};

const mapStateToProps = function (state) {
  return {
    state: state,
  };
};
export default connect(mapStateToProps)(Groups);
