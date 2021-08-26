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
import { formateDate } from "../../helpers/commonHelpers";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


var usertypeList = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
];

var disabled = false;
const AddLicense = ({ match, }) => {
  let history = useHistory();
  const [formDetail, setForm] = useState({});
  const [triggers, setTriggres] = useState([]);
  const [startdate, setStartDate] = useState(new Date());
  const [formStep, setFormStep] = useState({
    first: true,
    second: false,
  });
  const [steps, setStep] = useState([
    { active: 1, label: "License Details" },
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
      const license_lableError = Validation("license_lable", formDetail.license_lable);
      const validityError = Validation("validity", formDetail.validity);
      if (license_lableError || validityError) {
        setForm({ ...formDetail, ...{ license_lableError: license_lableError, validityError: validityError } });
        disabled = 0;
        return;
      }
      setStep([
        { active: 1, label: "License Details" },
        { active: 1, label: "Confirm" },
      ]);
      setFormStep({ first: false, second: true });
    }
  };
  const BackPage = (stage) => {
    if (stage == 1) {
      setStep([
        { active: 1, label: "License Details" },
        { active: 0, label: "Confirm" },
      ]);
      setFormStep({ first: true, second: false });
    }
  };
  const handleTriggres = (e) => {
    if (e.target.checked) {
      setTriggres(item => [...item, e.target.value]);
    } else {
      setTriggres(triggers.filter(item => item !== e.target.value));
    }
  }
  const handleStartDate = (date) => {
    let newDate = date ? date : new Date();
    setStartDate(newDate);
  };
  const onSubmit = () => {
    if (disabled) {
      return;
    }
    disabled = 1;
    const license_lableError = Validation("license_lable", formDetail.license_lable);
    const validityError = Validation("validity", formDetail.validity);
    if (license_lableError || validityError) {
      setForm({ ...formDetail, ...{ license_lableError: license_lableError, validityError: validityError } });
      disabled = 0;
      return;
    }
    let body = {};
    body["license_lable"] = formDetail.license_lable;
    body["start_date"] = startdate;
    body["validity"] = formDetail.validity;
    Http("POST", apiPath.addLicense, JSON.stringify(body))
      .then((res) => {
        res = res.data;
        disabled = 0;
        console.log(res);
        if (res.status) {
          showToast(res.message);
          history.replace("/admin/licenses");
        } else {
          showDangerToast(res.message);
        }
      })
      .catch((err) => {
        disabled = 0;
        showDangerToast(err.message);
      });
  };
  useEffect(() => {
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
                    <CLabel htmlFor="Event name">Label*</CLabel>
                    <Input
                      id="license_lable"
                      placeholder="Enter License Lable"
                      name="license_lable"
                      value={formDetail.license_lable}
                      onKeyDown={(e) => { if (e.key === " ") { e.preventDefault(); } }}
                      onChange={(e) => handleChange(e, false, true)}
                      onBlur={(e) => handleBlur(e, true)}
                      error={formDetail.license_lableError}
                    />
                  </CFormGroup>
                </CRow>
                <CRow>
                  <CFormGroup className={"col-md-6 col-xs-6 float-left"}>
                    <CLabel htmlFor="name">Start Date*</CLabel>
                    <DatePicker selected={startdate === '' ? null : new Date(startdate)} className="form-control col-md-12" placeholderText="Start Date"
                      dateFormat="dd/MM/yyyy"
                      minDate={new Date()}
                      onChange={handleStartDate}
                      peekNextMonth
                      showMonthDropdown
                      showYearDropdown
                      dropdownMode="select"
                      required={true} />
                  </CFormGroup>
                  <CFormGroup className={"col-md-6 col-xs-6 float-left"}>
                    <CLabel htmlFor="name">Validity (days)*</CLabel>
                    <Input
                      type={"number"}
                      id="validity"
                      minLength="1"
                      maxLength="3"
                      min="1"
                      max="999"
                      placeholder="Please add a number between 1 and 999"
                      name="validity"
                      value={formDetail.validity}
                      onChange={(e) => handleChange(e)}
                      onBlur={(e) => handleBlur(e)}
                      error={formDetail.validityError}
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
                      <td>License Name</td>
                      <td>{formDetail.license_lable}</td>
                    </tr>
                    <tr>
                      <td>Start Date</td>
                      <td>{formateDate(startdate, "LLL")}</td>
                    </tr>
                    <tr>
                      <td>Validity</td>
                      <td>{formDetail.validity}</td>
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

export default AddLicense;
