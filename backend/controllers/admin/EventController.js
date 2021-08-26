const config = require("@configs/config");
const Entity = require("@model/Entity");
const User = require("@model/User");
const Events = require("@model/Events");
const niv = require("node-input-validator");
const CResponse = require("@response");
const { Validator } = niv;
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const isValidObjectId = require("@helper/isValidObjectId");
const eventTrigger = require("../../helpers/eventTrigger");

exports.add = async function (req, res) {
  console.log(req.body);
  try {
    console.log(req.body, req.user);
    const v = new Validator(req.body, {
      event_owner: "required",
      event_type: "required",
      event_name: "required",
      entity_id: "required",
      //type: "required",
      publishing_uri: "required",
      triggers: "required|array",
      "triggers.*": "required|string",
    });

    await v.check().then(function (matched) {
      if (!matched) {
        var errors = [];
        if ("event_owner" in v.errors) {
          errors.push({ event_owner: v.errors.event_owner.message });
        }
        if ("event_type" in v.errors) {
          errors.push({ event_type: v.errors.event_type.message });
        }
        if ("event_name" in v.errors) {
          errors.push({ event_name: v.errors.event_name.message });
        }
        if ("entity_id" in v.errors) {
          errors.push({ entity_id: v.errors.entity_id.message });
        }
        if ("type" in v.errors) {
          errors.push({ type: v.errors.type.message });
        }
        if ("publishing_uri" in v.errors) {
          errors.push({ publishing_uri: v.errors.publishing_uri.message });
        }
        if ("triggers" in v.errors) {
          errors.push({ triggers: v.errors.triggers.message });
        }
        eventTrigger("_Event", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body.event_name } }, "Event add")
        CResponse.returnResponse(req, res, 400, "Something is missing", false, errors);
      } else {
        if (req.user.role_id !== "admin" && req.user.role_id !== "company") {
          eventTrigger("_Event", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body.event_name } }, "Event add")
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

        var eventsData = new Events();
        eventsData.event_owner = req.body.event_owner;
        eventsData.event_name = req.body.event_name;
        eventsData.event_type = req.body.event_type;
        eventsData.company_id = req.user.company_id || req.user._id;
        eventsData.entity_id = req.body.entity_id;
        eventsData.type = req.body.type;
        eventsData.enable_event = req.body.enable_event || true;
        eventsData.node_name = req.body.node_name || null;
        eventsData.publishing_uri = req.body.publishing_uri;
        if (req.body.triggers && req.body.triggers.length > 0) {
          console.log("req.body.triggers", req.body.triggers);
          eventsData.triggers = req.body.triggers;
        } else {
          eventTrigger("_Event", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body.event_name } }, "Event add")
          CResponse.returnResponse(
            req,
            res,
            400,
            "Triggers is missing",
            false,
            {}
          );
          return;
        }
        if (req.user._id) {
          eventsData.user_id = ObjectId(req.user._id);
        }

        eventsData.save(function (err, data) {
          if (err) {
            eventTrigger("_Event", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body.event_name } }, "Event add")
            CResponse.returnResponse(req, res, 400, err.message, false, err);
          } else {
            eventTrigger("_Event", "CREATE", req.user, { ...req.body, ...{ name: req.body.event_name } }, "Event add")
            CResponse.returnResponse(
              req,
              res,
              200,
              "Event has been created.",
              true,
              data
            );
          }
        });
      }
    });
  } catch (err) {
    eventTrigger("_Event", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body.event_name } }, "Event add")
    console.log(err);
    // create error logs on server crash
    CResponse.returnResponse(
      req,
      res,
      500,
      err.message || "Something went wrong!",
      false,
      err.message
    );
  }
};

exports.listEvents = function (req, res) {
  let owner_id = req.query.owner_id;
  let event_type = req.query.event_type;
  let query = {};
  if (owner_id && event_type) {
    query = {
      event_type: event_type,
      event_owner: owner_id,
    };
  } else if (owner_id) {
    query = {
      event_owner: owner_id,
    };
  } else if (event_type) {
    query = {
      event_type: event_type,
    };
  }
  console.log(query);
  Events.find(query)
    .sort({
      created_at: -1,
    })
    .exec(async function (err, result) {
      let responseArray = [];
      await result.reduce(async (promise, ele) => {
        await promise;
        if (isValidObjectId(ele.event_owner)) {
          let user = await User.findOne(
            { _id: ele.event_owner },
            { username: 1, email: 1 }
          );
          if (user) {
            ele.event_owner = user;
          }
        }
        if (isValidObjectId(ele.entity_id)) {
          let entity = await Entity.findOne(
            { _id: ele.entity_id },
            { name: 1 }
          );
          if (entity) {
            ele.entity_id = entity;
          }
        }
        responseArray.push(ele);
      }, Promise.resolve());
      var response = {};
      response.status = 1;
      response.data = responseArray;
      return res.json(response);
    });
};

exports.view = function (req, res) {
  var query = Events.findOne({
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
  try {
    const v = new Validator(req.body, {
      // event_owner: "required",
      // event_type: "required",
      // event_name: "required",
      entity_id: "required",
      type: "required",
      publishing_uri: "required",
      triggers: "required|array",
      "triggers.*": "required|string",
    });

    await v.check().then(function (matched) {
      if (!matched) {
        var errors = [];
        if ("event_owner" in v.errors) {
          errors.push({ event_owner: v.errors.event_owner.message });
        }
        if ("event_type" in v.errors) {
          errors.push({ event_type: v.errors.event_type.message });
        }
        if ("event_name" in v.errors) {
          errors.push({ event_name: v.errors.event_name.message });
        }
        if ("entity_id" in v.errors) {
          errors.push({ entity_id: v.errors.entity_id.message });
        }
        if ("type" in v.errors) {
          errors.push({ type: v.errors.type.message });
        }
        if ("publishing_uri" in v.errors) {
          errors.push({ publishing_uri: v.errors.publishing_uri.message });
        }
        if ("triggers" in v.errors) {
          errors.push({ triggers: v.errors.triggers.message });
        }
        eventTrigger("_Event", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body.event_name } }, "Event edit")
        CResponse.returnResponse(req, res, 400, "Something is missing", false, errors
        );
      } else {
        if (req.user.role_id !== "admin" && req.user.role_id !== "company") {
          eventTrigger("_Event", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body.event_name } }, "Event edit")
          CResponse.returnResponse(req, res, 400, "Invalid permission. You don't have this permission", false, errors);
          return;
        }
        Events.findOne({ _id: ObjectId(req.params.id) }, (err, eventsData) => {
          if (err) {
            eventTrigger("_Event", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body.event_name } }, "Event edit")
            CResponse.returnResponse(req, res, 500, err.message || "Something went wrong", false, err);
          } else if (eventsData) {
            eventsData.company_id = req.user.company_id || req.user._id;
            eventsData.entity_id = req.body.entity_id || eventsData.entity_id;
            eventsData.type = req.body.type || eventsData.type;
            eventsData.publishing_uri =
              req.body.publishing_uri || eventsData.publishing_uri;
            eventsData.enable_event =
              req.body.enable_event || eventsData.enable_event;
            eventsData.node_name = req.body.node_name || eventsData.node_name;
            if (req.body.triggers && req.body.triggers.length > 0) {
              console.log("req.body.triggers", req.body.triggers);
              eventsData.triggers = req.body.triggers;
            } else {
              eventTrigger("_Event", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body.event_name } }, "Event edit")
              CResponse.returnResponse(req, res, 400, "Triggers is missing", false, {});
              return;
            }
            eventsData.save((err, data) => {
              if (err) {
                eventTrigger("_Event", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body.event_name } }, "Event edit")
                CResponse.returnResponse(
                  req,
                  res,
                  500,
                  err.message || "Something went wrong",
                  false,
                  err
                );
              } else {
                eventTrigger("_Event", "UPDATE", req.user, { ...req.body, ...{ name: req.body.event_name } }, "Event edit")
                CResponse.returnResponse(
                  req,
                  res,
                  200,
                  "Event has been updated.",
                  true,
                  data
                );
              }
            });
          } else {
            eventTrigger("_Event", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body.event_name } }, "Event edit")
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
    eventTrigger("_Event", "INTEGRITY_FAILED", req.user, { ...req.body, ...{ name: req.body.event_name } }, "Event edit")
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
  Events.remove({ _id: req.params.id }).exec();
  var response = {};
  response.status = 1;
  response.msg = "Event deleted successfully.";
  eventTrigger("_Event", "DELETE", req.user, {}, "Event delete")
  return res.json(response);
};

exports.ownersList = function (req, res) {
  console.log(req.user);
  var query = User.find({ status: 1 }, { username: 1, email: 1 });
  query.exec(function (err, result) {
    result.unshift({
      emai: "ANY OWNER",
      _id: "ANY_OWNER",
      username: "ANY OWNER",
    });
    var response = {};
    response.status = 1;
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
        Events.findOneAndUpdate(
          {
            _id: ObjectId(req.params.id),
            company_id: ObjectId(req.user.company_id),
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
