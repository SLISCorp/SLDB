const config = require("@configs/config");
const Permission = require("@model/Permission");
const Entity = require("@model/Entity");
const Group = require("@model/Group");
const niv = require("node-input-validator");
const CResponse = require("@response");
const { Validator } = niv;
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const eventTrigger = require("../../helpers/eventTrigger");

exports.add = async function (req, res) {
  console.log(req.body);
  try {
    console.log(req.body, req.user);
    const v = new Validator(req.body, {
      group_id: "required|array",
      entity_id: "required",
      permission: "required|object",
      "permission.*.read": "boolean",
      "permission.*.write": "boolean",
    });

    await v.check().then(async function (matched) {
      if (!matched) {
        console.log(v.errors);
        var errors = [];
        if ("group_id" in v.errors) {
          errors.push({ group_id: v.errors.group_id.message });
        }
        if ("entity_id" in v.errors) {
          errors.push({ entity_id: v.errors.entity_id.message });
        }
        if ("permission" in v.errors) {
          errors.push({ permission: v.errors.permission.message });
        }
        if ("permission.read" in v.errors) {
          errors.push({
            permission: v.errors["permission.read"].message,
          });
        }
        if ("permission.write" in v.errors) {
          errors.push({
            permission: v.errors["permission.write"].message,
          });
        }
        eventTrigger("_Permission", "INTEGRITY_FAILED", req.user, "_PermissionAdd", "Permission add")
        CResponse.returnResponse(
          req,
          res,
          400,
          "Something is missing",
          false,
          errors
        );
      } else {
        let isValidEntity = await Entity.findOne({
          _id: ObjectId(req.body.entity_id),
          status: 1,
        });
        console.log(isValidEntity);
        if (!isValidEntity) {
          eventTrigger("_Permission", "INTEGRITY_FAILED", req.user, "_PermissionAdd", "Permission add")
          CResponse.returnResponse(
            req,
            res,
            400,
            "Entity is not valid",
            false,
            {}
          );
          return;
        }
        let groupId = req.body.group_id.map((ele) => ObjectId(ele));
        console.log(groupId);
        let isValidGroup = await Group.find(
          {
            _id: { $in: groupId },
            status: 1,
          },
          { _id: 1 }
        );
        isValidGroup = isValidGroup.map((ele) => ObjectId(ele._id));
        if (isValidGroup.length < 1) {
          eventTrigger("_Permission", "INTEGRITY_FAILED", req.user, "_PermissionAdd", "Permission add")
          CResponse.returnResponse(
            req,
            res,
            400,
            "Group is not valid",
            false,
            {}
          );
          return;
        }

        // let isAlreadyHavePermission = await Permission.findOne({
        //   group_id: ObjectId(req.body.group_id),
        //   entity_id: ObjectId(req.body.entity_id),
        //   status: 1,
        // });

        // console.log(isAlreadyHavePermission);

        // if (isAlreadyHavePermission) {
        //   CResponse.returnResponse(
        //     req,
        //     res,
        //     400,
        //     "Group have already permission for selected entity",
        //     false,
        //     {}
        //   );
        //   return;
        // }
        if (
          req.body.permission &&
          Object.keys(req.body.permission).length > 0
        ) {
        } else {
          eventTrigger("_Permission", "INTEGRITY_FAILED", req.user, "_PermissionAdd", "Permission add")
          CResponse.returnResponse(
            req,
            res,
            400,
            "Permissions is missing",
            false,
            {}
          );
          return;
        }

        let insertArray = isValidGroup.map((ele) => {
          let obj = {};
          obj.group_id = ObjectId(ele);
          obj.entity_id = req.body.entity_id;
          obj.permission = req.body.permission;
          obj.user_id = req.user._id;
          obj.company_id = req.user.company_id || req.user._id;
          if (req.user._id) {
            obj.user_id = ObjectId(req.user._id);
          }
          return obj;
        });

        console.log("insertArray", insertArray);

        Permission.insertMany(insertArray, function (err, data) {
          if (err) {
            CResponse.returnResponse(req, res, 400, err.message, false, err);
          } else {
            eventTrigger("_Permission", "CREATE", req.user, "_PermissionAdd", "Permission add")
            CResponse.returnResponse(
              req,
              res,
              200,
              "Permission has been granted",
              true,
              data
            );
          }
        });
      }
    });
  } catch (err) {
    console.log(err);
    // create error logs on server crash
    eventTrigger("_Permission", "INTEGRITY_FAILED", req.user, "_PermissionAdd", "Permission add")
    CResponse.returnResponse(
      req,
      res,
      500,
      "Something went wrong!",
      false,
      err.message
    );
  }
};

exports.permissionList = function (req, res) {
  Permission.find({ entity_id: ObjectId(req.params.id) })
    .sort({
      created_at: -1,
    })
    .populate([
      { path: "entity_id", select: "_id name" },
      { path: "group_id", select: "_id title description " },
    ])
    .exec(function (err, result) {
      console.log(result);
      var response = {};
      response.status = 1;
      response.data = result;
      return res.json(response);
    });
};

exports.view = function (req, res) {
  Permission.findOne({ _id: ObjectId(req.params.id) })
    .sort({
      created_at: -1,
    })
    .populate([
      { path: "entity_id", select: "_id name" },
      { path: "group_id", select: "_id title description " },
    ])
    .exec(function (err, result) {
      console.log(result);
      var response = {};
      response.status = 1;
      response.data = result;
      return res.json(response);
    });
};

exports.edit = async function (req, res) {
  console.log(req.body);
  try {
    console.log(req.body, req.user);
    const v = new Validator(req.body, {
      group_id: "required",
      entity_id: "required",
      permission: "required|object",
      "permission.*.read": "boolean",
      "permission.*.write": "boolean",
    });

    await v.check().then(async function (matched) {
      if (!matched) {
        console.log(v.errors);
        var errors = [];
        if ("group_id" in v.errors) {
          errors.push({ group_id: v.errors.group_id.message });
        }
        if ("entity_id" in v.errors) {
          errors.push({ entity_id: v.errors.entity_id.message });
        }
        if ("permission" in v.errors) {
          errors.push({ permission: v.errors.permission.message });
        }
        if ("permission.read" in v.errors) {
          errors.push({
            permission: v.errors["permission.read"].message,
          });
        }
        if ("permission.write" in v.errors) {
          errors.push({
            permission: v.errors["permission.write"].message,
          });
        }
        eventTrigger("_Permission", "INTEGRITY_FAILED", req.user, "_PermissionUpdate", "Permission edit")
        CResponse.returnResponse(
          req,
          res,
          400,
          "Something is missing",
          false,
          errors
        );
      } else {
        if (
          req.body.permission &&
          Object.keys(req.body.permission).length > 0
        ) {
          // permission.permission = req.body.permission;
        } else {
          eventTrigger("_Permission", "INTEGRITY_FAILED", req.user, "_PermissionUpdate", "Permission edit")
          CResponse.returnResponse(
            req,
            res,
            400,
            "Permissions is missing",
            false,
            {}
          );
          return;
        }
        let isValidEntity = await Entity.findOne({
          _id: ObjectId(req.body.entity_id),
          status: 1,
        });
        console.log(isValidEntity);
        if (!isValidEntity) {
          eventTrigger("_Permission", "INTEGRITY_FAILED", req.user, "_PermissionUpdate", "Permission edit")
          CResponse.returnResponse(
            req,
            res,
            400,
            "Entity is not valid",
            false,
            {}
          );
          return;
        }

        let isValidGroup = await Group.findOne({
          _id: ObjectId(req.body.group_id),
          status: 1,
        });
        console.log(isValidGroup);
        if (!isValidGroup) {
          eventTrigger("_Permission", "INTEGRITY_FAILED", req.user, "_PermissionUpdate", "Permission edit")
          CResponse.returnResponse(
            req,
            res,
            400,
            "Group is not valid",
            false,
            {}
          );
          return;
        }

        let isAlreadyHavePermission = await Permission.find({
          group_id: ObjectId(req.body.group_id),
          entity_id: ObjectId(req.body.entity_id),
          status: 1,
        });
        console.log(isAlreadyHavePermission);
        if (isAlreadyHavePermission.length > 1) {
          eventTrigger("_Permission", "INTEGRITY_FAILED", req.user, "_PermissionUpdate", "Permission edit")
          CResponse.returnResponse(
            req,
            res,
            400,
            "Group have already permission for selected entity",
            false,
            {}
          );
          return;
        }

        var permission = {};
        permission.group_id = ObjectId(req.body.group_id);
        permission.entity_id = ObjectId(req.body.entity_id);
        permission.permission = req.body.permission;
        if (req.user._id) {
          permission.user_id = ObjectId(req.user._id);
        }

        Permission.findOneAndUpdate(
          { _id: ObjectId(req.params.id) },
          { $set: permission },
          { new: true },
          function (err, data) {
            if (err) {
              eventTrigger("_Permission", "INTEGRITY_FAILED", req.user, "_PermissionUpdate", "Permission edit")
              CResponse.returnResponse(req, res, 400, err.message, false, err);
            } else {
              eventTrigger("_Permission", "UPDATE", req.user, "_PermissionUpdate", "Permission edit")
              CResponse.returnResponse(
                req,
                res,
                200,
                "Permission has been updated",
                true,
                data
              );
            }
          }
        );
      }
    });
  } catch (err) {
    console.log(err);
    // create error logs on server crash
    eventTrigger("_Permission", "INTEGRITY_FAILED", req.user, "_PermissionUpdate", "Permission edit")
    CResponse.returnResponse(
      req,
      res,
      500,
      "Something went wrong!",
      false,
      err.message
    );
  }
};

exports.delete = function (req, res) {
  Permission.remove({ _id: req.params.id }).exec();
  var response = {};
  response.status = "true";
  response.msg = "Permission removed successfully.";
  eventTrigger("_Permission", "DELETE", req.user, "_PermissionDelete", "Permission delete")
  return res.json(response);
};

exports.enties_list = function (req, res) {
  console.log(req.user);
  var query = Entity.find(
    { status: 1, company_id: ObjectId(req.user.company_id || req.user._id) },
    { name: 1 }
  );
  query.exec(function (err, result) {
    var response = {};
    response.status = 1;
    response.data = result;
    return res.json(response);
  });
};

exports.group_list = async function (req, res) {
  console.log(req.user);
  var permissionGroupId = await Permission.find(
    { entity_id: ObjectId(req.params.id) },
    { group_id: 1, _id: 0 }
  );
  permissionGroupId = permissionGroupId.map((ele) => ObjectId(ele.group_id));
  console.log(permissionGroupId);
  Group.find({ _id: { $nin: permissionGroupId } }, function (err, result) {
    console.log(result);
    var response = {};
    response.status = 1;
    response.data = result || [];
    return res.json(response);
  });
};

exports.changeStatus = async function (req, res) {
  try {
    console.log(req.body, req.params.id, req.user);
    const v = new Validator(req.body, {
      status: "required",
    });

    await v.check().then(function (matched) {
      if (!matched) {
        var errors = [];
        if ("status" in v.errors) {
          errors.push({ status: v.errors.status.message });
        }
        CResponse.returnResponse(
          req,
          res,
          400,
          "Something is missing",
          false,
          errors
        );
        return;
      } else {
        Permission.findOneAndUpdate(
          {
            _id: ObjectId(req.params.id),
          },
          { $set: { status: req.body.status } },
          { new: true },
          (err, data) => {
            if (err) {
              CResponse.returnResponse(
                req,
                res,
                500,
                err.message || "Something went wrong",
                false,
                err
              );
            } else {
              CResponse.returnResponse(
                req,
                res,
                200,
                "Status changed successfully.",
                true,
                data
              );
            }
          }
        );
      }
    });
  } catch (err) {
    CResponse.returnResponse(
      req,
      res,
      500,
      "Something went wrong!",
      false,
      err.message
    );
  }
};
