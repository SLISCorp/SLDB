import React, { useState, useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import Recaptcha from "react-recaptcha";
import { loadScript } from "../../../helpers/commonHelpers";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';
import { CButton, CCard, CCardBody, CCardGroup, CCol, CContainer, CForm, CFormGroup, CSidebarBrand, CInput, CInputGroup, CInputGroupPrepend, CInputGroupText, CRow, } from "@coreui/react";
import Input from "../../../components/Input";
import CIcon from "@coreui/icons-react";
import { freeSet } from "@coreui/icons";
import Http from "../../../constants/http";
import apiPath from "../../../constants/apiPath";
import Validation from "../../../validations/validation_wrapper";
import {
  showAlert,
  showDangerToast,
  showToast,
} from "../../../components/toastMessage";
import Session from "../../../helpers/session";
import logo from "../../../assets/logos/sldb.png";

var disable = false;

const ResetPassword = (props) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState(atob(props.match.params.id))
  const {
    register,
    handleSubmit,
    errors,
    setError,
    clearErrors,
    watch,
  } = useForm();
  useEffect(() => {
    loadScript("https://www.google.com/recaptcha/api.js", (done) => { });
  }, []);

  const submitForm = (formDetail) => {
    if (disable) return;
    let body = {};
    body["password"] = formDetail.password;
    body["confirm_password"] = formDetail.c_password;
    body["id"] = id;

    setLoading(true);
    Http("POST", apiPath.adminResetPassword, JSON.stringify(body))
      .then((response) => {
        disable = false;
        response = response.data;
        if (response.status) {
          showToast(response.msg);
          setLoading(false);
          props.history.replace("/");
        } else {
          setLoading(false);
          showDangerToast(response.msg);
          if (response.isOtpverified === 0) {
            props.history.push("/otp-verify/" + response.result.user_id);
            // this.setState({ otpView: true, user_id: response.result.user_id });
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



  return (
    <div className="c-app login-height c-default-layout flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md="6" className="mb-5">
            <CSidebarBrand className="d-md-down-none" to="/">
              <img src={logo} alt={"Logo"} width={250} />
            </CSidebarBrand>
          </CCol>
        </CRow>
        <CRow className="justify-content-center">
          <CCol md="6" >
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <form onSubmit={handleSubmit(submitForm)}>
                    <h1>Reset Password</h1>
                    <p className="text-muted">Please reset your password</p>
                    <CFormGroup>
                      <CInputGroup className="mb-2">
                        <CInputGroupPrepend>
                          <CInputGroupText>
                            <CIcon name="cil-user" />
                          </CInputGroupText>
                        </CInputGroupPrepend>
                        <input type="password" name="password" className="form-control  col-md-8" autoComplete="off" placeholder="Password"
                          ref={register({
                            required: 'Password is Required',
                            validate: (value) => {
                              var paswd = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,30}$/;
                              if (value.match(paswd)) {
                                return true;
                              } else {
                                return 'Password must have minimum 8 character with 1 digit and 1 special character.';
                              }
                            }
                          })} />
                      </CInputGroup>
                      <ErrorMessage errors={errors} name="password">
                        {({ message }) => <p className={"text-danger"}>{message}</p>}
                      </ErrorMessage>
                    </CFormGroup>
                    <CFormGroup>
                      <CInputGroup className="mb-2">
                        <CInputGroupPrepend>
                          <CInputGroupText>
                            <CIcon name="cil-lock-locked" />
                          </CInputGroupText>
                        </CInputGroupPrepend>
                        <input type="password" name="c_password" className="form-control  col-md-8" autoComplete="off" placeholder="Confim Password"
                          ref={register({
                            required: 'Confirm Password is Required',
                            validate: (value) => value === watch('password') || "Passwords don't match."
                          })} />
                      </CInputGroup>
                      <ErrorMessage errors={errors} name="c_password">
                        {({ message }) => <p className={"text-danger"}>{message}</p>}
                      </ErrorMessage>
                    </CFormGroup>
                    <CRow>
                      <CCol xs="6">
                        <CButton
                          color="primary"
                          type="submit"
                          className="px-4"
                        >
                          Submit
                          </CButton>
                      </CCol>
                    </CRow>
                  </form>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

const mapStateToProps = function (state) {
  return {
    state: state,
  };
};
export default connect(mapStateToProps)(ResetPassword);
