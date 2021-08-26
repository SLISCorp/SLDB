import React, { Fragment, useState, useEffect } from "react";
import Error from "../../components/errorMessage";
import { CCard, CCardBody, CCardHeader, CCol, CRow, CLabel, CFormGroup, CInput, CSelect, CCardFooter, CButton, CInputCheckbox } from "@coreui/react";
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

var usertypeList = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
];

var disabled = false;
const AddEvent = ({ ...props }) => {
  let history = useHistory();
  const [formDetail, setForm] = useState({ event_owner: 'ANY_OWNER', event_type: "DATA", type: "HTTP", enable_event: true });
  const [Users, setUsersData] = useState([]);
  const [EntityList, setEntityList] = useState([]);
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [formStep, setFormStep] = useState({ first: true, second: false, third: false, });
  const [triggers, setTriggres] = useState([]);
  const [steps, setStep] = useState([
    { active: 1, label: "Event Type" },
    { active: 0, label: "Event Details" },
    { active: 0, label: "Confirm" },
  ]);

  const handleChange = (evt, onlyNumber = false, trim = false) => {
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
    setForm({ ...formDetail, ...formObj });
  };
  const nextPage = (stage) => {
    if (stage == 1) {
      setStep([
        { active: 1, label: "Event Type" },
        { active: 1, label: "Event Details" },
        { active: 0, label: "Confirm" }
      ]);
      setFormStep({ first: false, second: true, third: false });
    } else {
      const event_nameError = Validation("event_name", formDetail.event_name);
      const publishing_uriError = Validation("publishing_uri", formDetail.publishing_uri);
      if (event_nameError || publishing_uriError) {
        setForm({ ...formDetail, ...{ event_nameError: event_nameError, publishing_uriError: publishing_uriError } });
        disabled = 0;
        return;
      }
      setStep([
        { active: 1, label: "Event Type" },
        { active: 1, label: "Event Details" },
        { active: 1, label: "Confirm" },
      ]);
      setFormStep({ first: false, second: false, third: true });
    }
  };
  const BackPage = (stage) => {
    if (stage == 1) {
      setStep([
        { active: 1, label: "Event Type" },
        { active: 0, label: "Event Details" },
        { active: 0, label: "Confirm" }
      ]);
      setFormStep({ first: true, second: false, third: false });
    } else {
      setStep([
        { active: 1, label: "Event Type" },
        { active: 1, label: "Event Details" },
        { active: 0, label: "Confirm" }
      ]);
      setFormStep({ first: false, second: true, third: false });
    }
  };
  const getusers = (page = 1) => {
    Http("GET", apiPath.ownerList)
      .then((res) => {
        res = res.data;
        if (res.status) {
          showToast(res.message);
          setUsersData(res.data);
        } else {
          showDangerToast(res.message);
        }
      })
      .catch((err) => {
        showDangerToast(err.message);
      });
  };
  const getEntityData = (page = 1) => {
    Http("GET", apiPath.entitiesList)
      .then((res) => {
        res = res.data;
        if (res.status) {
          setEntityList(res.data);
        } else {
          showDangerToast(res.message);
        }
      })
      .catch((err) => {
        showDangerToast(err.message);
      });
  };
  const getEventById = () => {
    Http("GET", apiPath.viewEvent + '/' + props.match.params.id)
      .then((res) => {
        res = res.data;
        if (res.status) {
          showToast(res.message);
          setForm(res.data);
          setSelectedEntityId(res.data.entity_id);
          setTriggres(res.data.triggers);
        } else {
          showDangerToast(res.message);
        }
      })
      .catch((err) => {
        showDangerToast(err.message);
      });
  }
  const handleTriggres = (e) => {
    if (e.target.checked) {
      setTriggres(item => [...item, e.target.value]);
    } else {
      setTriggres(triggers.filter(item => item !== e.target.value));
    }
  }
  const onSubmit = () => {
    if (disabled) {
      return;
    }
    disabled = 1;
    const event_nameError = Validation("event_name", formDetail.event_name);
    const publishing_uriError = Validation("publishing_uri", formDetail.publishing_uri);
    if (event_nameError || publishing_uriError) {
      setForm({ ...formDetail, ...{ event_nameError: event_nameError, publishing_uriError: publishing_uriError } });
      disabled = 0;
      return;
    }
    let body = {};
    body["entity_id"] = selectedEntityId;
    body["type"] = formDetail.type;
    body["publishing_uri"] = formDetail.publishing_uri;
    body["enable_event"] = formDetail.enable_event;
    body["triggers"] = triggers;
    Http("PUT", apiPath.EditEvent + props.match.params.id, JSON.stringify(body))
      .then((res) => {
        res = res.data;
        disabled = 0;
        console.log(res);
        if (res.status) {
          showToast(res.message);
          history.replace("/admin/events");
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
    getEventById();
    getusers();
    getEntityData();
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
                    <CLabel htmlFor="User">Select User</CLabel>
                    <CSelect
                      custom
                      size="md"
                      name="event_owner"
                      id="selectLg"
                      value={formDetail.event_owner}
                      disabled={true}
                    >
                      {Users.map((ele, ind) => {
                        return <option key={ind} value={ele._id}>{ele.username}</option>;
                      })}
                    </CSelect>
                  </CFormGroup>
                  <CFormGroup className={"col-md-6 col-xs-6 float-left"}>
                    <CLabel htmlFor="event type">Event Type</CLabel>
                    <CSelect
                      custom
                      size="md"
                      name="event_type"
                      id="selectLg"
                      value={formDetail.event_type} disabled={true}>
                      <option value={"DATA"}>Data Events</option>
                      <option value={"SYSTEM"}>System Events</option>
                    </CSelect>
                  </CFormGroup>
                </CRow>
              </CCardBody>
              <CCardFooter>
                <CButton type="reset" className="mr-1" variant="outline" size="sm" color="danger" onClick={() => history.goBack()}>
                <CIcon content={freeSet.cilArrowLeft} />  Back
                </CButton>
                <CButton
                  type="button"
                  size="sm"
                  color="primary"
                  variant="outline"
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
                <CRow>
                  <CFormGroup className={"col-md-6 col-xs-6 float-left"}>
                    <CLabel htmlFor="Event name">Event Name*</CLabel>
                    <Input
                      id="event_name"
                      placeholder="Enter Event Name"
                      name="event_name"
                      value={formDetail.event_name}
                      onKeyDown={(e) => { if (e.key === " ") { e.preventDefault(); } }}
                      onChange={(e) => handleChange(e, false, true)}
                      onBlur={(e) => handleBlur(e, true)}
                      error={formDetail.event_nameError}
                    />
                  </CFormGroup>
                  <CFormGroup className={"col-md-6 col-xs-6 float-left"}>
                    <CLabel htmlFor="Entity">Entity*</CLabel>
                    <CSelect
                      custom
                      size="md"
                      name="entity_id"
                      id="selectLg"
                      value={selectedEntityId}
                      disabled={true}
                    >
                      {EntityList.map((ele, ind) => {
                        return <option key={ind} value={ele._id}>{ele.name}</option>;
                      })}
                    </CSelect>
                  </CFormGroup>
                </CRow>
                <CRow>
                  <CFormGroup className={"col-md-6 col-xs-6 float-left"}>
                    <CLabel htmlFor="Type">Type*</CLabel>
                    <CSelect
                      custom
                      size="md"
                      name="type"
                      id="selectLg"
                      value={formDetail.type}
                      onChange={(e) => handleChange(e)}
                      error={formDetail.typeError}
                    >
                      <option value={'http'}>{"HTTP"}</option>
                    </CSelect>
                  </CFormGroup>
                  <CFormGroup className={"col-md-6 col-xs-6 float-left"}>
                    <CLabel htmlFor="name">Publishing URI*</CLabel>
                    <Input
                      id="publishing_uri"
                      placeholder="Enter Publishing URL"
                      name="publishing_uri"
                      value={formDetail.publishing_uri}
                      onChange={(e) => handleChange(e)}
                      onBlur={(e) => handleBlur(e)}
                      error={formDetail.publishing_uriError}
                    />
                  </CFormGroup>
                </CRow>
                <CRow>                 
                  <CFormGroup className={"col-md-6 col-xs-6 float-left"}>
                    <CLabel htmlFor="name">Enable Event*</CLabel>
                    <CSelect
                      custom
                      size="md"
                      name="enable_event"
                      id="selectLg"
                      value={formDetail.enable_event}
                      onBlur={(e) => handleBlur(e)}
                      onChange={(e) => handleChange(e)}
                    >
                      <option value={true}>{"Enable"}</option>
                      <option value={false}>{"Disable"}</option>
                    </CSelect>
                  </CFormGroup>
                </CRow>
                <CRow className={"pl-3"}>
                  <CFormGroup className={"form-group col-md-12"} variant="custom-checkbox" >
                    <input
                      type={"checkbox"}
                      className={"custom-control-input"}
                      id="inline-checkbox1"
                      name="create"
                      onChange={(e) => handleTriggres(e)}
                      checked={triggers.includes('CREATE')}
                      value={"CREATE"}
                    />
                    <CLabel variant="custom-checkbox" htmlFor="inline-checkbox1">
                      CREATE
                  </CLabel>
                  </CFormGroup>
                  {formDetail.event_type == 'SYSTEM' && <CFormGroup className={"form-group col-md-12"} variant="custom-checkbox" >
                    <input
                      type={"checkbox"}
                      className={"custom-control-input"}
                      id="inline-checkbox2"
                      name="update"
                      onChange={(e) => handleTriggres(e)}
                      checked={triggers.includes('UPDATE')}
                      value={"UPDATE"}
                    />
                    <CLabel variant="custom-checkbox" htmlFor="inline-checkbox2">
                      UPDATE
                  </CLabel>
                  </CFormGroup>}
                  {formDetail.event_type == 'DATA' && <CFormGroup className={"form-group col-md-12"} variant="custom-checkbox" >
                    <input
                      type={"checkbox"}
                      className={"custom-control-input"}
                      id="inline-checkbox3"
                      name="transfer"
                      onChange={(e) => handleTriggres(e)}
                      checked={triggers.includes('TRANSFER')}
                      value={"TRANSFER"}
                    />
                    <CLabel variant="custom-checkbox" htmlFor="inline-checkbox3">
                      TRANSFER
                  </CLabel>
                  </CFormGroup>}
                  <CFormGroup className={"form-group col-md-12"} variant="custom-checkbox">
                    <input
                      type={"checkbox"}
                      className={"custom-control-input"}
                      id="inline-checkbox4"
                      name="failed"
                      onChange={(e) => handleTriggres(e)}
                      checked={triggers.includes('FAILED')}
                      value={"FAILED"}
                    />
                    <CLabel variant="custom-checkbox" htmlFor="inline-checkbox4">
                      INTEGRITY FAILED
                  </CLabel>
                  </CFormGroup>
                  <CFormGroup className={"form-group col-md-12"} variant="custom-checkbox">
                    <input
                      type={"checkbox"}
                      className={"custom-control-input"}
                      id="inline-checkbox5"
                      name="delete"
                      onChange={(e) => handleTriggres(e)}
                      checked={triggers.includes('DELETE')}
                      value={"DELETE"}
                    />
                    <CLabel variant="custom-checkbox" htmlFor="inline-checkbox5">
                      DELETE
                  </CLabel>
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
                      <td>{formDetail.event_owner}</td>
                    </tr>
                    <tr>
                      <td>Data Type</td>
                      <td>{formDetail.event_type}</td>
                    </tr>
                    <tr>
                      <td>Event Name</td>
                      <td>{formDetail.event_name}</td>
                    </tr>
                    <tr>
                      <td>Entity Id</td>
                      <td>{selectedEntityId}</td>
                    </tr>
                    <tr>
                      <td>Publishing URL</td>
                      <td>{formDetail.publishing_uri}</td>
                    </tr>
                    <tr>
                      <td>Enable Event </td>
                      <td>{formDetail.enable_event ? 'Enable' : 'Disable'}</td>
                    </tr>
                    <tr>
                      <td>Triggres </td>
                      <td>{triggers.join(", ")}</td>
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

export default AddEvent;
