import React, { useState, useEffect, Fragment } from "react";
import { ErrorMessage, useForm } from "react-hook-form";
import Http from "../../constants/http";
import apiPath from "../../constants/apiPath";
import {
  CCard,
  CCardBody,
  CCol,
  CRow,
  CLabel,
  CFormGroup,
  CInput,
  CCardFooter,
  CButton,
  CInputCheckbox,
  CSelect,
} from "@coreui/react";
import { useHistory } from "react-router-dom";
import CIcon from "@coreui/icons-react";
import { freeSet } from "@coreui/icons";
import { showDangerToast, showToast } from "../../components/toastMessage";

const AddEntity = ({ match }) => {
  let history = useHistory();
  var disabled = false;
  const {
    register,
    handleSubmit,
    errors,
    setError,
    clearErrors,
    watch,
  } = useForm();

  const [properties, setProperties] = useState({});

  const [btnVisible, setBtnVisible] = useState(true);
  const [isEdit, setIsEdit] = useState("");
  const [showdataTypeForm, setTypeForm] = useState(false);

  const [dataTypes, setDataTypes] = useState([
    "String",
    "Array",
    "Object",
    "Number",
    "Boolean",
  ]);
  const [selectedType, setSelectedType] = useState("String");

  const [editKey, setEditKey] = useState("-1");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    data_type: "String",
    //storeToBC: false,
    refEntity: false,
    items: {},
    properties: {},
  });

  useEffect(() => {
    console.log(properties);
  }, [properties]);

  const onSubmit = (data) => {
    console.log("properties ->", JSON.stringify(properties), JSON.stringify(properties) == JSON.stringify({}));
    if (Object.keys(properties).length == 0 || JSON.stringify(properties) == JSON.stringify({})) {
      setError("emptyProperty", {});
    } else {
      if (disabled) {
        return;
      }
      disabled = 1;
      clearErrors("emptyProperty", {});
      let body = {
        name: data.name,
        description: data.description,
        encryptAll: data.encryptAll,
        autoId: data.autoId,
        properties: properties,
      };
      Http("POST", apiPath.addEntity, JSON.stringify(body))
        .then((res) => {
          res = res.data;
          disabled = 0;
          console.log(res);
          if (res.status) {
            showToast(res.message);
            history.replace("/admin/entities");
          } else {
            showDangerToast(res.message);
          }
        })
        .catch((err) => {
          disabled = 0;
          showDangerToast(err.message);
        });
    }
  };

  const setValue = (
    propertyPath,
    value,
    obj,
    isDelete = false,
    isArrayItem = false
  ) => {
    console.log("propertyPath ------>", propertyPath, value, isArrayItem);
    let properties = Array.isArray(propertyPath)
      ? propertyPath
      : propertyPath.split(".");
    if (properties.length > 1) {
      console.log("obj[properties[0]] -->", obj[properties[0]]);
      if (
        !obj.hasOwnProperty(properties[0]) ||
        typeof obj[properties[0]] !== "object"
      )
        obj[properties[0]] = {};
      return setValue(
        properties.slice(1),
        value,
        obj[properties[0]],
        isDelete,
        isArrayItem
      );
    } else {
      if (isArrayItem) {
        obj[properties[0]] = value;
      } else if (isDelete) {
        delete obj[properties[0]];
      } else if (isEdit) {
        if (properties[0] !== "properties" && properties[0] !== "items") {
          delete obj[properties[0]];
          obj[value.name] = value;
        } else {
          delete obj[properties[0]][isEdit];
          obj[properties[0]][value.name] = value;
        }
      } else {
        obj[properties[0]][value.name] = value;
      }
      return true;
    }
  };

  const validate = (value) => {
    var paswd = /[A-Za-z_][A-Za-z0-9_]/;
    if (value.match(paswd)) {
      return true;
    } else {
      return "Invalid property name";
    }
  };

  const handleAddProperty = () => {
    if (
      formData.name != "" &&
      formData.description != "" &&
      validate(formData.name) === true
    ) {
      clearErrors(["pname", "pdescription"]);
      setBtnVisible(true);
      let currentProps = properties;
      if (editKey == "-1") {
        delete currentProps[editKey];
        setProperties({ ...currentProps, ...{ [formData.name]: formData } });
      } else {
        let propertyObj = properties;
        let formObj = formData;

        if (formObj.data_type != "Object" || formObj.data_type != "Array") {
          formObj.properties = {};
          formObj.items = {};
        }

        var propertyPath = editKey.replace(/~/g, ".");
        console.log("propertyPath =>", propertyPath, propertyObj);
        setValue(propertyPath, formObj, propertyObj);
        console.log("property after set", propertyObj);
        setProperties(propertyObj);
      }

      setFormData({
        name: "",
        description: "",
        data_type: "String",
        //storeToBC: false,
        refEntity: false,
        items: {},
        properties: {},
      });
      setEditKey("-1");
      setIsEdit(false);
    } else {
      if (formData.name == "") {
        setError("pname", { message: "Property name is required" });
      } else if (validate(formData.name) !== true) {
        setError("pname", { message: validate(formData.name) });
      }
      if (formData.description == "") {
        setError("pdescription", {});
      }
    }
  };

  const handleEditProperty = (key, val, isEdit = "") => {
    console.log("edit key", key, val);
    setEditKey(key);
    setIsEdit(isEdit);
    setBtnVisible(false);
    setFormData({
      name: val.name,
      description: val.description,
      data_type: val.data_type || "String",
      //storeToBC: val.storeToBC,
      refEntity: val.refEntity,
      items: val.items ? val.items : {},
      properties: val.properties ? val.properties : {},
    });
  };

  const handleAraryItemAdd = () => {
    setBtnVisible(true);
    let propertyObj = properties;
    let items = { data_type: selectedType, items: {}, properties: {} };
    var propertyPath = editKey.replace(/~/g, ".");
    console.log("propertyPath =>", propertyPath, propertyObj);
    setValue(propertyPath, items, propertyObj, false, true);
    console.log("property after set", propertyObj);
    setProperties(propertyObj);
    setTypeForm(false);
    setEditKey("-1");
    setBtnVisible(true);
  };

  const deleteProperty = (key) => {
    let propertyObj = { ...properties };
    setProperties({});
    var propertyPath = key.replace(/~/g, ".");
    setValue(propertyPath, {}, propertyObj, true);
    console.log("property after set", propertyObj);
    setProperties(propertyObj);
    setEditKey("-1");
  };

  const handleEditCancel = () => {
    setEditKey("-1");
    setBtnVisible(true);
    setFormData({
      name: "",
      description: "",
      data_type: "String",
      //storeToBC: false,
      refEntity: false,
      items: {},
      properties: {},
    });
  };

  const _renderPropertForm = (val) => {
    return (
      <CFormGroup className="my-0 mt-5 ml-2">
        <CRow className="mr-2">
          <CFormGroup className="mr-0 col-md-3 col-xs-3">
            <input
              type="text"
              id="property"
              name="pname"
              placeholder="Please add an property"
              autoComplete="off"
              className="form-control col-md-12 col-xs-12"
              value={formData.name}
              ref={register({
                required: "Required",
              })}
              onChange={(e) => {
                if (e.target.value != "" && validate(e.target.value) === true) {
                  clearErrors("pname");
                } else if (validate(e.target.value) !== true) {
                  setError("pname", { message: validate(e.target.value) });
                }
                setFormData({ ...formData, name: e.target.value });
              }}
            />
            {errors.pname && (
              <p className="text-danger marginmessage">
                {errors.pname.message}
              </p>
            )}
          </CFormGroup>
          <CFormGroup className="col-md-3 col-xs-3">
            <input
              type="text"
              id="property-description"
              name="pdescription"
              placeholder="Please add a property description"
              value={formData.description}
              onChange={(e) => {
                if (formData.description != "") {
                  clearErrors("pdescription");
                }
                setFormData({ ...formData, description: e.target.value });
              }}
              autoComplete="off"
              className="form-control col-md-12 col-xs-12"
              ref={register({ required: "Required" })}
            />
            {errors.pdescription && (
              <p className="text-danger marginmessage">
                Property description is required
              </p>
            )}
          </CFormGroup>
          <CFormGroup className="col-md-3 col-xs-3">
            <CSelect
              custom
              size="md"
              name="data_type"
              id="selectLg"
              value={formData.data_type}
              onChange={(e) => {
                setFormData({ ...formData, data_type: e.target.value });
              }}
            >
              {dataTypes.map((ele, ind) => {
                return (
                  <option value={ele} key={ind}>
                    {ele}
                  </option>
                );
              })}
            </CSelect>
          </CFormGroup>
          <CFormGroup size="md" className="col-md-3 col-xs-3 text-right">
            <span onClick={handleAddProperty} style={{ cursor: "pointer" }}>
              <CIcon
                name="cil-check-circle"
                size="lg"
                className="mr-2 text-success"
              />
            </span>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => {
                handleEditCancel();
              }}
            >
              <CIcon name="cil-x-circle" size="lg" className="mr-2 text-danger" />
            </span>
          </CFormGroup>
        </CRow>
        {/* <CFormGroup variant="custom-checkbox" className="mt-2" inline>
          <CInputCheckbox
            custom
            id="inline-checkbox3"
            name="toBlockchain"
            checked={formData.storeToBC}
            onChange={(e) => {
              setFormData({ ...formData, storeToBC: e.target.checked });
            }}
          />
          <CLabel variant="custom-checkbox" htmlFor="inline-checkbox3">
            Store to Blockchain
          </CLabel>
        </CFormGroup> */}
        {/* <CFormGroup variant="custom-checkbox" className="mt-2" inline>
          <CInputCheckbox
            custom
            id="inline-checkbox4"
            name="refEntity"
            checked={formData.refEntity}
            onChange={(e) => {
              setFormData({ ...formData, refEntity: e.target.checked });
            }}
          />
          <CLabel variant="custom-checkbox" htmlFor="inline-checkbox4">
            RefEntity
          </CLabel>
        </CFormGroup> */}
      </CFormGroup>
    );
  };

  const dataTypeForm = (val) => {
    return (
      <CFormGroup row className="my-0 mt-2">
        <CCol xs="2" md="2" size="md">
          <CSelect
            custom
            size="md"
            name="data-type"
            id="selectLg"
            value={selectedType || 'String'}
            onChange={(e) => {
              setSelectedType(e.target.value);
            }}
          >
            {dataTypes.map((ele, ind) => {
              return (
                <option key={ind} value={ele}>
                  {ele}
                </option>
              );
            })}
          </CSelect>
        </CCol>
        <CCol xs="4" md="4" size="md" className="text-right">
          <span onClick={handleAraryItemAdd} style={{ cursor: "pointer" }}>
            <CIcon
              name="cil-check-circle"
              size="lg"
              className="mr-2 text-success"
            />
          </span>
          <span onClick={handleEditCancel} style={{ cursor: "pointer" }}>
            <CIcon name="cil-x-circle" size="lg" className="mr-2 text-danger" />
          </span>
        </CCol>
      </CFormGroup>
    );
  };

  const _renderPropertyViewer = (val, key, margin = 0) => {
    return (
      <Fragment key={key + 1}>
        <CCol xs="8">
          <CFormGroup style={{ marginLeft: margin }}>
            <strong> {val.name}</strong>
            <span className={"ml-5"}>{val.data_type}</span>
          </CFormGroup>
        </CCol>
        <CCol xs="4" md="4" size="md" className="text-right">
          {btnVisible &&
            ((val.data_type == "Array" && !val.items.data_type) ||
              val.data_type == "Object") && (
              <span
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  setBtnVisible(false);
                  if (val.data_type == "Array") {
                    setTypeForm(true);
                    setEditKey(key + ".items");
                  } else {
                    handleEditProperty(key + ".properties" + "", formData);
                  }
                }}
              >
                <CIcon
                  content={freeSet.cilPlus}
                  size="lg"
                  className="mr-2 text-success"
                />
              </span>
            )}
          {btnVisible && (
            <span
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                handleEditProperty(key + "", val, val.name);
              }}
            >
              <CIcon
                name="cil-pencil"
                size="lg"
                className="mr-2 text-success"
              />
            </span>
          )}
          {btnVisible && (
            <span
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                deleteProperty(key + "");
              }}
            >
              <CIcon name="cil-trash" size="lg" className="mr-2 text-danger" />
            </span>
          )}
        </CCol>

        {val.data_type == "Array" && val.items.data_type && (
          <>
            <CCol xs="8">
              <CFormGroup style={{ marginLeft: margin }}>
                Items Type <strong> {val.items.data_type} </strong>
              </CFormGroup>
            </CCol>
            <CCol xs="4" md="4" size="md" className="text-right">
              {btnVisible && val.items && val.items.data_type == "Object" && (
                <span
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    setBtnVisible(true);
                    if (val.items.data_type == "Array") {
                      setEditKey(key + ".items");
                    } else {
                      handleEditProperty(
                        key + ".items" + ".properties" + "",
                        formData
                      );
                    }
                  }}
                >
                  <CIcon
                    content={freeSet.cilPlus}
                    size="lg"
                    className="mr-2 text-success"
                  />
                </span>
              )}
              {btnVisible && (
                <span
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    deleteProperty(key);
                  }}
                >
                  <CIcon
                    name="cil-trash"
                    size="lg"
                    className="mr-2 text-danger"
                  />
                </span>
              )}
            </CCol>

            {val.items.properties &&
              Object.entries(val.items.properties).map(([key2, property], i) =>
                _renderPropertyViewer(
                  property,
                  key + ".items" + "." + "properties." + key2,
                  margin + 16
                )
              )}
          </>
        )}

        {((val.data_type == "Array" &&
          key + ".items" + ".properties" == editKey) ||
          (val.data_type == "Object" && key + ".properties" == editKey) ||
          key == editKey) &&
          !showdataTypeForm && <CCol xs="12"> {_renderPropertForm()}</CCol>}

        {val.data_type == "Array" &&
          key + ".items" == editKey &&
          showdataTypeForm && <CCol xs="12"> {dataTypeForm()}</CCol>}

        {Object.entries(val.properties).map(([key2, property], i) =>
          _renderPropertyViewer(
            property,
            key + "." + "properties." + key2,
            margin + 16
          )
        )}
      </Fragment>
    );
  };

  return (
    <CRow>
      <CCol lg={12}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CCard>
            <CCardBody>
              <CFormGroup row className="my-0">
                <CCol xs="6">
                  <CFormGroup>
                    <CLabel htmlFor="name">Entity Name</CLabel>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      onKeyDown={(e) => {
                        if (e.key === " ") {
                          e.preventDefault();
                        }
                      }}
                      placeholder="Please add an entity name"
                      autoComplete="off"
                      className="form-control col-md-8"
                      ref={register({
                        required: "Required",
                      })}
                    />
                    {errors.name && (
                      <p className="text-danger marginmessage">
                        Entity name is required
                      </p>
                    )}
                  </CFormGroup>
                </CCol>
                <CCol xs="6">
                  <CFormGroup>
                    <CLabel htmlFor="description">Entity Description</CLabel>
                    <input
                      type="text"
                      id="description"
                      name="description"
                      placeholder="Please add an entity description"
                      autoComplete="off"
                      className="form-control col-md-8"
                      ref={register({ required: "Required" })}
                    />
                    {errors.description && (
                      <p className="text-danger marginmessage">
                        Description is required
                      </p>
                    )}
                  </CFormGroup>
                </CCol>
              </CFormGroup>
              <CFormGroup>
                <CFormGroup variant="custom-checkbox" inline>
                  <input
                    type={"checkbox"}
                    className={"custom-control-input"}
                    id="inline-checkbox1"
                    ref={register}
                    name="autoId"
                    value={1}
                  />
                  <CLabel variant="custom-checkbox" htmlFor="inline-checkbox1">
                    autoId
                  </CLabel>
                </CFormGroup>
                <CFormGroup variant="custom-checkbox" inline>
                  <input
                    type={"checkbox"}
                    className={"custom-control-input"}
                    id="inline-checkbox2"
                    ref={register}
                    name="encryptAll"
                    value={1}
                  />
                  <CLabel variant="custom-checkbox" htmlFor="inline-checkbox2">
                    encryptAll
                  </CLabel>
                </CFormGroup>
              </CFormGroup>
              <hr />
              <CFormGroup row className="my-0 mb-2">
                {typeof properties == "object" &&
                  Object.entries(properties).map(([key, property], i) =>
                    _renderPropertyViewer(property, key)
                  )}
              </CFormGroup>
              {btnVisible && (
                <CFormGroup>
                  <span
                    onClick={() => {
                      setBtnVisible(false);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <CIcon content={freeSet.cilPlus} /> Add Main Property{" "}
                  </span>
                </CFormGroup>
              )}
              {!btnVisible && editKey == "-1" && _renderPropertForm()}
              {errors.emptyProperty && (
                <p className="text-danger marginmessage">
                  Please add atleast one property
                </p>
              )}
            </CCardBody>

            <CCardFooter>
              <CButton onClick={() => history.goBack()} type="reset" variant="outline" size="sm" color="danger">
                <CIcon content={freeSet.cilArrowLeft} /> Back
              </CButton>
              <CButton className="ml-2" type="submit" variant="outline" size="sm" color="primary">
                Submit <CIcon name="cil-paper-plane" />
              </CButton>
            </CCardFooter>
          </CCard>
        </form>
      </CCol>
    </CRow>
  );
};

export default AddEntity;
