const config = require("@configs/config");
const Group = require("@model/Group");
const niv = require("node-input-validator");
const CResponse = require("@response");
const eventTrigger = require("../../helpers/eventTrigger");
const { Validator } = niv;

exports.add = async function (req, res) {
  try {
    const v = new Validator(req.body, {
      title: "required",
      description: "required",
    });

    await v.check().then(function (matched) {
      if (!matched) {
        var errors = [];
        if ("title" in v.errors) {
          errors.push({ title: v.errors.title.message });
        }
        if ("description" in v.errors) {
          errors.push({ description: v.errors.description.message });
        }
        CResponse.returnResponse(req, res, 400, "Something is missing", false, errors);
      } else {
        if (req.user.role_id !== "admin" && req.user.role_id !== "company") {
          eventTrigger("_Group", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body.title } }, "Group add")
          CResponse.returnResponse(req, res, 400, "Invalid permission. You don't have this permission", false, errors);
          return;
        }
        var group = new Group();
        group.title = req.body.title;
        group.description = req.body.description;
        group.user_id = req.user._id;
        group.company_id = req.user.company_id || req.user._id;

        group.save(function (err, data) {
          if (err) {
            eventTrigger("_Group", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body.title } }, "Group add")
            CResponse.returnResponse(req, res, 400, err.message, false, err);
          } else {
            eventTrigger("_Group", "CREATE", req.user, { ...req.body, ...{ name: req.body.title } }, "Group add")
            CResponse.returnResponse(req, res, 200, "Group has been created.", true, data);
          }
        });
      }
    });
  } catch (err) {
    eventTrigger("_Group", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body.title } }, "Group add")
    CResponse.returnResponse(req, res, 500, "Something went wrong!", false, err.message);
  }
};

exports.listGroup = function (req, res) {
  var query = Group.find({}).sort({ created_at: -1 }).populate({ path: "user_id", select: "_id username email" });
  query.exec(function (err, result) {
    var response = {};
    response.status = "success";
    response.data = result;
    return res.json(response);
  });
};

exports.edit = async function (req, res) {
  try {
    const v = new Validator(req.body, {
      title: "required",
      description: "required",
    });

    await v.check().then(async function (matched) {
      if (!matched) {
        var errors = [];
        if ("title" in v.errors) {
          errors.push({ title: v.errors.title.message });
        }
        if ("description" in v.errors) {
          errors.push({ description: v.errors.description.message });
        }
        eventTrigger("_Group", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body.title } }, "Group edit")
        CResponse.returnResponse(req, res, 400, "Something is missing", false, errors);
      } else {
        if (req.user.role_id !== "admin" && req.user.role_id !== "company") {
          eventTrigger("_Group", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body.title } }, "Group edit")
          CResponse.returnResponse(req, res, 400, "Invalid permission. You don't have this permission", false, errors);
          return;
        }
        var group = {};
        group.title = req.body.title;
        group.description = req.body.description;
        group.user_id = req.user._id;
        group.company_id = req.user.company_id || req.user._id;
        Group.findByIdAndUpdate(req.params.id, group, function (err) {
          if (err) {
            eventTrigger("_Group", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body.title } }, "Group edit")
            var response = {};
            response.status = "false";
            response.msg = "Something went wrong.";
            return res.json(response);
          } else {
            eventTrigger("_Group", "UPDATE", req.user, { ...req.body, ...{ name: req.body.title } }, "Group edit")
            var response = {};
            response.status = "true";
            response.msg = "Group updated successfully.";
            return res.json(response);
          }
        });
      }
    });
  } catch (err) {
    CResponse.returnResponse(req, res, 500, "Something went wrong!", false, err.message);
  }
};

exports.view = async function (req, res) {
  await Group.findOne({ _id: req.params.id }).exec(function (err, result) {
    if (err) {
      response.status = false;
      response.data = [];
      return res.json(response);
    }
    var response = {};
    response.status = "success";
    response.data = result;
    return res.json(response);
  });
};

exports.delete = function (req, res) {
  Group.remove({ _id: req.params.id }).exec();
  var response = {};
  response.status = "true";
  eventTrigger("_Group", "DELETE", req.user, {}, "Group delete")
  response.msg = "Group deleted successfully.";
  return res.json(response);
};
