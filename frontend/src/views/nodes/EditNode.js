import React, { Fragment, useState, useEffect } from "react";
import Error from "../../components/errorMessage";
import { CCard, CCardBody, CCardHeader, CCol, CRow, CLabel, CFormGroup, CInput, CSelect, CCardFooter, CButton, CInputCheckbox, } from "@coreui/react";
import Input from "../../components/Input";
import Select from "../../components/select";
import Http from "../../constants/http";
import apiPath from "../../constants/apiPath";
import Validation from "../../validations/validation_wrapper";
import { showAlert, showDangerToast, showToast } from "../../components/toastMessage";
import Stepper from "../../components/Stepper";
import CIcon from "@coreui/icons-react";
import { freeSet } from "@coreui/icons";
import { useHistory } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Licenses from "../licenses/Licenses";
var disabled = false;
const EditLicense = (props) => {
  let history = useHistory();
  const [formDetail, setForm] = useState({});
  const [licences, setLicences] = useState([]);
  const [triggers, setTriggres] = useState([]);
  const [formStep, setFormStep] = useState({
    first: true,
    second: false,
  });

  const [steps, setStep] = useState([
    { active: 1, label: "Node Details" },
    { active: 0, label: "Confirm" },
  ]);

  const handleChange = (evt, onlyNumber = false, trim = false) => {
    console.log(evt);
    const value = trim ? evt.target.value.trim() : evt.target.value;
    var error = Validation(evt.target.name, value, formDetail.password);
    var formObj = {};
    formObj[evt.target.name + "Error"] = error;
    formObj[evt.target.name] = onlyNumber ? value.replace(/[^0-9]+/g, "") : value;
    setForm({ ...formDetail, ...formObj, });
  };
  const handleBlur = (evt, trim = false) => {
    const value = trim ? evt.target.value.trim() : evt.target.value;
    var error = Validation(evt.target.name, value, formDetail.password);
    var formObj = {};
    formObj[evt.target.name + "Error"] = error;
    setForm({
      ...formDetail,
      ...formObj,
    });
  };
  const nextPage = (stage) => {
    if (stage == 1) {
      const node_licenceError = Validation("node_licence", formDetail.node_licence);
      if (node_licenceError) {
        setForm({ ...formDetail, ...{ node_licenceError: node_licenceError } });
        disabled = 0;
        return;
      }
      setStep([
        { active: 1, label: "Node Details" },
        { active: 1, label: "Confirm" },
      ]);
      setFormStep({ first: false, second: true });
    }
  };
  const BackPage = (stage) => {
    if (stage == 1) {
      setStep([
        { active: 1, label: "Node Details" },
        { active: 0, label: "Confirm" },
      ]);
      setFormStep({ first: true, second: false });
    }
  };

  const onSubmit = () => {
    if (disabled) {
      return;
    }
    disabled = 1;
    const node_licenceError = Validation("node_licence", formDetail.node_licence);
    if (node_licenceError) {
      setForm({ ...formDetail, ...{ node_licenceError: node_licenceError } });
      disabled = 0;
      return;
    }
    let body = {};
    body["licence_id"] = formDetail.node_licence;
    Http("PUT", apiPath.editNode + props.match.params.id, JSON.stringify(body))
      .then((res) => {
        res = res.data;
        disabled = 0;
        console.log(res);
        if (res.status) {
          showToast(res.message);
          history.replace("/admin/nodes");
        } else {
          showDangerToast(res.message);
        }
      })
      .catch((err) => {
        disabled = 0;
        showDangerToast(err.message);
      });
  };

  const getData = () => {
    Http("GET", apiPath.viewNode + "/" + props.match.params.id)
      .then((res) => {
        res = res.data;
        if (res.status) {
          showToast(res.message);
          setForm({ ...res.data, ...{ node_licence: res.data.licence_id && res.data.licence_id._id || "" } })
        } else {
          showDangerToast(res.message);
        }
      })
      .catch((err) => {
        showDangerToast(err.message);
      });
  };

  const getLabel = (arr, id) => {
    let lable = ""
    arr.filter(ele => {
      if (ele.value == id) {
        lable = ele.label || ele.license_lable
      }
    })
    console.log(arr, id, lable)
    return lable
  }

  const getLicenceData = () => {
    Http("GET", apiPath.getLicense)
      .then((res) => {
        res = res.data;
        if (res.status) {
          showToast(res.message);
          res.data = res.data || [];
          res.data = res.data.map(ele => {
            ele.label = ele.license_lable;
            ele.value = ele._id;
            return ele;
          })
          setLicences(res.data);
        } else {
          showDangerToast(res.message);
        }
      })
      .catch((err) => {
        showDangerToast(err.message);
      });
  };

  useEffect(() => {
    getData()
    getLicenceData()
  }, []);

  return (
    <CRow>
      <CCol lg={12}>
        <CCard>
          <Stepper steps={steps} />
          {formStep.first && (
            <Fragment>
              <CCardBody>
                <CRow>
                  <CFormGroup className={"col-md-6 col-xs-6 float-left"}>
                    <CLabel htmlFor="Event name">Node name*</CLabel>
                    <Input
                      id="license_lable"
                      placeholder="Enter node name"
                      name="node_name"
                      disabled={true}
                      value={formDetail.node_name}
                      onKeyDown={(e) => { if (e.key === " ") { e.preventDefault(); } }}
                      onChange={(e) => handleChange(e, false, true)}
                      onBlur={(e) => handleBlur(e, true)}
                      error={formDetail.node_name_error}
                    />
                  </CFormGroup>
                  <CFormGroup className={"col-md-6 col-xs-6 float-left"}>
                    <CLabel htmlFor="vat">Node Licence</CLabel>
                    <Select
                      className="custom-select form-control"
                      name="node_licence"
                      value={formDetail.node_licence}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      optionList={licences}
                      title={"Node licence"}
                      error={formDetail.node_licenceError}
                    />
                  </CFormGroup>
                </CRow>
              </CCardBody>
              <CCardFooter>
                <CButton
                  type="button"
                  size="sm"
                  color="danger"
                  variant="outline"
                  className="mr-1"
                  onClick={() => history.goBack()}
                >
                  <CIcon content={freeSet.cilArrowLeft} /> Back
                </CButton>
                <CButton
                  type="button"
                  size="sm"
                  color="primary"
                  variant="outline"
                  className="mr-1"
                  onClick={(e) => {
                    nextPage(1);
                  }}
                >
                  Next <CIcon content={freeSet.cilArrowRight} />
                </CButton>
              </CCardFooter>
            </Fragment>
          )}

          {formStep.second && (
            <Fragment>
              <CCardBody>
                <table className="table">
                  <tbody>
                    <tr>
                      <td>Node Name</td>
                      <td>{formDetail.node_name}</td>
                    </tr>
                    <tr>
                      <td>Node Licence</td>
                      <td>{getLabel(licences, formDetail.node_licence)}</td>
                    </tr>
                  </tbody>
                </table>
              </CCardBody>
              <CCardFooter>
                <CButton
                  type="button"
                  size="sm"
                  color="danger"
                  variant="outline"
                  className="mr-1"
                  onClick={(e) => {
                    BackPage(1);
                  }}
                >
                  <CIcon content={freeSet.cilArrowLeft} />  Back
                </CButton>
                <CButton
                  type="submit"
                  size="sm"
                  color="primary"
                  variant="outline"
                  className="mr-1"
                  onClick={(e) => {
                    onSubmit();
                  }}
                > Submit <CIcon name="cil-paper-plane" />
                </CButton>
              </CCardFooter>

            </Fragment>
          )}
        </CCard>
      </CCol>
    </CRow>
  );
};

export default EditLicense;
