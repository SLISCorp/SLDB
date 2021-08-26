const config = require("@configs/config");
const Entity = require("@model/Entity");
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
      name: "required",
      description: "required",
    });

    await v.check().then(function (matched) {
      if (!matched) {
        var errors = [];
        if ("name" in v.errors) {
          errors.push({ name: v.errors.name.message });
        }
        if ("description" in v.errors) {
          errors.push({ description: v.errors.description.message });
        }
        eventTrigger("_Schema", "INTEGRITY_FAILED", req.user, req.body, "Schema add")
        CResponse.returnResponse(
          req,
          res,
          400,
          "Something is missing",
          false,
          errors
        );
      } else {
        if (req.user.role_id !== "admin" && req.user.role_id !== "company") {
          eventTrigger("_Schema", "INTEGRITY_FAILED", req.user, req.body, "Schema add")
          CResponse.returnResponse(
            req,
            res,
            400,
            "Invalid permission. You don't have this permission",
            false,
            errors
          );
          return;
        }

        var entityData = new Entity();
        entityData.name = req.body.name;
        entityData.description = req.body.description;
        entityData.user_id = req.user._id;
        entityData.company_id = req.user.company_id || req.user._id;
        if (req.body.autoId) {
          entityData.autoId = req.body.autoId;
        }
        if (req.body.encryptAll) {
          entityData.encryptAll = req.body.encryptAll;
        }
        if (
          req.body.properties &&
          Object.keys(req.body.properties).length > 0
        ) {
          console.log("req.body.properties", req.body.properties);
          entityData.properties = req.body.properties;
          // entityData.properties = Object.entries(req.body.properties).map(
          //   ([key, ele], i) => {
          //     if (ele.refEntity) {
          //       ele.refEntity = ObjectId(ele.refEntity);
          //     } else {
          //       ele.refEntity = null;
          //     }
          //     req.body.properties[key] = ele;
          //   }
          // );
          // console.log(entityData.properties);
        } else {
          eventTrigger("_Schema", "INTEGRITY_FAILED", req.user, req.body, "Schema add")
          CResponse.returnResponse(
            req,
            res,
            400,
            "Properties is missing",
            false,
            {}
          );
          return;
        }
        if (req.user._id) {
          entityData.user_id = ObjectId(req.user._id);
        }

        entityData.save(function (err, data) {
          if (err) {
            eventTrigger("_Schema", "INTEGRITY_FAILED", req.user, req.body, "Schema add")
            CResponse.returnResponse(req, res, 400, err.message, false, err);
          } else {
            eventTrigger("_Schema", "CREATE", req.user, req.body, "Schema add")
            CResponse.returnResponse(
              req,
              res,
              200,
              "Entity has been created.",
              true,
              data
            );
          }
        });
      }
    });
  } catch (err) {
    eventTrigger("_Schema", "INTEGRITY_FAILED", req.user, req.body, "Schema add")
    console.log(err);
    // create error logs on server crash
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

exports.listEntity = function (req, res) {
  var query = Entity.find({
    status: 1,
    company_id: ObjectId(req.user.company_id),
  }).sort({
    created_at: -1,
  });
  query.exec(function (err, result) {
    var response = {};
    response.status = "success";
    response.data = result;
    return res.json(response);
  });
};

exports.view = function (req, res) {
  var query = Entity.findOne({
    status: 1,
    company_id: ObjectId(req.user.company_id),
    _id: ObjectId(req.params.id),
  });
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
      name: "required",
      description: "required",
    });

    await v.check().then(function (matched) {
      if (!matched) {
        var errors = [];
        if ("name" in v.errors) {
          errors.push({ name: v.errors.name.message });
        }
        if ("description" in v.errors) {
          errors.push({ description: v.errors.description.message });
        }
        if ("entity_id" in v.errors) {
          errors.push({ entity_id: v.errors.entity_id.message });
        }
        eventTrigger("_Schema", "INTEGRITY_FAILED", req.user, req.body, "Schema edit")
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
        Entity.findOne({ _id: ObjectId(req.params.id) }, (err, entityData) => {
          if (err) {
            CResponse.returnResponse(
              req,
              res,
              500,
              err.message || "Something went wrong",
              false,
              err
            );
          } else if (entityData) {
            if (req.body.name) entityData.name = req.body.name;
            if (req.body.description)
              entityData.description = req.body.description;
            entityData.autoId = req.body.autoId;
            entityData.encryptAll = req.body.encryptAll;
            if (
              req.body.properties &&
              Object.keys(req.body.properties).length > 0
            ) {
              entityData.properties = req.body.properties;
              // entityData.properties = [];
              // entityData.properties = req.body.properties.map((ele) => {
              //   if (ele.refEntity) {
              //     ele.refEntity = ObjectId(ele.refEntity);
              //   } else {
              //     ele.refEntity = null;
              //   }
              //   return ele;
              // });
            } else {
              eventTrigger("_Schema", "INTEGRITY_FAILED", req.user, req.body, "Schema edit")
              CResponse.returnResponse(
                req,
                res,
                400,
                "Properties is missing",
                false,
                {}
              );
              return;
            }
            entityData.save((err, data) => {
              if (err) {
                eventTrigger("_Schema", "INTEGRITY_FAILED", req.user, req.body, "Schema edit")
                CResponse.returnResponse(
                  req,
                  res,
                  500,
                  err.message || "Something went wrong",
                  false,
                  err
                );
              } else {
                eventTrigger("_Schema", "UPDATE", req.user, req.body, "Schema edit")
                CResponse.returnResponse(
                  req,
                  res,
                  200,
                  "Entity has been updated.",
                  true,
                  data
                );
              }
            });
          } else {
            eventTrigger("_Schema", "UPDATE", req.user, req.body, "Schema edit")
            CResponse.returnResponse(
              req,
              res,
              400,
              "Data Not found.",
              false,
              {}
            );
          }
        });
      }
    });
  } catch (err) {
    eventTrigger("_Schema", "UPDATE", req.user, req.body, "Schema edit")
    console.log(err);
    // create error logs on server crash
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
  Entity.remove({ _id: req.params._id }).exec();
  var response = {};
  response.status = "true";
  response.msg = "Entity deleted successfully.";
  eventTrigger("_Schema", "DELETE", req.user, {}, "Schema delete")
  return res.json(response);
};

exports.refEntities = function (req, res) {
  console.log(req.user);
  var query = Entity.find(
    { status: 1, user_id: ObjectId(req.user._id) },
    { name: 1 }
  );
  query.exec(function (err, result) {
    var response = {};
    response.status = "success";
    response.data = result;
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
        Entity.findOneAndUpdate(
          {
            _id: ObjectId(req.params.id),
            user_id: ObjectId(req.user._id),
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
