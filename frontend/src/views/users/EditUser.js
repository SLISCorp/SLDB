import React, { Fragment, useState, useEffect } from "react";
import Error from "../../components/errorMessage";
import { CCard, CCardBody, CCardHeader, CCol, CRow, CLabel, CFormGroup, CInput, CCardFooter, CButton, } from "@coreui/react";
import Input from "../../components/Input";
import Select from "../../components/select";
import Http from "../../constants/http";
import apiPath from "../../constants/apiPath";
import Validation from "../../validations/validation_wrapper";
import { connect, useDispatch } from "react-redux";
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
const EditUser = ({ ...props }) => {
  let history = useHistory();
  const dispatch = useDispatch();
  const [tableData, setData] = useState(
    (props.state && props.state.UserData) || []
  );
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
    var error = Validation(evt.target.name, value);
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
    var error = Validation(evt.target.name, value);
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
      if (usernameError || emailError || usertypeError) {
        setForm({
          ...formDetail,
          ...{
            usernameError: usernameError,
            emailError: emailError,
            usertypeError: usertypeError,
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

  const getGroupData = async () => {
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

  const getData = (page = 1) => {
    Http("GET", apiPath.viewUser + "/" + props.match.params.id)
      .then((res) => {
        res = res.data;
        if (res.status) {
          setForm({
            ...formDetail,
            ...{
              email: res.data.email,
              username: res.data.username,
              usertype: res.data.role_id,
            },
          });
          setSelected(res.data.groups);
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
    if (usernameError || emailError || usertypeError) {
      setForm({
        ...formDetail,
        ...{
          usernameError: usernameError,
          emailError: emailError,
          usertypeError: usertypeError,
        },
      });
      disabled = 0;
      return;
    }

    let body = {};
    body["username"] = formDetail.username;
    body["email"] = formDetail.email;
    body["role_id"] = formDetail.usertype;
    body["groups"] = Array.isArray(seletedGroup) ? seletedGroup : [];
    body["_id"] = props.match.params.id;
    Http(
      "POST",
      apiPath.editUser + "/" + props.match.params.id,
      JSON.stringify(body)
    )
      .then((res) => {
        res = res.data;
        disabled = 0;
        if (res.status) {
          showToast(res.message);
          //showAlert(res.message, "success");
          history.replace("/admin/users");
        } else {
          showDangerToast(res.message);
          // showAlert(res.message, "error");
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
    getGroupData();
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
              </CCardBody>
              <CCardFooter>
                <CButton type="reset" size="sm" variant="outline" color="danger" onClick={() => history.goBack()}>
                  <CIcon content={freeSet.cilArrowLeft} />  Back
              </CButton>
                <CButton
                  type="button"
                  size="sm"
                  variant="outline"
                  color="primary"
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
                  variant="outline"
                  color="danger"
                  className="mr-1"
                  onClick={(e) => {
                    BackPage(1);
                  }}
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
                <table className="table">
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
                  color="danger"
                  variant="outline"
                  className="mr-1"
                  onClick={(e) => {
                    BackPage(2);
                  }}
                >
                  <CIcon content={freeSet.cilArrowLeft} /> Back
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
                >
                  Submit <CIcon name="cil-paper-plane" />
                </CButton>
              </CCardFooter>
            </Fragment>
          )}
        </CCard>
      </CCol>
    </CRow>
  );
};

export default EditUser;
