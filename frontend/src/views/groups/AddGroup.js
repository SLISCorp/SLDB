import React, { useState } from "react";
import { CCard, CCardBody, CCardHeader, CCol, CRow, CLabel, CFormGroup, CInput, CCardFooter, CButton, } from "@coreui/react";
import Input from "../../components/Input";
import Http from "../../constants/http";
import apiPath from "../../constants/apiPath";
import Validation from "../../validations/validation_wrapper";
import { showAlert, showDangerToast, showToast, } from "../../components/toastMessage";
import CIcon from "@coreui/icons-react";
import { freeSet } from "@coreui/icons";
import { useHistory } from "react-router-dom";

var disabled = false;
const AddGroup = ({ match }) => {
  let history = useHistory();
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
  const onSubmit = () => {
    if (disabled) {
      return;
    }
    disabled = 1;
    const titleError = Validation("title", formDetail.title);
    const descriptionError = Validation("description", formDetail.description);
    if (titleError || descriptionError) {
      setForm({
        ...formDetail,
        ...{ titleError: titleError, descriptionError: descriptionError },
      });
      disabled = 0;
      return;
    }
    let body = {};
    body["description"] = formDetail.description;
    body["title"] = formDetail.title;
    Http("POST", apiPath.addGroup, JSON.stringify(body))
      .then((res) => {
        res = res.data;
        disabled = 0;
        console.log(res);
        if (res.status) {
          showToast(res.message);
          //showAlert(res.message, "success");
          history.replace("/admin/groups");
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
              <CLabel htmlFor="company">Group Name</CLabel>
              <Input
                id="title"
                placeholder="Enter your group name"
                name="title"
                value={formDetail.title}
                onBlur={(e) => handleBlur(e)}
                onChange={(e) => handleChange(e)}
                error={formDetail.titleError}
              />
            </CFormGroup>
            <CFormGroup>
              <CLabel htmlFor="vat">Group Description</CLabel>
              <Input
                id="description"
                placeholder="Enter your group description"
                name="description"
                value={formDetail.description}
                onBlur={(e) => handleBlur(e)}
                onChange={(e) => handleChange(e)}
                error={formDetail.descriptionError}
              />
            </CFormGroup>
          </CCardBody>
          <CCardFooter>
            <CButton type="reset" size="sm" color="danger" variant="outline" onClick={() => history.goBack()}>
              <CIcon content={freeSet.cilArrowLeft} />  Back  </CButton>
            {" "}
            <CButton type="submit" size="sm" color="primary" variant="outline" onClick={onSubmit}>
              Submit  <CIcon name="cil-paper-plane" />
            </CButton>
          </CCardFooter>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default AddGroup;
