import React, { useState, useEffect } from "react";
import { CBadge, CLabel, CCard, CCardBody, CSelect, CCardHeader, CCol, CDataTable, CRow, CPagination, CInputCheckbox, CButton, CCollapse, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from "@coreui/react";
import { connect, useDispatch } from "react-redux";
import Http from "../../constants/http";
import apiPath from "../../constants/apiPath";
import { ErrorMessage, useForm } from "react-hook-form";
import { showAlert, showDangerToast, showToast, SwalConfig } from "../../components/toastMessage";
import { formateDate } from "../../helpers/commonHelpers";
import Swal from "sweetalert";
import CIcon from "@coreui/icons-react";
import { freeSet } from "@coreui/icons";
import { useHistory, useLocation, Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";


const Reports = (props) => {
  var disabled = false;
  const [status, setStatus] = useState({
    1: "Active",
    2: "Inactive",
    3: "Deleted",
    4: "Blocked",
  });
  const { register, handleSubmit, errors, setError, clearErrors, watch, } = useForm();
  const history = useHistory();
  const queryPage = useLocation().search.match(/page=([0-9]+)/, "");
  const currentPage = Number(queryPage && queryPage[1] ? queryPage[1] : 1);
  const [page, setPage] = useState(currentPage);
  const [tableData, setData] = useState([]);
  const [details, setDetails] = useState([]);
  const [startdate, setStartDate] = useState('');
  const [enddate, setEndDate] = useState('');

  const pageChange = (newPage) => {
    currentPage !== newPage && history.push(`/events?page=${newPage}`);
  };
  const toggleDetails = (index) => {
    const position = details.indexOf(index);
    let newDetails = details.slice();
    if (position !== -1) {
      newDetails.splice(position, 1);
    } else {
      newDetails = [...details, index];
    }
    setDetails(newDetails);
  };
  const getData = (start = '', end = '') => {
    let startDate = (start == '' ? '' : moment(start).format('YYYY-MM-DD'));
    let endDate = (end == '' ? '' : moment(end).format('YYYY-MM-DD'));
    let URL = start != '' && end != '' ? apiPath.getGroupReports + '?start_date=' + startDate + '&end_date=' + endDate : apiPath.getGroupReports;
    Http("GET", URL)
      .then((res) => {
        res = res.data;
        if (res.status) {
          showToast(res.message);
          console.log(res.data);
          setData(res.data);
        } else {
          showDangerToast(res.message);
        }
      })
      .catch((err) => {
        showDangerToast(err.message);
      });
  };
  const fields = [
    { key: "username", label: "Username", _style: { width: "25%" } },
    { key: "email", label: "Email", _style: { width: "25%" } },
    { key: "user_id", label: "userId", _style: { width: "25%" } },
    { key: "count", label: "Request Count", _style: { width: "25%" } },
  ];
  const handleStartDate = (date) => {
    setEndDate('');
    setStartDate(date);
  };

  const handleEndDate = (date) => {
    setEndDate(date);
  };
  const onReset = (e) => {
    setStartDate('');
    setEndDate('');
    getData();
  };
  const handleSearching = () => {
    getData(startdate, enddate);
  }

  useEffect(() => {
    getData();
  }, []);

  return (
    <CRow>
      <CCol xl={12}>
        <CCard>
          <CCardHeader>
            Reports Managment
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol xl={4}>
                <DatePicker selected={startdate === '' ? null : new Date(startdate)} className="form-control" placeholderText=" Start Date"
                  dateFormat="dd/MM/yyyy"
                  maxDate={new Date()}
                  onChange={handleStartDate}
                  peekNextMonth
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select" />
              </CCol>
              <CCol xl={4}>
                <DatePicker selected={enddate === '' ? null : new Date(enddate)} className="form-control" placeholderText=" End Date"
                  dateFormat="dd/MM/yyyy"
                  minDate={new Date(startdate)}
                  maxDate={new Date()}
                  onChange={handleEndDate}
                  peekNextMonth
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select" />
              </CCol>
              <CCol xl={4}>
                <button className="btn btn-primary ml-1" type="button" onClick={handleSearching}><i className="fa fa-search" /> Search<i className="fa fa-spinner fa-pulse fa-fw ml-1" /></button>
                <button className="btn btn-success ml-1 " type="button" onClick={(e) => { onReset(); }}><i className="fa fa-undo" /> Reset</button>
              </CCol>
            </CRow>
            <CDataTable
              items={tableData}
              fields={fields}
              columnFilter
              footer
              itemsPerPage={10}
              hover
              sorter
              pagination
              scopedSlots={{
                show_details: (item, index) => {
                  return (
                    <td className="py-2">
                      <CButton
                        color="primary"
                        variant="outline"
                        shape="square"
                        size="sm"
                        onClick={() => {
                          toggleDetails(index);
                        }}
                      >
                        {details.includes(index) ? "Hide" : "Show"}
                      </CButton>
                    </td>
                  );
                }
              }}
            />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow >
  );
};

const mapStateToProps = function (state) {
  return {
    state: state,
  };
};
export default connect(mapStateToProps)(Reports);
