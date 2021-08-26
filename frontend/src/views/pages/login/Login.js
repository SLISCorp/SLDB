import React, { useState, useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import Recaptcha from "react-recaptcha";
import { loadScript } from "../../../helpers/commonHelpers";
import { Link } from "react-router-dom";
import { ErrorMessage, useForm } from "react-hook-form";
import { CButton, CCard, CCardBody, CCardGroup, CLabel, CCol, CContainer, CForm, CFormGroup, CHeaderBrand, CSidebarBrand, CInput, CInputGroup, CInputGroupPrepend, CInputGroupText, CRow, } from "@coreui/react";
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

const Login = (props) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [forgotForm, setForgotForm] = useState(false);
  const [loginForm, setForm] = useState(Session.getSession("remember_me") || {})
  const [remberMe, setRemberMe] = useState(Session.getSession("remember_me") || false);
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
    body["email"] = formDetail.email;
    body["password"] = formDetail.password;
    body["device_id"] = props.state.deviceInfo.device_id;
    body["device_type"] = props.state.deviceInfo.device_type;
    if (props.state.deviceInfo.fcmToken) {
      body["fcmToken"] = props.state.deviceInfo.fcmToken;
    }

    setLoading(true);
    Http("POST", apiPath.adminLogin, JSON.stringify(body))
      .then((response) => {
        disable = false;
        response = response.data;
        if (response.success) {
          showToast(response.message);
          setLoading(false);
          if (remberMe) {
            Session.setSession('remember_me', {
              email: formDetail.email,
              password: formDetail.password
            });
          } else {
            Session.clearItem('remember_me');
          }
          Session.setSession("ModexWeb", {
            ...response.data,
            ...{ token: response.token },
          });
          Session.setSession("token", response.token);
          dispatch({
            type: "login_user",
            payload: { ...response.data, ...{ token: response.token } },
          });
          const { history } = props;
          props.history.replace("/");
        } else {
          setLoading(false);
          showDangerToast(response.message);
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

  const submitForgotForm = (formDetail) => {
    if (disable) return;
    disable = 1;

    let body = {};
    body["email"] = formDetail.forgot_email.toLowerCase();
    setLoading(true);
    Http("POST", apiPath.adminForgotPassword, JSON.stringify(body))
      .then((response) => {
        disable = false;
        response = response.data;
        if (response.success) {
          showToast(response.message);
          setLoading(false);
          const { history } = props;
          props.history.replace("/");
        } else {
          setLoading(false);
          showToast(response.message);
          showDangerToast(response.message);
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
          <CCol md="6" className="mb-5 text-center">
            <CSidebarBrand className="d-md-down-none" to="/">
              <img src={logo} alt={"Logo"} width={250} />
            </CSidebarBrand>
            <CHeaderBrand className="mx-auto d-lg-none" to="/">
              <img src={logo} alt={"Logo"} height={50} />
            </CHeaderBrand>
          </CCol>
        </CRow>
        <CRow className="justify-content-center">
          <CCol md="6" >
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  {!forgotForm && (
                    <form onSubmit={handleSubmit(submitForm)}>
                      <h1>Login</h1>
                      <p className="text-muted">Sign In to your account</p>
                      <CFormGroup>
                        <CInputGroup className="mb-2">
                          <CInputGroupPrepend>
                            <CInputGroupText>
                              <CIcon name="cil-user" />
                            </CInputGroupText>
                          </CInputGroupPrepend>
                          <input
                            type="text"
                            id="description"
                            name="email"
                            placeholder="Enter email/username"
                            autoComplete="off"
                            className="form-control col-md-12"
                            defaultValue={loginForm.email || ""}
                            ref={register({ required: "Required" })}
                          />
                        </CInputGroup>
                        {errors.email && (
                          <p className="text-danger marginmessage">
                            This field is required
                          </p>
                        )}
                      </CFormGroup>
                      <CFormGroup>
                        <CInputGroup className="mb-2">
                          <CInputGroupPrepend>
                            <CInputGroupText>
                              <CIcon name="cil-lock-locked" />
                            </CInputGroupText>
                          </CInputGroupPrepend>
                          <input
                            type="password"
                            id="description"
                            name="password"
                            placeholder="Enter password"
                            autoComplete="off"
                            className="form-control col-md-12"
                            defaultValue={loginForm.password || ""}
                            ref={register({ required: "Required" })}
                          />
                        </CInputGroup>
                        {errors.password && (
                          <p className="text-danger marginmessage">
                            Password is required
                          </p>
                        )}
                      </CFormGroup>
                      <CFormGroup className={"form-group col-md-12"} variant="custom-checkbox" >
                        <input
                          type={"checkbox"}
                          className={"custom-control-input"}
                          id="inline-checkbox1"
                          name="remember"
                          checked={remberMe}
                          onChange={(event) => {
                            setRemberMe(!remberMe);
                          }}
                          value={"remember"}
                        />
                        <CLabel variant="custom-checkbox" htmlFor="inline-checkbox1">
                          Remember Me
                            </CLabel>
                      </CFormGroup>
                      <CRow>
                        <CCol xs="6">
                          <CButton
                            color="primary"
                            variant="outline"
                            type="submit"
                            className="px-4"
                            size="sm"
                          >
                            Login <CIcon name="cil-paper-plane" />
                          </CButton>
                        </CCol>
                        <CCol xs="6" className="text-right">
                          <CButton
                            color="link"
                            className="px-0"
                            onClick={(e) => {
                              setForgotForm(true);
                            }}
                          >
                            Forgot password?
                          </CButton>
                        </CCol>
                      </CRow>
                    </form>
                  )}
                  {forgotForm && (
                    <form onSubmit={handleSubmit(submitForgotForm)}>
                      <h1>Forgot Password</h1>
                      <p className="text-muted">
                        Please enter your registered email id
                      </p>
                      <CFormGroup>
                        <CInputGroup className="mb-2">
                          <CInputGroupPrepend>
                            <CInputGroupText>
                              <CIcon name="cil-user" />
                            </CInputGroupText>
                          </CInputGroupPrepend>
                          <input
                            type="text"
                            id="forgot_email"
                            name="forgot_email"
                            placeholder="Enter email"
                            autoComplete="off"
                            className="form-control col-md-12"
                            ref={register({ required: "Required" })}
                          />
                        </CInputGroup>
                        {errors.forgot_email && (
                          <p className="text-danger marginmessage">
                            This field is required
                          </p>
                        )}
                      </CFormGroup>
                      <CRow>
                        <CCol xs="6">
                          <CButton
                            type="submit"
                            color="primary"
                            variant="outline"
                            className="px-4"
                            size="sm"
                          >
                            Send Email <CIcon name="cil-paper-plane" />
                          </CButton>
                        </CCol>
                        <CCol xs="6" className="text-right">
                          <CButton
                            color="link"
                            className="px-0"
                            onClick={(e) => {
                              setForgotForm(false);
                            }}
                          >
                            <CIcon content={freeSet.cilArrowLeft} /> Back to
                            login?
                          </CButton>
                        </CCol>
                      </CRow>
                    </form>
                  )}
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
export default connect(mapStateToProps)(Login);
