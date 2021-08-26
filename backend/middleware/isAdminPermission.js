"use strict";

// const ErrorLogs = require('../models/ErrorLogs');

//++++++++++++++++++++++++++++++++++++++++++ APPLICATION MIDDLEWARES +++++++++++++++++++++++++++++++++++++++++++
const IsAdmin = (request, response, next) => {
  // return a middleware
  const { user } = request;
  if (
    user &&
    user.role_id &&
    ["admin", "superadmin", "company"].includes(user.role_id)
  ) {
    next(); // role is allowed, so continue on the next middleware
  } else {
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
