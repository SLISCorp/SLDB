"use strict";

const User = require("@model/User");
var exportFuns = {};

exportFuns.getParentUser = (user_id) => {
  exports.view = async function (req, res) {
    return new Promise(async (resolve, reject) => {
      try {
        let parentId = await User.findOne({ _id: user_id }, { user_id: 1 });
        console.log("parent id ----->", parentId);
        if (!parentId) {
          reject(false);
          return;
        }
        let parentDetail = await User.findOne({ _id: parentId.user_id });
        console.log("parentDetail id ----->", parentDetail);
        if (!parentDetail) {
          reject(false);
          return;
        }
        resolve(parentDetail);
      } catch (err) {
        reject(err);
      }
    });
  };
};

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

module.exports = exportFuns;
