import React, { Fragment, useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import Error from "../../components/errorMessage";
import { CCard, CCardBody, CCardHeader, CCol, CRow, CLabel, CFormGroup, CInput, CCardFooter, CButton, } from "@coreui/react";
import Input from "../../components/Input";
import Select from "../../components/select";
import CIcon from "@coreui/icons-react";
import Http from "../../constants/http";
import apiPath from "../../constants/apiPath";
import Validation from "../../validations/validation_wrapper";
import { connect, useDispatch } from "react-redux";
import { showAlert, showDangerToast, showToast, } from "../../components/toastMessage";

// import Swal from 'sweetalert2';
// import Helper from '../../constants/helper';
// import apiUrl from '../../constants/apiPath';
// import { Button, Card, CardBody, CardHeader, CardTitle, CardFooter, FormGroup, Label, Col, Row } from 'reactstrap';
// import { ValidatorForm } from 'react-form-validator-core';
// import TextValidator from '../CommanPage/TextValidator';
// import useSession from "react-session-hook";

const UserProfile = (props) => {

    // const session = useSession();
    // let history = useHistory();
    // const [firstname, setFirstname] = useState("");
    // const [lastname, setLastname] = useState("");
    // const [username, setUsername] = useState("");
    // const [email, setEmail] = useState("");
    // const [token] = useState(session.token);
    // const [profilePic, setProfilePic] = useState('');
    // const [preview, setProfilePicPreview] = useState('');

    // const onSumbit = async e => {
    //     let formData = new FormData();
    //     let postJson = { firstName: firstname, lastName: lastname, username: username, email: email };
    //     formData.append('data', JSON.stringify(postJson));
    //     formData.append('profile_pic', profilePic);
    //     let path = apiUrl.update_admin_profile;
    //     const fr = await Helper.formPost(formData, path, token);
    //     const res = await fr.response.json();
    //     if (fr.status === 200) {
    //         if (res.success) {
    //             Toast.fire({
    //                 type: "success",
    //                 title: res.msg,
    //             });
    //             localStorage.setItem("username", username);
    //             props.history.push('/dashboard');
    //         } else {
    //             Toast.fire({
    //                 type: "error",
    //                 title: res.msg,
    //             });
    //         }
    //     } else {
    //         Toast.fire({
    //             type: "error",
    //             title: res.error,
    //         });
    //     }

    // };

    // const getData = async () => {
    //     const user_Id = session.profile._id;
    //     // console.log("session.profile",session.profile);
    //     let path = apiUrl.get_admin_profile + '/?userId=' + user_Id;
    //     const fr = await Helper.get(path, token);
    //     const res = await fr.response.json();
    //     console.log("res", res);
    //     if (fr.status === 200) {
    //         if (res.success) {
    //             setFirstname(res.results.first_name);
    //             setLastname(res.results.last_name);
    //             setUsername(res.results.username);
    //             setMobile(res.results.phone);
    //             setEmail(res.results.email);
    //             setId(res.results.id);
    //             setProfilePicPreview(res.results.image)
    //         } else {
    //             Toast.fire({
    //                 type: "error",
    //                 title: res.msg,
    //             });
    //         }
    //     } else {
    //         Toast.fire({
    //             type: "error",
    //             title: res.error,
    //         });
    //     }
    // };

    // const onImageChange = (event) => {
    //     if (event.target.files && event.target.files[0]) {
    //         setProfilePicPreview(URL.createObjectURL(event.target.files[0]));
    //         setProfilePic(event.target.files[0]);

    //     }
    // }

    // useEffect(() => { getData(); }, []);


    // return (
    //     <CRow>
    //         <CCol lg={12}>
    //             <CCard>00000
    //                 <CCardBody>
    //                     <CFormGroup>
    //                         <CLabel htmlFor="Username">Username</CLabel>
    //                         <Input
    //                             id="username"
    //                             placeholder="Enter your username"
    //                             name="username"
    //                             value={formDetail.username}
    //                             onBlur={(e) => handleBlur(e)}
    //                             onChange={(e) => handleChange(e)}
    //                             error={formDetail.usernameError}
    //                         />
    //                     </CFormGroup>
    //                     <CFormGroup>
    //                         <CLabel htmlFor="Email">Email</CLabel>
    //                         <Input
    //                             id="email"
    //                             placeholder="Enter your email"
    //                             name="email"
    //                             value={formDetail.email}
    //                             onBlur={(e) => handleBlur(e)}
    //                             onChange={(e) => handleChange(e)}
    //                             error={formDetail.emailError}
    //                         />
    //                     </CFormGroup>
    //                     <CFormGroup>
    //                         <CLabel htmlFor="vat">User Type</CLabel>
    //                         <Select
    //                             className="custom-select form-control"
    //                             name="usertype"
    //                             value={formDetail.usertype}
    //                             onChange={handleChange}
    //                             onBlur={handleBlur}
    //                             optionList={usertypeList}
    //                             title={"User Type"}
    //                             error={formDetail.usertypeError}
    //                         />
    //                     </CFormGroup>
    //                 </CCardBody>
    //                 <CCardBody>
    //                     <CFormGroup>
    //                         <CFormGroup variant="checkbox" className="checkbox">
    //                             <div className="row">
    //                                 <div className="col-12">
    //                                     <table className="table">
    //                                         <thead>
    //                                             <tr>
    //                                                 <th scope="col">
    //                                                     <div className="custom-control custom-checkbox">
    //                                                         <input
    //                                                             type="checkbox"
    //                                                             checked={
    //                                                                 seletedGroup.length == groups.length
    //                                                             }
    //                                                             onChange={() => {
    //                                                                 onCheck(0, 1, true);
    //                                                             }}
    //                                                         />
    //                                                     </div>
    //                                                 </th>
    //                                                 <th scope="col">
    //                                                     <CLabel
    //                                                         variant="checkbox"
    //                                                         className="form-check-label"
    //                                                         htmlFor="checkbox2"
    //                                                     >
    //                                                         GROUP NAME
    //                             </CLabel>
    //                                                 </th>
    //                                                 <th scope="col">
    //                                                     <CLabel
    //                                                         variant="checkbox"
    //                                                         className="form-check-label"
    //                                                         htmlFor="checkbox2"
    //                                                     >
    //                                                         GROUP DESCRIPTION
    //                             </CLabel>
    //                                                 </th>
    //                                             </tr>
    //                                         </thead>
    //                                         <tbody>
    //                                             {groups.map((ele, index) => {
    //                                                 return (
    //                                                     <tr key={index}>
    //                                                         <td scope="col">
    //                                                             <div className="custom-control custom-checkbox">
    //                                                                 <input
    //                                                                     data-v-542dbc90=""
    //                                                                     type="checkbox"
    //                                                                     checked={seletedGroup.includes(ele._id)}
    //                                                                     onChange={() => {
    //                                                                         onCheck(index, ele._id, false);
    //                                                                     }}
    //                                                                 />
    //                                                             </div>
    //                                                         </td>
    //                                                         <td scope="col">
    //                                                             <CLabel
    //                                                                 variant="checkbox"
    //                                                                 className="form-check-label"
    //                                                                 htmlFor="checkbox2"
    //                                                             >
    //                                                                 {ele.title}
    //                                                             </CLabel>
    //                                                         </td>
    //                                                         <td scope="col">
    //                                                             <CLabel
    //                                                                 variant="checkbox"
    //                                                                 className="form-check-label"
    //                                                                 htmlFor="checkbox2"
    //                                                             >
    //                                                                 {ele.description}
    //                                                             </CLabel>
    //                                                         </td>
    //                                                     </tr>
    //                                                 );
    //                                             })}
    //                                         </tbody>
    //                                     </table>
    //                                 </div>
    //                             </div>
    //                         </CFormGroup>
    //                     </CFormGroup>
    //                 </CCardBody>
    //                 <CCardFooter>
    //                     <CButton
    //                         type="button"
    //                         size="sm"
    //                         color="danger"
    //                         className="mr-1"
    //                         onClick={(e) => {
    //                             BackPage(2);
    //                         }}
    //                     >
    //                         <CIcon name="cil-scrubber" /> Back
    //             </CButton>
    //                     <CButton
    //                         type="submit"
    //                         size="sm"
    //                         color="primary"
    //                         className="mr-1"
    //                         onClick={(e) => {
    //                             onSubmit();
    //                         }}
    //                     >
    //                         <CIcon name="cil-scrubber" /> Submit
    //             </CButton>
    //                 </CCardFooter>
    //             </CCard>
    //         </CCol>
    //     </CRow>
    // );
};

export default UserProfile;
