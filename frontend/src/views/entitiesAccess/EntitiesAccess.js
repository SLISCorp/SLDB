import React, { useState, useEffect } from "react";
import { useHistory, useLocation, Link } from "react-router-dom";
import { CBadge, CLabel, CCard, CCardBody, CSelect, CCardHeader, CCol, CDataTable, CRow, CPagination, CInputCheckbox, CButton, CCollapse, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from "@coreui/react";
import { connect, useDispatch } from "react-redux";
import Http from "../../constants/http";
import apiPath from "../../constants/apiPath";
import { ErrorMessage, useForm } from "react-hook-form";
import { showAlert, showDangerToast, showToast } from "../../components/toastMessage";
import CIcon from "@coreui/icons-react";
import { formateDate } from "../../helpers/commonHelpers";

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
  const [EntityData, setEntityData] = useState([]);
  const [GroupData, setGroupData] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState({});
  const [details, setDetails] = useState([]);
  const [openModel, setOpenModel] = useState(false);
  const [EditModel, setEditModel] = useState(false);
  const [seletedGroup, setSelected] = useState([]);
  const [permission, setPermission] = useState({ read: false, encrypt: false, write: false });
  const [editEntityAccessData, setEditEntityAccessData] = useState({ entity_name: '', group_name: "", group_desc: "" });


  const pageChange = (newPage) => {
    currentPage !== newPage && history.push(`/entities?page=${newPage}`);
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
  const getData = (id) => {
    Http("GET", apiPath.getPermissionData + '/' + id)
      .then((res) => {
        res = res.data;
        if (res.status) {
          showToast(res.message);
          res.data = res.data.map((ele, ind) => {
            ele.group_name = ele.group_id.title;
            ele.group_description = ele.group_id.description;
            ele.entity_name = ele.entity_id.name;
            ele.access = (ele.permission.read ? "READ  " : "") + (ele.permission.write ? "WRITE" : "");
            ele.encrypt = (ele.permission.encrypt ? "ENCRYPT " : "");
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
  const getEntityData = (page = 1) => {
    Http("GET", apiPath.entitiesList)
      .then((res) => {
        res = res.data;
        if (res.status) {
          showToast(res.message);
          setEntityData(res.data);
          setSelectedEntity(res.data[0] ? res.data[0] : {});
          if (res.data[0] && res.data[0]._id) {
            getData(res.data[0]._id);
            getGroupData(res.data[0]._id);
          }
        } else {
          showDangerToast(res.message);
        }
      })
      .catch((err) => {
        showDangerToast(err.message);
      });
  };
  const getGroupData = (id) => {
    Http("GET", apiPath.getGroupsList + '/' + id)
      .then((res) => {
        res = res.data;
        if (res.status) {
          showToast(res.message);
          setGroupData(res.data);
        } else {
          showDangerToast(res.message);
        }
      })
      .catch((err) => {
        showDangerToast(err.message);
      });
  };
  const fields = [
    { key: "group_name", label: "Group Name", _style: { width: "25%" } },
    { key: "group_description", label: "Group Description", _style: { width: "25%" } },
    { key: "access", label: "Permission", _style: { width: "20%" } },
    { key: "encrypt", label: "Allow Decrypt", _style: { width: "20%" } },
    {
      key: "show_details",
      label: "Actions",
      _style: { width: "10%" },
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
  const handleEntityChange = (e) => {
    var index = e.nativeEvent.target.selectedIndex;
    let name = e.nativeEvent.target[index].text;
    setSelectedEntity({ _id: e.target.value, name: name });
    getData(e.target.value)
    getGroupData(e.target.value);

  }
  const handelOpenModel = () => {
    setEditModel(false);
    setOpenModel(true);
    setPermission({ read: false, encrypt: false, write: false });
    setSelected([]);
  }
  const handelEditOpenModel = (index) => {
    let entityDetails = tableData[index];
    setEditEntityAccessData({ id: entityDetails._id, group_id: entityDetails.group_id._id, entity_id: entityDetails.entity_id._id, entity_name: entityDetails.entity_id.name, group_name: entityDetails.group_id.title, group_desc: entityDetails.group_id.description })
    setEditModel(true);
    setOpenModel(true);
    setPermission(entityDetails.permission);
  }
  const onCheck = (index, id, isAll) => {
    let arr = seletedGroup;
    if (isAll) {
      if (GroupData.length == seletedGroup.length) {
        setSelected([]);
      } else {
        setSelected(GroupData.map((ele) => ele._id));
      }
    } else {
      if (seletedGroup.includes(id)) {
        arr = arr.filter((ele) => ele != id);
        setSelected(arr);
      } else {
        setSelected([...seletedGroup, ...[id]]);
      }
    }
  };
  const deleteEntityAccess = (id) => {
    Http("DELETE", apiPath.deletePermission + "/" + id)
      .then((res) => {
        getData(selectedEntity._id);
        showDangerToast(res.msg);
        getGroupData(selectedEntity._id);
      })
      .catch((err) => {
        showDangerToast(err.message);
      });
  }
  const onSubmit = async () => {
    if (seletedGroup.length == 0) { setError("emptyGroup", {}); return; } else { clearErrors("emptyGroup", {}); }
    if (permission.read == false && permission.write == false) { setError("emptyPermission", {}); return; } else { clearErrors("emptyPermission", {}); }
    if (disabled) {
      return;
    }
    disabled = 1;
    clearErrors();
    setOpenModel(!openModel)
    let body = {
      group_id: seletedGroup,
      entity_id: selectedEntity._id,
      permission: permission,
    };
    Http("POST", apiPath.addPermission, JSON.stringify(body))
      .then((res) => {
        res = res.data;
        disabled = 0;
        if (res.status) {
          showToast(res.message);
          getData(selectedEntity._id);
          getGroupData(selectedEntity._id);
        } else {
          showDangerToast(res.message);
        }
      })
      .catch((err) => {
        disabled = 0;
        showDangerToast(err.message);
      });

  };
  const onUpdate = async (editId) => {
    if (permission.read == false && permission.write == false) { setError("emptyPermission", {}); return; }
    if (disabled) { return; }
    clearErrors();
    disabled = 1;
    setOpenModel(!openModel)
    let body = { group_id: editEntityAccessData.group_id, entity_id: editEntityAccessData.entity_id, permission: permission };
    Http("PUT", apiPath.editPermission + '/' + editId, JSON.stringify(body)).then((res) => {
      res = res.data;
      disabled = 0;
      if (res.status) {
        showToast(res.message);
        getData(selectedEntity._id);
        getGroupData(selectedEntity._id);
      } else {
        showDangerToast(res.message);
      }
    }).catch((err) => {
      disabled = 0;
      showDangerToast(err.message);
    });
  }
  useEffect(() => {
    getEntityData();
  }, []);

  return (
    <CRow>
      <CCol xl={12}>
        <CCard>
          <CCardHeader>
            Entity Data Access
          </CCardHeader>
          <CCardBody>
            <p><strong>Groups with permissions on entity: {selectedEntity.name}</strong></p>
            <CButton
              color="info"
              size="md"
              color="info"
              className="mr-1 mb-2"
              onClick={(e) => { handelOpenModel() }}
            > Add Group
            </CButton>
            <CSelect
              custom
              size="md"
              className="col-3 mb-2"
              name="data_type"
              id="selectLg"
              value={selectedEntity._id}
              onChange={(e) => { handleEntityChange(e) }}
            >
              {EntityData.map((ele, ind) => {
                return <option key={ind} value={ele._id}>{ele.name}</option>;
              })}
            </CSelect>
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
                    {formateDate(item, "LLL")}
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
                        size="sm"
                        color="info"
                        variant="outline"
                        shape="square"
                        onClick={(e) => {
                          handelEditOpenModel(index);
                        }}
                      >
                        Edit
                        </CButton>
                      <CButton
                        color="danger"
                        variant="outline"
                        shape="square"
                        className="ml-1"
                        size="sm"
                        onClick={() => {
                          deleteEntityAccess(item._id);
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
                        <h4>{item.name}</h4>
                        <p>{item.description} </p>
                        <label>Properties : </label> <pre>{JSON.stringify(item.properties, null, 2)}</pre>
                      </CCardBody>
                    </CCollapse>
                  );
                },
              }}
            />
          </CCardBody>
        </CCard>
      </CCol>
      <CModal show={openModel} onClose={() => setOpenModel(!openModel)} size="lg" >
        <CModalHeader closeButton>
          <CModalTitle>{EditModel ? "Edit Permission" : "Choose Groups"}  </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {errors.emptyGroup && (
            <p className="custom-control text-danger marginmessage">
              You mush select at least one group.
            </p>
          )}
          {errors.emptyPermission && (
            <p className="custom-control text-danger marginmessage">
              You mush select at least one permission.
            </p>
          )}

          {!EditModel && <table className="table">
            <thead>
              <tr>
                <th scope="col">
                  <div className="custom-control custom-checkbox">
                    <input
                      type="checkbox"
                      checked={
                        seletedGroup.length == GroupData.length
                      }
                      onChange={() => {
                        onCheck(0, 1, true);
                      }}
                    />
                  </div>
                </th>
                <th scope="col">
                  <CLabel
                    variant="checkbox"
                    className="form-check-label"
                    htmlFor="checkbox2"
                  >
                    GROUP NAME
                  </CLabel>
                </th>
                <th scope="col">
                  <CLabel
                    variant="checkbox"
                    className="form-check-label"
                    htmlFor="checkbox2"
                  >
                    GROUP DESCRIPTION
                  </CLabel>
                </th>
              </tr>
            </thead>
            <tbody>
              {GroupData.map((ele, index) => {
                return (
                  <tr key={index}>
                    <td scope="col">
                      <div className="custom-control custom-checkbox">
                        <input
                          data-v-542dbc90=""
                          type="checkbox"
                          checked={seletedGroup.includes(ele._id)}
                          onChange={() => {
                            onCheck(index, ele._id, false);
                          }}
                        />
                      </div>
                    </td>
                    <td scope="col">
                      <CLabel
                        variant="checkbox"
                        className="form-check-label"
                        htmlFor="checkbox2"
                      >
                        {ele.title}
                      </CLabel>
                    </td>
                    <td scope="col">
                      <CLabel
                        variant="checkbox"
                        className="form-check-label"
                        htmlFor="checkbox2"
                      >
                        {ele.description}
                      </CLabel>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>}
          {EditModel && <div className="custom-control mb-5">
            <CRow><div className={"col-md-4"} ><strong>Entity : </strong>  {editEntityAccessData.entity_name} </div></CRow>
            <CRow>  <div className={"col-md-4"} ><strong>Group Name : </strong>  {editEntityAccessData.group_name} </div></CRow>
            <CRow> <div className={"col-md-4"} ><strong>Group Description : </strong>  {editEntityAccessData.group_desc} </div></CRow>
          </div>}

          <div className="custom-control custom-checkbox">
            <label> <strong>Select Grant Type* </strong></label>
            <CRow>
              <div className={"col-md-4"} >
                <input
                  data-v-542dbc90=""
                  type="checkbox"
                  className={"mr-2"}
                  checked={permission.read}
                  onChange={(e) => {
                    setPermission({ ...permission, read: e.target.checked, encrypt: e.target.checked ? permission.encrypt : false });
                  }}
                />READ
              </div>
              {permission.read && <div className={"col-md-4"} >
                <input
                  data-v-542dbc90=""
                  type="checkbox"
                  className={"mr-2"}
                  checked={permission.encrypt}
                  onChange={(e) => { setPermission({ ...permission, encrypt: e.target.checked }) }}
                />ENCRYPTED
              </div>}
            </CRow>
            <CRow>
              <div className={"col-md-4"} >
                <input
                  data-v-542dbc90=""
                  type="checkbox"
                  className={"mr-2"}
                  checked={permission.write}
                  onChange={(e) => { setPermission({ ...permission, write: e.target.checked }) }}
                />WRITE
              </div>
            </CRow>
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton size="sm" color="danger" variant="outline" onClick={() => setOpenModel(!openModel)}><CIcon name="cil-x" />  Cancel</CButton>
          <CButton size="sm" color="primary" variant="outline" onClick={() => EditModel ? onUpdate(editEntityAccessData.id) : onSubmit()}>{EditModel ? "Update" : "Submit"} <CIcon name="cil-paper-plane" /></CButton>{' '}
        </CModalFooter>
      </CModal>

    </CRow >
  );
};

const mapStateToProps = function (state) {
  return {
    state: state,
  };
};
export default connect(mapStateToProps)(Entities);
