import React, { useState, useEffect } from "react";
import { connect, useDispatch } from "react-redux";
import { CButton as Button, CCardFooter as CardFooter, CCard as Card, CCardBody as CardBody, CCardHeader as CardHeader, CCardGroup as FormGroup, CLabel as Label, CCol as Col, CContainer, CForm, CFormGroup, CSidebarBrand, CInput, CInputGroup, CInputGroupPrepend, CInputGroupText, CRow as Row } from "@coreui/react";
import { useForm } from "react-hook-form";
import { ErrorMessage } from '@hookform/error-message';
import Http from "../../constants/http";
import { uploadImageWithData } from "../../constants/http";
import apiPath from "../../constants/apiPath";
import { showAlert, showDangerToast, showToast } from "../../components/toastMessage";
import Session from "../../helpers/session";
import CIcon from "@coreui/icons-react";
import { freeSet } from "@coreui/icons";
import { useHistory } from "react-router-dom";


const Profile = (props) => {
    let history = useHistory();
    const dispatch = useDispatch();
    const { register, handleSubmit, errors, setError, clearErrors, watch, } = useForm();
    const [first_name, setFName] = useState("");
    const [last_name, setLName] = useState("");
    const [username, setUName] = useState("");
    const [email, setEmail] = useState("");
    const [country, setCountry] = useState("");
    const [city, setCity] = useState("");
    const [phone, setPhone] = useState("");
    // const [username, setUsername] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [imageData, setImageData] = useState();
    const [groups, SetGroup] = useState([])
    const [user, setUser] = useState({})
    useEffect(() => {
        getData();
    }, []);

    const getData = async (e) => {
        let path = apiPath.adminGetProfile;
        try {
            var res = await Http("GET", path);
            res = res.data
            if (res.status) {
                setUser(res.data)
                setFName(res.data.first_name);
                setLName(res.data.last_name);
                setUName(res.data.username);
                setEmail(res.data.email);
                setCountry(res.data.country);
                setCity(res.data.city);
                setPhone(res.data.phone);
                SetGroup(res.data.groups)
                // setUsername(res.data.username);
                setImageUrl(res.data.image);
            } else {
                showDangerToast(res.message)
            }
        } catch (err) {
            showDangerToast(err.message)
        }
    };

    const onSubmit = async (formdetail) => {
        try {
            let formData = new FormData();
            formData.append("firstName", formdetail.first_name);
            formData.append("lastName", formdetail.last_name);
            formData.append("country", formdetail.country);
            formData.append("city", formdetail.city);
            if (imageData) formData.append("profile_pic", imageData);
            formData.append("phone", formdetail.phone);
            console.log(formdetail)
            let path = apiPath.adminUpdateProfile;
            var res = await uploadImageWithData("PUT", path, formData);
            if (res.status) {
                showToast(res.msg)
                Session.setSession("ModexWeb", { ...res.data, ...{ token: res.token }, });
                Session.setSession("token", res.token);
                dispatch({ type: "login_user", payload: { ...res.data, ...{ token: res.token } } });
            } else {
                showDangerToast(res.msg)
            }
        } catch (err) {
            showDangerToast(err.message)
        }
    };

    const handleFileUpload = (e) => {
        setImageData(e.target.files[0]);
        setImageUrl(window.URL.createObjectURL(e.target.files[0]));
    };

    return (
        <React.Fragment>
            <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
                <Card>
                    <CardHeader>
                        <h4>Profile</h4>
                    </CardHeader>

                    <CardHeader>
                        {groups && groups.length > 0 && (
                            <>
                                <h4>Groups</h4>
                                <ul>
                                    {groups.map(ele => {
                                        return (<li key={ele._id}>{ele.title}</li>)
                                    })}

                                </ul>
                            </>
                        )}
                        <h5 className="general-info">Public Key : <span>{user.public_key}</span></h5>
                        <h5 className="general-info">Private Key : <span>{user.private_key}</span></h5>
                        <h5 className="general-info">Role : <span>{user.role_id == "admin" ? "Admin" : user.role_id === "company" ? "Company" : user.role_id === "user" ? "User" : 'NA'}</span></h5>
                        <h5 className="general-info">User Id : <span>{user._id}</span></h5>
                        <h5 className="general-info">Created By : <span>{user.user_id && user.user_id.username || "NA"}</span></h5>
                    </CardHeader>

                    <CardBody>
                        <Row>
                            <Col md={6} className={"mt-2"}>
                                <FormGroup>
                                    <Label>First Name</Label>
                                    <input
                                        type="text"
                                        id="first_name"
                                        name="first_name"
                                        placeholder="First name"
                                        autoComplete="off"
                                        defaultValue={first_name || ""}
                                        className="form-control col-md-12"
                                        ref={register({ required: "Required" })}
                                    />
                                    {errors.first_name && (
                                        <p className="text-danger marginmessage">
                                            This field is required
                                        </p>
                                    )}
                                </FormGroup>
                            </Col>
                            <Col md={6} className={"mt-2"}>
                                <FormGroup>
                                    <Label>Last Name</Label>
                                    <input
                                        type="text"
                                        id="last_name"
                                        name="last_name"
                                        placeholder="Last name"
                                        autoComplete="off"
                                        defaultValue={last_name || ""}
                                        className="form-control col-md-12"
                                        ref={register({ required: "Required" })}
                                    />
                                    {errors.last_name && (
                                        <p className="text-danger marginmessage">
                                            This field is required
                                        </p>
                                    )}
                                </FormGroup>
                            </Col>
                            <Col md={6} className={"mt-2"}>
                                <FormGroup>
                                    <Label>User Name</Label>
                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        disabled={true}
                                        placeholder="User name"
                                        autoComplete="off"
                                        defaultValue={username || ""}
                                        className="form-control col-md-12"
                                        ref={register({ required: "Required" })}
                                    />
                                    {errors.username && (
                                        <p className="text-danger marginmessage">
                                            This field is required
                                        </p>
                                    )}
                                </FormGroup>
                            </Col>
                            <Col md={6} className={"mt-2"}>
                                <FormGroup>
                                    <Label>Email</Label>
                                    <input
                                        type="text"
                                        id="email"
                                        name="email"
                                        disabled={true}
                                        placeholder="Enter email/username"
                                        autoComplete="off"
                                        defaultValue={email || ""}
                                        className="form-control col-md-12"
                                        ref={register({ required: "Required" })}
                                    />
                                    {errors.email && (
                                        <p className="text-danger marginmessage">
                                            This field is required
                                        </p>
                                    )}
                                </FormGroup>
                            </Col>
                            <Col md={6} className={"mt-2"}>
                                <FormGroup>
                                    <Label>Phone</Label>
                                    <input
                                        type="text"
                                        id="phone"
                                        name="phone"
                                        placeholder="Phone number"
                                        autoComplete="off"
                                        defaultValue={phone || ""}
                                        className="form-control col-md-12"
                                        ref={register({
                                            required: 'Mobile is Required',
                                            maxLength: 10,
                                            minLength: 10,
                                            validate: (value) => {
                                                var paswd = /^\(?([1-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
                                                if (value.match(paswd)) {
                                                    return true;
                                                } else {
                                                    return 'Mobile number is invalid';
                                                }
                                            }
                                        })}
                                    />
                                    <ErrorMessage errors={errors} name="phone">
                                        {({ message }) => <p className={"text-danger"}>{message}</p>}
                                    </ErrorMessage>
                                </FormGroup>
                            </Col>
                            <Col md={6} className={"mt-2"}>
                                <FormGroup>
                                    <Label>Country</Label>
                                    <input
                                        type="text"
                                        id="country"
                                        name="country"
                                        placeholder="Country"
                                        autoComplete="off"
                                        defaultValue={country || ""}
                                        className="form-control col-md-12"
                                        ref={register({ required: "Required" })}
                                    />
                                    {errors.country && (
                                        <p className="text-danger marginmessage">
                                            This field is required
                                        </p>
                                    )}
                                </FormGroup>
                            </Col>
                            <Col md={6} className={"mt-2"}>
                                <FormGroup>
                                    <Label>City</Label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        placeholder="City"
                                        autoComplete="off"
                                        defaultValue={city || ""}
                                        className="form-control col-md-12"
                                        ref={register({ required: "Required" })}
                                    />
                                    {errors.city && (
                                        <p className="text-danger marginmessage">
                                            This field is required
                                        </p>
                                    )}
                                </FormGroup>
                            </Col>
                            <Col md={6} className={"mt-2"}>
                                <FormGroup>
                                    <Label>Upload Image</Label>
                                    <input
                                        type="file"
                                        name="userprofile"
                                        className="form-control"
                                        maxLength="10"
                                        placeholder="Upload Image"
                                        onChange={(e) => {
                                            handleFileUpload(e);
                                        }}
                                    />
                                </FormGroup>
                                <div className={"mt-2"}>
                                    <img className={"rounded"} src={imageUrl} alt="" width="150" />
                                </div>
                            </Col>
                        </Row>
                    </CardBody>
                    <CardFooter>
                        <Button type="reset" size="sm" color="danger" variant="outline" onClick={() => history.goBack()}>
                            <CIcon content={freeSet.cilArrowLeft} />  Back  </Button>
                        {" "}
                        <Button type="submit" size="sm" color="primary" variant="outline" >
                            Submit  <CIcon name="cil-paper-plane" />
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </React.Fragment >
    );
};

export default Profile;
