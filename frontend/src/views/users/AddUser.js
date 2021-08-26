import React, { Fragment, useState, useEffect } from "react";
import Error from "../../components/errorMessage";
import { CCard, CCardBody, CCardHeader, CCol, CRow, CLabel, CFormGroup, CInput, CCardFooter, CButton, CInputCheckbox, } from "@coreui/react";
import Input from "../../components/Input";
import Select from "../../components/select";
import Http from "../../constants/http";
import apiPath from "../../constants/apiPath";
import Validation from "../../validations/validation_wrapper";
import { showAlert, showDangerToast, showToast, } from "../../components/toastMessage";
import Stepper from "../../components/Stepper";
import CIcon from "@coreui/icons-react";
import { freeSet } from "@coreui/icons";
import { useHistory } from "react-router-dom";


var usertypeList = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
];

var disabled = false;
const AddUser = ({ match }) => {
  let history = useHistory();
  const [formDetail, setForm] = useState({});
  const [seletedGroup, setSelected] = useState([]);
  const [groups, setGroups] = useState([]);
  const [formStep, setFormStep] = useState({
    first: true,
    second: false,
    third: false,
  });
  const [steps, setStep] = useState([
    { active: 1, label: "User Details" },
    { active: 0, label: "Add to groups" },
    { active: 0, label: "Confirm" },
  ]);

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

  const nextPage = (stage) => {
    if (stage == 1) {
      const usernameError = Validation("username", formDetail.username);
      const emailError = Validation("email", formDetail.email);
      const usertypeError = Validation("usertype", formDetail.usertype);
      const passwordError = Validation("password", formDetail.password);
      const confirm_passwordError = Validation(
        "confirm_password",
        formDetail.confirm_password,
        formDetail.password
      );
      if (
        usernameError ||
        emailError ||
        usertypeError ||
        passwordError ||
        confirm_passwordError
      ) {
        setForm({
          ...formDetail,
          ...{
            usernameError: usernameError,
            emailError: emailError,
            usertypeError: usertypeError,
            passwordError: passwordError,
            confirm_passwordError: confirm_passwordError,
          },
        });
        disabled = 0;
        return;
      }
      setStep([
        { active: 1, label: "User Details" },
        { active: 1, label: "Add to groups" },
        { active: 0, label: "Confirm" },
      ]);
      setFormStep({ first: false, second: true, third: false });
    } else {
      setStep([
        { active: 1, label: "User Details" },
        { active: 1, label: "Add to groups" },
        { active: 1, label: "Confirm" },
      ]);
      setFormStep({ first: false, second: false, third: true });
    }
  };

  const BackPage = (stage) => {
    if (stage == 1) {
      setStep([
        { active: 1, label: "User Details" },
        { active: 0, label: "Add to groups" },
        { active: 0, label: "Confirm" },
      ]);
      setFormStep({ first: true, second: false, third: false });
    } else {
      setStep([
        { active: 1, label: "User Details" },
        { active: 1, label: "Add to groups" },
        { active: 0, label: "Confirm" },
      ]);
      setFormStep({ first: false, second: true, third: false });
    }
  };

  const getData = async () => {
    Http("GET", apiPath.getGroups)
      .then((res) => {
        res = res.data;
        if (res.status) {
          setGroups(res.data);
        } else {
          showDangerToast(res.message);
        }
      })
      .catch((err) => {
        showDangerToast(err.message);
      });
  };
  const onCheck = (index, id, isAll) => {
    let arr = seletedGroup;
    if (isAll) {
      if (groups.length == seletedGroup.length) {
        setSelected([]);
      } else {
        setSelected(groups.map((ele) => ele._id));
      }
    } else {
      if (seletedGroup.includes(id)) {
        arr = arr.filter((ele) => ele != id);
        setSelected(arr);
      } else {
        setSelected([...seletedGroup, ...[id]]);
      }
    }
    console.log(seletedGroup);
  };
  const getNames = () => {
    let name = "";
    groups.map((ele) => {
      if (seletedGroup.includes(ele._id)) {
        name += ele.title + ", ";
      }
    });
    name = name.substr(0, name.lastIndexOf(","));
    return name;
  };

  const onSubmit = () => {
    if (disabled) {
      return;
    }
    disabled = 1;
    const usernameError = Validation("username", formDetail.username);
    const emailError = Validation("email", formDetail.email);
    const usertypeError = Validation("usertype", formDetail.usertype);
    const passwordError = Validation("password", formDetail.password);
    const confirm_passwordError = Validation("confirm_password", formDetail.confirm_password, formDetail.password);
    if (usernameError || emailError || usertypeError || passwordError || confirm_passwordError) {
      setForm({
        ...formDetail,
        ...{
          usernameError: usernameError,
          emailError: emailError,
          usertypeError: usertypeError,
          passwordError: passwordError,
          confirm_passwordError: confirm_passwordError,
        },
      });
      disabled = 0;
      return;
    }

    let body = {};
    body["username"] = formDetail.username;
    body["email"] = formDetail.email;
    body["role_id"] = formDetail.usertype;
    body["password"] = formDetail.password;
    body["groups"] = Array.isArray(seletedGroup) ? seletedGroup : [];
    Http("POST", apiPath.addUser, JSON.stringify(body))
      .then((res) => {
        res = res.data;
        disabled = 0;
        console.log(res);
        if (res.status) {
          showToast(res.message);
          history.replace("/admin/users");
        } else {
          showDangerToast(res.message);
        }
      })
      .catch((err) => {
        disabled = 0;
        showDangerToast(err.message);
        //showAlert(err.message, "error");
      });
  };

  useEffect(() => {
    getData();
  }, []);



  return (
    <CRow>
      <CCol lg={12}>
        <CCard>
          <Stepper steps={steps} />
          {formStep.first && (
            <Fragment>
              <CCardBody>
                <CFormGroup>
                  <CLabel htmlFor="Username">Username</CLabel>
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    name="username"
                    value={formDetail.username}
                    onBlur={(e) => handleBlur(e)}
                    onChange={(e) => handleChange(e)}
                    error={formDetail.usernameError}
                  />
                </CFormGroup>
                <CFormGroup>
                  <CLabel htmlFor="Email">Email</CLabel>
                  <Input
                    id="email"
                    placeholder="Enter your email"
                    name="email"
                    value={formDetail.email}
                    onBlur={(e) => handleBlur(e)}
                    onChange={(e) => handleChange(e)}
                    error={formDetail.emailError}
                  />
                </CFormGroup>
                <CFormGroup>
                  <CLabel htmlFor="vat">User Type</CLabel>
                  <Select
                    className="custom-select form-control"
                    name="usertype"
                    value={formDetail.usertype}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    optionList={usertypeList}
                    title={"User Type"}
                    error={formDetail.usertypeError}
                  />
                </CFormGroup>

                <CFormGroup>
                  <CLabel htmlFor="vat">Password</CLabel>
                  <Input
                    id="password"
                    placeholder="Enter your password"
                    type="password"
                    name="password"
                    value={formDetail.password}
                    onBlur={(e) => handleBlur(e)}
                    onChange={(e) => handleChange(e)}
                    error={formDetail.passwordError}
                  />
                </CFormGroup>
                <CFormGroup>
                  <CLabel htmlFor="vat">Confirm Password</CLabel>
                  <Input
                    id="confirm_password"
                    placeholder="Enter your password"
                    type="password"
                    name="confirm_password"
                    value={formDetail.confirm_password}
                    onBlur={(e) => handleBlur(e)}
                    onChange={(e) => handleChange(e)}
                    error={formDetail.confirm_passwordError}
                  />
                </CFormGroup>
              </CCardBody>
              <CCardFooter>
                <CButton type="reset" size="sm" variant="outline" color="danger" onClick={() => history.goBack()}>
                  <CIcon content={freeSet.cilArrowLeft} />  Back
              </CButton>
                <CButton
                  type="button"
                  size="sm"
                  color="primary"
                  variant="outline"
                  className="ml-1"
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
                <CFormGroup>
                  <CFormGroup variant="checkbox" className="checkbox">
                    <div className="row">
                      <div className="col-12">
                        <table className="table">
                          <thead>
                            <tr>
                              <th scope="col">
                                <div className="custom-control custom-checkbox">
                                  <input
                                    type="checkbox"
                                    checked={
                                      seletedGroup.length == groups.length
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
                            {groups.map((ele, index) => {
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
                        </table>
                      </div>
                    </div>
                  </CFormGroup>
                </CFormGroup>
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
                  type="button"
                  size="sm"
                  variant="outline"
                  color="primary"
                  className="mr-1"
                  onClick={(e) => {
                    nextPage(2);
                  }}
                >
                  Next <CIcon content={freeSet.cilArrowRight} />
                </CButton>
              </CCardFooter>
            </Fragment>
          )}

          {formStep.third && (
            <Fragment>
              <CCardBody>
                <table class="table">
                  <tbody>
                    <tr>
                      <td>Username</td>
                      <td>{formDetail.username}</td>
                    </tr>
                    <tr>
                      <td>Groups</td>
                      <td>{getNames()}</td>
                    </tr>
                  </tbody>
                </table>
              </CCardBody>
              <CCardFooter>
                <CButton
                  type="button"
                  size="sm"
                  variant="outline"
                  color="danger"
                  className="mr-1"
                  onClick={(e) => {
                    BackPage(2);
                  }}
                >
                  <CIcon content={freeSet.cilArrowLeft} />  Back
                </CButton>
                <CButton
                  type="submit"
                  size="sm"
                  variant="outline"
                  color="primary"
                  onClick={() => {
                    onSubmit();
                  }}              >
                  Submit  <CIcon name="cil-paper-plane" />
                </CButton>
              </CCardFooter>
            </Fragment>
          )}
        </CCard>
      </CCol>
    </CRow>
  );
};

export default AddUser;
