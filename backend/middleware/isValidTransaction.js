"use strict";
const Group = require("@model/Group");
//++++++++++++++++++++++++++++++++++++++++++ APPLICATION MIDDLEWARES +++++++++++++++++++++++++++++++++++++++++++
const IsAdmin = (request, response) => {
  // return a middleware
  const { user } = request;
  const {entity_id} = request.body
  if (
    user &&
    user.role_id &&
    ["admin", "superadmin", "company"].includes(user.role_id)
  ) {
  } else {

    let permission = await Group.find({entity_id:entity_id})
    response.json({
      status: 0,
      forbidden: 1,
      statusCode: 403,
      message: "Forbidden",
      data: {},
    });
    return;
  }
};

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

module.exports = IsAdmin;
