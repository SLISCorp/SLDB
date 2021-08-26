import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCol, CForm, CFormGroup, CFormText, CInput, CLabel, CRow, } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { freeSet } from "@coreui/icons";
import Http from "../../../constants/http";
import apiPath from "../../../constants/apiPath";
import Validation from "../../../validations/validation_wrapper";
import { useHistory } from "react-router-dom";
import { showAlert, showDangerToast, showToast, } from "../../../components/toastMessage";
var disable = false;

const Setting = (props) => {
  let history = useHistory();
  const UserID = useSelector((state) => state.user._id);
  const id = props.match.params.id ? props.match.params.id : UserID;
  const [formDetail, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (evt, onlyNumber = false) => {
    const value = evt.target.value;
    var error = Validation(evt.target.name, value, formDetail.password);
    var formObj = {};
    formObj[evt.target.name + "Error"] = error;
    formObj[evt.target.name] = onlyNumber
      ? value.replace(/[^0-9]+/g, "")
      : value;

    setForm({
      ...formDetail,
      ...formObj,
    });
  };
  const handleBlur = (evt) => {
    const value = evt.target.value;
    var error = Validation(evt.target.name, value, formDetail.password);
    var formObj = {};
    formObj[evt.target.name + "Error"] = error;
    setForm({
      ...formDetail,
      ...formObj,
    });
  };
  const submitForm = () => {
    if (disable) return;
    disable = 1;

    let passwordError = Validation("password", formDetail.password);
    let confirm_passwordError = Validation(
      "confirm_password",
      formDetail.confirm_password,
      formDetail.password
    );
    console.log(formDetail);
    if (confirm_passwordError || passwordError) {
      setForm({
        ...formDetail,
        ...{
          confirm_passwordError: confirm_passwordError,
          passwordError: passwordError,
        },
      });
      disable = false;
      return;
    }

    let body = {};
    body["id"] = id;
    body["password"] = formDetail.password;
    setLoading(true);
    Http("POST", apiPath.adminChangePassword, JSON.stringify(body))
      .then((response) => {
        disable = false;
        response = response.data;
        if (response.status) {
          showToast(response.msg);
          props.history.goBack();
        } else {
          setLoading(false);
          showDangerToast(response.msg);
          if (response.isOtpverified === 0) {
            props.history.push("/otp-verify/" + response.result.user_id);
          } else {
            //  this.setState({ loginModal:false })
          }
        }
      })
      .catch((err) => {
        disable = false;
        setLoading(false);
      });
  };
  useEffect(() => { }, []);

  return (
    <>
      <CRow>
        <CCol xs="12" sm="6">
          <CCard>
            <CCardHeader>
              Change
              <small> Password</small>
            </CCardHeader>
            <CCardBody>
              <CFormGroup>
                <CLabel htmlFor="nf-email">New Password</CLabel>
                <CInput
                  id="title"
                  type="password"
                  placeholder="Enter your password"
                  name="password"
                  value={formDetail.password}
                  onBlur={(e) => handleBlur(e)}
                  onChange={(e) => handleChange(e)}
                />
                <CFormText className="help-block">
                  {formDetail.passwordError}
                </CFormText>
              </CFormGroup>
              <CFormGroup>
                <CLabel htmlFor="nf-password">Confirm Password</CLabel>
                <CInput
                  id="title2"
                  type="password"
                  placeholder="Enter your confirm password"
                  name="confirm_password"
                  value={formDetail.confirm_password}
                  onBlur={(e) => handleBlur(e)}
                  onChange={(e) => handleChange(e)}
                />
                <CFormText className="help-block">
                  {formDetail.confirm_passwordError}
                </CFormText>
              </CFormGroup>
            </CCardBody>
            <CCardFooter>
              <CButton type="reset" size="sm" variant="outline" color="danger" onClick={() => history.goBack()}>
                <CIcon content={freeSet.cilArrowLeft} />  Back
              </CButton>
              {" "}
              <CButton
                type="submit"
                variant="outline"
                size="sm"
                color="primary"
                onClick={() => {
                  submitForm();
                }}              >
                Submit  <CIcon name="cil-paper-plane"  />
              </CButton>
            </CCardFooter>
          </CCard>
        </CCol>
      </CRow>
    </>
  );
};

export default Setting;
