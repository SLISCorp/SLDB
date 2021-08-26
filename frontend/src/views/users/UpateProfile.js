import React, { useState, useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import Error from "../../components/errorMessage";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CLabel,
  CFormGroup,
  CInput,
  CCardFooter,
  CButton,
} from "@coreui/react";
import Input from "../../components/Input";
import Select from "../../components/select";
import CIcon from "@coreui/icons-react";
import Http from "../../constants/http";
import apiPath from "../../constants/apiPath";
import Validation from "../../validations/validation_wrapper";
import {
  showAlert,
  showDangerToast,
  showToast,
} from "../../components/toastMessage";

var usertypeList = [
  { value: 1, label: "User" },
  { value: 2, label: "Admin" },
];

var disabled = false;
const UpateProfile = ({ history,...props }) => {
  const dispatch = useDispatch();
  const [tableData, setData] = useState(props.state && props.state.UserData || []);
  const [formDetail, setForm] = useState({});
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

  useEffect(() => {
    setForm({
      ...formDetail,
      ...{
        email:props.state.user.email,
        first_name:props.state.user.first_name,
        last_name:props.state.user.last_name,
        city:props.state.user.city,
        country:props.state.user.city,
        phone:props.state.user.phone,
      },
    });

    getData();
  }, []);

  const getData = (page = 1) => {
    Http("GET", apiPath.viewUser+'/'+props.match.params.id)
      .then((res) => {
        res = res.data;
        if(res.status){
          setForm({
            ...formDetail,
            ...{
              email:res.data.email,
              username:res.data.username,
              usertype:res.data.usertype,
            },
          });
        }
      })
      .catch((err) => {
        showDangerToast(err.message);
      });
  };

  const onSubmit = () => {
    if (disabled) {
      return;
    }
    disabled = 1;
    const emailError = Validation("email", formDetail.email);
    const firstNameError = Validation("firstName", formDetail.firstNameError);
    const lastNameError = Validation("firstName", formDetail.lastNameError);
    if (
      emailError ||
      firstNameError ||
      lastNameError
    ) {
      setForm({
        ...formDetail,
        ...{
          emailError: emailError,
          firstNameError: firstNameError,
          lastNameError: lastNameError,
        },
      });
      disabled = 0;
      return;
    }

    let body = {};
    body["username"] = formDetail.username;
    body["email"] = formDetail.email;
    body["usertype"] = formDetail.usertype;
    body["_id"] = props.match.params.id;
    Http("POST", apiPath.editUser+'/'+props.match.params.id, JSON.stringify(body))
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

  return (
    <CRow>
      <CCol lg={12}>
        <CCard>
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
            <CButton
              type="submit"
              size="sm"
              color="primary"
              className="mr-1"
              onClick={onSubmit}
            >
              <CIcon name="cil-scrubber" /> Submit
            </CButton>
            <CButton type="reset" size="sm" color="danger">
              <CIcon name="cil-ban" /> Reset
            </CButton>
          </CCardFooter>
        </CCard>
      </CCol>
    </CRow>
  );
};

const mapStateToProps = function (state) {
  return {
    state: state,
  };
};
export default connect(mapStateToProps)(UpateProfile);
