const config = require("@configs/config");
const Entity = require("@model/Entity");
const User = require("@model/User");
const Licenses = require("@model/License");
const Nodes = require("@model/Nodes");
const niv = require("node-input-validator");
const CResponse = require("@response");
const { Validator } = niv;
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const isValidObjectId = require("@helper/isValidObjectId");
const eventTrigger = require("../../helpers/eventTrigger");
const moment = require("moment");

exports.add = async function (req, res) {
    console.log(req.body);
    try {
        console.log(req.body, req.user);
        const v = new Validator(req.body, {
            license_lable: "required",
            start_date: "required",
            validity: "required",
        });

        await v.check().then(function (matched) {
            if (!matched) {
                var errors = [];
                if ("license_lable" in v.errors) {
                    errors.push({ license_lable: v.errors.license_lable.message });
                }
                if ("start_date" in v.errors) {
                    errors.push({ start_date: v.errors.start_date.message });
                }
                if ("validity" in v.errors) {
                    errors.push({ validity: v.errors.validity.message });
                }
                eventTrigger("_Licenses", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body.license_lable } }, "Licenses add")
                CResponse.returnResponse(req, res, 400, "Something is missing", false, errors);

            } else {
                if (req.user.role_id !== "admin" && req.user.role_id !== "company") {
                    eventTrigger("_Licenses", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body.license_lable } }, "Licenses add")
                    CResponse.returnResponse(req, res, 400, "Invalid permission. You don't have this permission", false, errors);
                    return;
                }

                var LicensesData = new Licenses();
                LicensesData.license_lable = req.body.license_lable;
                LicensesData.start_date = req.body.start_date;
                LicensesData.validity = req.body.validity;
                LicensesData.company_id = req.user.company_id || req.user._id;
                if (req.user._id) {
                    LicensesData.user_id = ObjectId(req.user._id);
                }
                LicensesData.save(function (err, data) {
                    if (err) {
                        eventTrigger("_Licenses", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body.license_lable } }, "Licenses add")
                        CResponse.returnResponse(req, res, 400, err.message, false, err);
                        return;
                    } else {
                        eventTrigger("_Licenses", "CREATE", req.user, { ...req.body, ...{ name: req.body.license_lable } }, "Licenses add")
                        CResponse.returnResponse(req, res, 200, "Licence has been created.", true, data);
                        return;
                    }
                });
            }

        });
    } catch (err) {
        eventTrigger("_Licenses", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body.event_name } }, "Licenses add")
        console.log(err);
        // create error logs on server crash
        CResponse.returnResponse(req, res, 500, err.message || "Something went wrong!", false, err.message);
    }
};

exports.listLicenses = function (req, res) {
    let company_id = req.user.company_id;
    let query = { company_id: company_id };
    console.log(query);
    Licenses.find(query)
        .sort({
            created_at: -1,
        })
        .exec(async function (err, result) {
            let responseArray = result
            var response = {};
            response.status = 1;
            response.data = responseArray;
            return res.json(response);
        });
};

exports.view = function (req, res) {
    var query = Licenses.findOne({
        status: 1,
        company_id: ObjectId(req.user.company_id),
        _id: ObjectId(req.params.id),
    });
    query.exec(function (err, result) {
        console.log(result);
        var response = {};
        response.status = "success";
        response.data = result;
        return res.json(response);
    });
};

exports.edit = async function (req, res) {
    console.log(req.body);
    try {
        console.log(req.body, req.user);
        const v = new Validator(req.body, {
            license_lable: "required",
            start_date: "required",
            validity: "required",
        });

        await v.check().then(function (matched) {
            if (!matched) {
                var errors = [];
                if ("license_lable" in v.errors) {
                    errors.push({ license_lable: v.errors.license_lable.message });
                }
                if ("start_date" in v.errors) {
                    errors.push({ start_date: v.errors.start_date.message });
                }
                if ("validity" in v.errors) {
                    errors.push({ validity: v.errors.validity.message });
                }
                eventTrigger("_Licenses", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body.license_lable } }, "Licenses edit")
                CResponse.returnResponse(req, res, 400, "Something is missing", false, errors);

            } else {
                if (req.user.role_id !== "admin" && req.user.role_id !== "company") {
                    eventTrigger("_Licenses", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body.license_lable } }, "Licenses edit")
                    CResponse.returnResponse(req, res, 400, "Invalid permission. You don't have this permission", false, errors);
                    return;
                }

                var LicensesData = {}
                LicensesData.license_lable = req.body.license_lable;
                LicensesData.start_date = req.body.start_date;
                LicensesData.validity = req.body.validity;
                LicensesData.company_id = req.user.company_id || req.user._id;
                if (req.user._id) {
                    LicensesData.user_id = ObjectId(req.user._id);
                }
                Licenses.findOneAndUpdate({ _id: req.params.id }, { $set: LicensesData }, { upsert: true, returnNewDocument: true }, function (err, data) {
                    if (err) {
                        eventTrigger("_Licenses", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body.license_lable } }, "Licenses edit")
                        CResponse.returnResponse(req, res, 400, err.message, false, err);
                    } else {
                        eventTrigger("_Licenses", "UPDATE", req.user, { ...req.body, ...{ name: req.body.license_lable } }, "Licenses edit")
                        CResponse.returnResponse(req, res, 200, "Licence has been updated.", true, data);
                    }
                });
            }
        }
        );
    } catch (err) {
        eventTrigger("_Licenses", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body.event_name } }, "Licenses edit")
        console.log(err);
        // create error logs on server crash
        CResponse.returnResponse(req, res, 500, err.message || "Something went wrong!", false, err.message);
    }
};

exports.delete = function (req, res) {
    Licenses.remove({ _id: req.params.id }).exec();
    var response = {};
    response.status = 1;
    response.msg = "Licence deleted successfully.";
    eventTrigger("_Licenses", "DELETE", req.user, {}, "Licence delete")
    return res.json(response);
};

exports.listNodes = function (req, res) {
    try {
        if (req.user.role_id !== "admin" && req.user.role_id !== "company") {
            // eventTrigger("_Nodes", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body } }, "Nodes add licence")
            CResponse.returnResponse(req, res, 400, "Invalid permission. You don't have this permission", false, errors);
            return;
        }
        let company_id = "";
        if (req.user.role_id === "user" || req.user.role_id === "admin") {
            company_id = req.user.company_id
        } else if (req.user.role_id === "company") {
            company_id = req.user.company_id
        } else {
            CResponse.returnResponse(req, res, 400, "Invalid permission. You don't have this permission", false, errors);
            return;
        }

        Nodes.find({ company_id: ObjectId(company_id) })
            .sort({
                created_at: -1,
            })
            .populate([
                { path: "licence_id", select: "license_lable start_date validity" },
                { path: "user_id", select: "username _id email" },
            ])
            .exec(function (err, result) {
                result = JSON.parse(JSON.stringify(result))
                result = result.map(ele => {
                    if (ele.licence_id) {
                        ele.counter = 0;
                        if (ele.licence_id.start_date && ele.licence_id.validity) {
                            let start = new Date(ele.licence_id.start_date);
                            let end = addDays(start, ele.licence_id.validity);
                            console.log("start ---->", moment(start).format("YYYY-MM-DD"), "end --------->", moment(end).format("YYYY-MM-DD"))
                            let difference = new Date(end) - new Date();
                            console.log("difference ----------->", difference);
                            ele.counter = (difference / 1000);
                            ele.expire_date = moment(end)
                            ele.start_date = moment(start)
                        }
                    }
                    return ele;
                })
                console.log(result);
                var response = {};
                response.status = 1;
                response.data = result;
                return res.json(response);
            });
    }
    catch (err) {
        console.log(err);
        // create error logs on server crash
        CResponse.returnResponse(req, res, 500, err.message || "Something went wrong!", false, err.message);
    }
};

exports.ViewNodes = function (req, res) {
    try {
        if (req.user.role_id !== "admin" && req.user.role_id !== "company") {
            // eventTrigger("_Nodes", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body } }, "Nodes add licence")
            CResponse.returnResponse(req, res, 400, "Invalid permission. You don't have this permission", false, errors);
            return;
        }
        let company_id = "";
        if (req.user.role_id === "user" || req.user.role_id === "admin") {
            company_id = req.user.company_id
        } else if (req.user.role_id === "company") {
            company_id = req.user.company_id
        } else {
            CResponse.returnResponse(req, res, 400, "Invalid permission. You don't have this permission", false, errors);
            return;
        }

        Nodes.findOne({ company_id: ObjectId(company_id), _id: ObjectId(req.params.id) })
            .sort({
                created_at: -1,
            })
            .populate([
                { path: "licence_id", select: "license_lable start_date validity" },
                { path: "user_id", select: "username _id email" },
            ])
            .exec(function (err, result) {
                console.log(result);
                var response = {};
                response.status = 1;
                response.data = result;
                return res.json(response);
            });
    }
    catch (err) {
        console.log(err);
        // create error logs on server crash
        CResponse.returnResponse(req, res, 500, err.message || "Something went wrong!", false, err.message);
    }
};

exports.editNode = async function (req, res) {
    console.log(req.body);
    try {
        console.log(req.body, req.user);
        const v = new Validator(req.body, {
            licence_id: "required",
        });

        await v.check().then(function (matched) {
            if (!matched) {
                var errors = [];
                if ("licence_id" in v.errors) {
                    errors.push({ licence_id: v.errors.licence_id.message });
                }
                eventTrigger("_Nodes", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body.license_lable } }, "Node edit")
                CResponse.returnResponse(req, res, 400, "Something is missing", false, errors);
            } else {
                if (req.user.role_id !== "admin" && req.user.role_id !== "company") {
                    eventTrigger("_Nodes", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body.licence_id } }, "Node edit")
                    CResponse.returnResponse(req, res, 400, "Invalid permission. You don't have this permission", false, errors);
                    return;
                }

                var NodeData = {}
                NodeData.licence_id = req.body.licence_id;
                NodeData.company_id = req.user.company_id || req.user._id;
                if (req.user._id) {
                    NodeData.user_id = ObjectId(req.user._id);
                }
                Nodes.findOneAndUpdate({ _id: req.params.id }, { $set: NodeData }, { upsert: true, returnNewDocument: true }, function (err, data) {
                    if (err) {
                        eventTrigger("_Nodes", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body.licence_id } }, "Node edit")
                        CResponse.returnResponse(req, res, 400, err.message, false, err);
                    } else {
                        eventTrigger("_Nodes", "UPDATE", req.user, { ...req.body, ...{ name: req.body.licence_id } }, "Node edit")
                        CResponse.returnResponse(req, res, 200, "Node licence has been updated.", true, data);
                    }
                });
            }
        }
        );
    } catch (err) {
        eventTrigger("_Nodes", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body.licence_id } }, "Node edit")
        console.log(err);
        // create error logs on server crash
        CResponse.returnResponse(req, res, 500, err.message || "Something went wrong!", false, err.message);
    }
};


function addDays(date, days) {
    const copy = new Date(Number(date))
    copy.setDate(date.getDate() + days)
    return copy
}