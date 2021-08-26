import React, { useState, useEffect } from "react";
import { useHistory, useLocation, Link } from "react-router-dom";
import { CBadge, CLabel, CCard, CCardBody, CSelect, CCardHeader, CFormGroup, CCol, CDataTable, CRow, CPagination, CInputCheckbox, CButton, CCollapse, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, } from "@coreui/react";
import { connect, useDispatch } from "react-redux";
import Http from "../../constants/http";
import apiPath from "../../constants/apiPath";
import { ErrorMessage, useForm } from "react-hook-form";
import { showAlert, showDangerToast, showToast, SwalConfig, confirmAlert } from "../../components/toastMessage";
import CIcon from "@coreui/icons-react";
import { freeSet } from "@coreui/icons";
import { formateDate } from "../../helpers/commonHelpers";
import Swal from "sweetalert";

const DataExplorer = (props) => {
  var disabled = false;
  const { register, handleSubmit, errors, setError, reset, clearErrors, watch, } = useForm();
  const history = useHistory();
  const [EntityData, setEntityData] = useState([]);
  const [Users, setUsersData] = useState([]);
  const [openModel, setOpenModel] = useState(false);
  const [openTransferModel, setopenTransferModel] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState({});
  const [selectedTransaction, setSelectedTransaction] = useState("");
  const [TransferUserId, setTransferUserId] = useState({});
  const [formDetail, setForm] = useState({});
  const [tableData, setData] = useState([]);
  const [details, setDetails] = useState([]);
  const [editDetail, setEditDetail] = useState();
  const [isEdit, setEdit] = useState(false);

  const byString = (o, s) => {
    s = s.replace(/\[(\w+)\]/g, ".$1"); // convert indexes to properties
    s = s.replace(/^\./, ""); // strip a leading dot
    var a = s.split(".");
    for (var i = 0, n = a.length; i < n; ++i) {
      var k = a[i];
      if (k in o) {
        o = o[k];
      } else {
        return;
      }
    }
    return o;
  };
  const getInputType = (type) => {
    switch (type) {
      case "String":
        return "text";
      case "text":
        return "number";
      case "Boolean":
        return "checkbox";
      default:
        return "text";
    }
  };
  const getSelectedEntitySChema = (entityId) => {
    reset();
    Http("GET", apiPath.getEntityDetails + "/" + entityId)
      .then((res) => {
        res = res.data;
        if (res.status) {
          setSelectedEntity(res.data || {});
          getData(entityId);
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
          setEntityData(res.data);
          getSelectedEntitySChema(res.data[0]._id);
        } else {
          showDangerToast(res.message);
        }
      })
      .catch((err) => {
        showDangerToast(err.message);
      });
  };
  const onSubmit = (data) => {
    if (disabled) {
      return;
    }
    disabled = 1;
    let newData = { asset: data, entity_id: selectedEntity._id }
    Http("POST", apiPath.addEntityData, JSON.stringify(newData))
      .then((res) => {
        res = res.data;
        disabled = 0;
        if (res.status) {
          getData(selectedEntity._id);
          showToast(res.message);
          setOpenModel(false);
          reset();
        } else {
          showDangerToast(res.message);
        }
      })
      .catch((err) => {
        disabled = 0;
        showDangerToast(err.message);
      });
  };
  const fields = [
    { key: "transaction_id", label: "Transaction Id", _style: { width: "30%" } },
    { key: "operation", label: "Operation", _style: { width: "15%" } },
    { key: "user_id", label: "User Id", _style: { width: "20%" } },
    { key: "company_id", label: "Company Id", _style: { width: "20%" } },
    {
      key: "show_details",
      label: "Actions",
      _style: { width: "15%" },
      sorter: false,
      filter: false,
    },
  ];
  const getData = (id) => {
    Http("GET", apiPath.listDataByEntity + "/" + id)
      .then((res) => {
        res = res.data;
        if (res.status) {
          res.data = res.data.map((ele, ind) => {
            ele.operation = ele.operation;
            ele.user_id = ele.metadata.user_id;
            ele.company_id = ele.metadata.company_id;
            ele.transaction_id = ele.id
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
  const transferTranactionData = async (id) => {
    setSelectedTransaction(id);
    setopenTransferModel(true);

  };
  const deleteTranactionData = async (id) => {
    let SwalData = SwalConfig("You want to burn the transaction : \n\n " + id);
    const result = await Swal(SwalData);
    if (result) {
      Http("DELETE", apiPath.DeleteData + "/" + id)
        .then((res) => {
          res = res.data;
          getData(selectedEntity._id);
          showToast(res.message);
        })
        .catch((err) => {
          showDangerToast(err.message);
        });
    }
  }
  const onSubmitTransfer = async () => {
    console.log("data------>", TransferUserId, selectedTransaction);
    let SwalData = SwalConfig("You want to transfer the transaction");
    const result = await Swal(SwalData);
    if (result) {
      let newData = { user: TransferUserId }
      Http("POST", apiPath.TransferData + "/" + selectedTransaction, JSON.stringify(newData))
        .then((res) => {
          res = res.data;
          getData(selectedEntity._id);
          showToast(res.message);
          reset();
          setopenTransferModel(false);
        })
        .catch((err) => {
          showDangerToast(err.message);
        });
    }
  }
  const getusers = (page = 1) => {
    Http("GET", apiPath.ownerList)
      .then((res) => {
        res = res.data;
        if (res.status) {
          showToast(res.message);
          delete res.data[0];
          setUsersData(res.data);
        } else {
          showDangerToast(res.message);
        }
      })
      .catch((err) => {
        showDangerToast(err.message);
      });
  };
  const convertSchemaToValue = (properties, key = "") => {
    Object.entries(properties).map(([key2, property], i) => {
      if (property.data_type !== "Object" && property.data_type !== "Array") {
        if (key) {
          formDetail.key2 = "";
        } else {
          formDetail.key = "";
        }
      } else if (property.data_type === "Object") {
        convertSchemaToValue(property.properties, key + key2);
      } else if (property.data_type === "Array") {
      }
    });
  };
  const renderForm = (val, key) => {
    return (
      <CFormGroup className="mr-0" key={key}>
        {val.data_type !== "Object" && val.data_type !== "Array" && (
          <div className="form-group row">
            <div className={"col-md-2"}>
              <label className="col-form-label">{val.name} :</label>
            </div>
            <div
              className={val.data_type === "Boolean" ? "col-md-1" : "col-md-8"}
            >
              <input
                type={getInputType(val.data_type)}
                id="property"
                name={key}
                placeholder="Please add an property"
                autoComplete="off"
                className="form-control col-md-12"
                defaultValue={
                  isEdit && byString(editDetail, key)
                    ? byString(editDetail, key)
                    : ""
                }
                ref={register({
                  required: val.data_type === "Boolean" ? "" : "Required",
                })}
              />
              {byString(errors, key) && (
                <p className="text-danger mt-1">
                  {byString(errors, key + ".message")}
                </p>
              )}
            </div>
          </div>
        )}
        {val.data_type == "Object" && (
          <>
            <b>{val.name.toUpperCase()} :</b>
            <CFormGroup>
              {val &&
                typeof val.properties == "object" &&
                Object.entries(val.properties).map(([key2, property], i) =>
                  renderForm(property, key + "." + key2)
                )}
            </CFormGroup>
          </>
        )}
        {val.data_type == "Array" && (
          <>
            <div className="row">
              <b className="col-md-10">{val.name.toUpperCase()} :</b>
              {/* <CIcon
                content={freeSet.cilPlus}
                style={{ cursor: "pointer", width: "3%", height: "5%" }}
              /> */}
            </div>
            <CFormGroup style={{ marginLeft: 100 }}>
              {val &&
                val.items.data_type == "Object" &&
                typeof val.items.properties == "object" &&
                Object.entries(
                  val.items.properties
                ).map(([key2, property], i) =>
                  renderForm(property, key + "." + key2)
                )}
              {val &&
                val.items &&
                val.items.data_type != "Array" &&
                val.items.data_type !== "Object" && (
                  <CFormGroup>
                    <div
                      className={
                        val.items.data_type === "Boolean"
                          ? "col-md-1"
                          : "col-md-8"
                      }
                    >
                      <input
                        type={getInputType(val.items.data_type)}
                        id="property"
                        name={key}
                        placeholder="Please add an property"
                        autoComplete="off"
                        className="form-control"
                        defaultValue={
                          isEdit && byString(editDetail, key)
                            ? byString(editDetail, key)
                            : ""
                        }
                        ref={register({
                          required:
                            val.items.data_type === "Boolean" ? "" : "Required",
                        })}
                      />
                      {errors[key] && (
                        <p className="text-danger mt-1">
                          {errors[key].message}
                        </p>
                      )}
                    </div>
                  </CFormGroup>
                )}
            </CFormGroup>
          </>
        )}
      </CFormGroup>
    );
  };

  useEffect(() => {
    getusers();
    getEntityData();
  }, []);


  return (
    <CRow>
      <CCol xl={12}>
        <CCard>
          <CCardHeader>Data Explorer</CCardHeader>
          <CCardBody>
            <CSelect
              custom
              size="md"
              className="col-3 mb-2"
              name="data_type"
              id="selectLg"
              value={selectedEntity._id}
              onChange={(e) => {
                getSelectedEntitySChema(e.target.value);
              }}
            >
              {EntityData.map((ele, ind) => {
                return (
                  <option key={ind} value={ele._id}>
                    {ele.name}
                  </option>
                );
              })}
            </CSelect>
            <CButton
              size="md"
              color="light"
              className="col-1 mr-2 float-right "
            //onClick={(e) => { handelOpenModel() }}
            >
              <span className="cil-filter btn-icon mr-2"></span>
              Filter
            </CButton>
            <CButton
              size="md"
              color="info"
              className="col-1 mr-2 float-right"
              onClick={(e) => {
                setOpenModel(true);
              }}
            >
              {" "}
              Insert
            </CButton>
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
                transaction_id: (item) => (
                  <td className={`${item.metadata.status === 'BURNED' ? 'text-danger' : ''}`}>
                    {item.transaction_id}
                  </td>
                ),
                created_at: (item) => (
                  <td>
                    {formateDate(item, "LLL")}
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
                      {item.metadata.status != 'BURNED' && <CButton
                        color="info"
                        variant="outline"
                        shape="square"
                        className="ml-1"
                        size="sm"
                        onClick={(e) => {
                          transferTranactionData(item.id);
                        }}
                      >
                        Transfer
                      </CButton>}
                      {item.metadata.status != 'BURNED' && <CButton
                        color="danger"
                        variant="outline"
                        shape="square"
                        className="ml-1"
                        size="sm"
                        onClick={() => {
                          deleteTranactionData(item.id);
                        }}
                      >
                        Burn
                      </CButton>}
                    </td>
                  );
                },
                details: (item, index) => {
                  return (
                    <CCollapse show={details.includes(index)}>
                      <CCardBody>
                        <label>Properties : </label> <pre>{JSON.stringify(item, null, 2)}</pre>
                      </CCardBody>
                    </CCollapse>
                  );
                },
              }}
            />
          </CCardBody>
        </CCard>
      </CCol>
      <CModal
        show={openModel}
        onClose={() => {
          reset();
          setOpenModel(!openModel);
        }}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <CModalHeader closeButton>
            <CModalTitle>Insert new {selectedEntity.name} record</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <b>PROPERTIES :</b>
            <CFormGroup style={{ marginLeft: 50 }}>
              {selectedEntity &&
                typeof selectedEntity.properties == "object" &&
                Object.entries(
                  selectedEntity.properties
                ).map(([key, property], i) => renderForm(property, key))}
            </CFormGroup>
          </CModalBody>
          <CModalFooter>
            <CButton type={"submit"} color="primary" onClick={() => { }}>
              {isEdit ? "Update" : "Insert"} Record
            </CButton>{" "}
            <CButton
              color="secondary"
              onClick={() => {
                reset();
                setOpenModel(false);
              }}
            >
              Cancel
            </CButton>
          </CModalFooter>
        </form>
      </CModal>
      <CModal
        show={openTransferModel}
        onClose={() => {
          reset();
          setopenTransferModel(!openTransferModel);
        }}
        size="lg"
      >
        <form>
          <CModalHeader>
            <CModalTitle>Tranfer Record</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CRow>
              <CFormGroup className={"col-md-3 col-xs-6 float-right"}><CLabel htmlFor="User">Select User For Transfer</CLabel> </CFormGroup>
              <CFormGroup className={"col-md-9 col-xs-6 float-left"}>
                <CSelect
                  custom
                  className={"col-md-6"}
                  size="md"
                  name="user_id"
                  id="selectLg"
                  ref={register({ required: true })}
                  value={TransferUserId}
                  onChange={(e) => setTransferUserId(e.target.value)}
                >
                  {Users.map((ele, ind) => {
                    return <option key={ind} value={ele._id}>{ele.username}  ({ele.email})</option>;
                  })}
                </CSelect>
              </CFormGroup>
            </CRow>
          </CModalBody>
          <CModalFooter>
            <CButton type={"button"} color="primary" onClick={(e) => { onSubmitTransfer() }}>
              Transfer Record
            </CButton>{" "}
            <CButton
              color="secondary"
              onClick={() => {
                reset();
                setopenTransferModel(false);
              }}
            > Cancel
            </CButton>
          </CModalFooter>
        </form>
      </CModal>
    </CRow>
  );
};

const mapStateToProps = function (state) {
  return {
    state: state,
  };
};

export default connect(mapStateToProps)(DataExplorer);
