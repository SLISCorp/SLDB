const User = require("@model/User");
const UsersDeviceTokens = require("@model/userDeviceToken");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const CommonController = require("./CommonController");
const Nodes = require("@model/Nodes");
const niv = require("node-input-validator");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const config = require("@configs/config");
const dbHelper = require("../../helpers/dbHelper");
var privateKEY = fs.readFileSync("configs/private.key", "utf8");
const CResponse = require("@response");
const { generateKeys } = require("@helper/bigchainDBHelper");
const eventTrigger = require("../../helpers/eventTrigger")
const _ = require("lodash")
const { Validator } = niv;
var mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

exports.getAllUser = function (req, res) {
  var query = User.find(
    { role_id: { $in: ["admin", "user"] } },
    { private_key: 0, public_key: 0 }
  ).sort({
    created_at: -1,
  });
  query.exec(function (err, result) {
    var response = {};
    response.status = 1;
    response.data = result;
    return res.json(response);
  });
};

exports.add = async function (req, res) {
  try {
    console.log(req.user);
    const v = new Validator(req.body, {
      username: "required",
      role_id: "required",
      email: "required",
      password: "required",
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
        if ("role_id" in v.errors) {
          errors.push({ role_id: v.errors.role_id.message });
        }
        if ("password" in v.errors) {
          errors.push({ password: v.errors.password.message });
        }
        // var response = { status: 0, message: 'Title already exists', response: { errors: errors } }
        // res.send(response);
        eventTrigger("_User", "INTEGRITY_FAILED", req.user, req.body, "User add", "_User")
        CResponse.returnResponse(
          req,
          res,
          400,
          "Something is missing",
          false,
          errors
        );
      } else {
        eventTrigger("_User", "INTEGRITY_FAILED", req.user, req.body, "User add", "_User")
        if (req.user.role_id !== "admin" && req.user.role_id !== "company") {
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
        let alice = generateKeys();
        console.log("alice ========>", alice);
        var user = new User();
        user.email = req.body.email;
        user.role_id = req.body.role_id;
        user.username = req.body.username;
        user.first_name = req.body.first_name;
        user.last_name = req.body.last_name;
        user.usertype = req.body.usertype;
        user.password = req.body.password;
        user.groups = req.body.groups.map((ele) => ObjectId(ele));
        user.user_id = req.user._id;
        user.company_id = req.user.company_id || req.user._id;
        user.public_key = alice.public_key;
        user.private_key = alice.private_key;

        user.save(function (err, data) {
          if (err) {
            eventTrigger("_User", "INTEGRITY_FAILED", req.user, req.body, "User add", "_User")
            CResponse.returnResponse(req, res, 400, err.message, false, err);
          } else {
            if (user.role_id === "company") {
              let names = {
                0: "SLDB-NODE-1",
                1: "SLDB-NODE-1",
                2: "SLDB-NODE-1",
                3: "SLDB-NODE-1"
              }
              let nodeIps = {
                0: config.nodeConfig.first_node_ip,
                1: config.nodeConfig.second_node_ip,
                2: config.nodeConfig.third_node_ip,
                3: config.nodeConfig.fourth_node_ip,
              }
              console.log("nodeIps -------->", nodeIps)
              for (let i = 0; i < 4; i++) {
                let node = new Nodes();
                if (names[i] && nodeIps[i]) {
                  node.node_name = names[i];
                  node.public_id = nodeIps[i];
                  node.node_type = 1;
                  node.user_id = data._id;
                  node.company_id = data._id
                }
                user.save(function (err, data) {
                  if (err) {
                    eventTrigger("_Nodes", "INTEGRITY_FAILED", req.user, req.body, "Node add", "_Nodes")
                  } else {
                    console.log("Node inserted data value -------->", data)
                  }
                })
              }
            }
            eventTrigger("_User", "CREATE", req.user, data, "User add", "_User")
            CResponse.returnResponse(
              req,
              res,
              200,
              "User has been created.",
              true,
              data
            );
          }
        });
      }
    });
  } catch (err) {
    eventTrigger("_User", "INTEGRITY_FAILED", req.user, req.body, "User add", "_User")
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

exports.edit = function (req, res) {
  //console.log(req.body);return false;
  var user = {};
  user.username = req.body.username;
  user.email = req.body.email;
  if (req.body.role_id) {
    user.role_id = req.body.role_id;
  }
  user.usertype = req.body.usertype;
  user.groups = req.body.groups.map((ele) => ObjectId(ele));
  if (req.body.password) {
    user.password = req.body.password;
  }

  User.findByIdAndUpdate(req.body._id, user, function (err) {
    if (err) {
      eventTrigger("_User", "INTEGRITY_FAILED", req.user, user, "User edit")
      var response = {};
      response.status = "false";
      response.msg = "Something went wrong.";
      return res.json(response);
    } else {
      eventTrigger("_User", "UPDATE", req.user, user, "User edit")
      var response = {};
      response.status = "true";
      response.msg = "User updated successfully.";
      return res.json(response);
    }
  });
};

exports.delete = async function (req, res) {
  console.log(req.params.user_id);
  let user = await User.findOne({ _id: req.params.user_id })
  User.remove({ _id: req.params.user_id }).exec();
  var response = {};
  response.status = "true";
  response.msg = "User deleted successfully.";
  eventTrigger("_User", "DELETE", req.user, user, "User delete")
  return res.json(response);
};

exports.view = function (req, res) {
  var query = User.findOne({ _id: req.params.user_id });
  query.exec(function (err, result) {
    var response = {};
    response.status = "success";
    response.data = result;
    return res.json(response);
  });
};

exports.myProfile = (req, res) => {
  var query = User.findOne({ _id: req.user._id }).populate([
    { path: "groups", select: "_id title description " },
    { path: "user_id", select: "_id username email" }
  ])
  query.exec(function (err, result) {
    var response = {};
    response.status = 1;
    response.data = result;
    return res.json(response);
  });
}

exports.login = async function (req, res) {
  try {
    console.log({
      $or: [
        { email: req.body.email.toLowerCase() },
        { username: req.body.email },
      ],
    });
    User.findOne(
      {
        $or: [
          { email: req.body.email.toLowerCase() },
          { username: req.body.email },
        ],
      },
      async (err, user) => {
        console.log("user-------->", user);
        if (err) throw err;
        if (!user) {
          res.json({
            success: false,
            message: "Authentication Failed, User not found.",
          });
        } else if (user) {
          if (!user.private_key && !user.public_key) {
            let alice = generateKeys();
            user.public_key = alice.public_key;
            user.private_key = alice.private_key;
            user.user_id = user.user_id || user._id;
            user.company_id = user.company_id || user._id;
            user = await user.save();
            console.log("user   -------->", user);
          }

          var validPassword = user.validPassword(req.body.password);
          if (!validPassword) {
            res.json({
              success: false,
              message: "Authentication Faild, Wrong password.",
            });
          } else {
            if (user.role_id === "company") {
              let names = {
                0: "SLDB-NODE-1",
                1: "SLDB-NODE-2",
                2: "SLDB-NODE-3",
                3: "SLDB-NODE-4"
              }
              let nodeIps = {
                0: config.nodeConfig.first_node_ip,
                1: config.nodeConfig.second_node_ip,
                2: config.nodeConfig.third_node_ip,
                3: config.nodeConfig.fourth_node_ip,
              }
              console.log("nodeIps -------->", nodeIps)
              let nodesInDb = await Nodes.find({ company_id: user.company_id });
              console.log("nodesInDb ----------->", nodesInDb);
              if (nodesInDb.length <= 0) {
                for (let i = 0; i < 4; i++) {
                  let node = new Nodes();
                  if (names[i] && nodeIps[i]) {
                    node.node_name = names[i];
                    node.public_id = nodeIps[i];
                    node.node_type = 1;
                    node.user_id = user.company_id || user._id;
                    node.company_id = user.company_id || user._id
                  }
                  await node.save(function (err, data) {
                    if (err) {
                      console.log("errrrr ------->", err)
                      eventTrigger("_Nodes", "INTEGRITY_FAILED", user, node, "Node add", "_Nodes")
                    } else {
                      console.log("Node inserted data value -------->", data)
                    }
                  })
                }
              }
            }
            const {
              _id,
              role_id,
              username,
              first_name,
              last_name,
              email,
              user_id,
              company_id,
              private_key,
              public_key,
            } = user;
            user = JSON.parse(JSON.stringify(user));
            const token = jwt.sign(
              {
                _id,
                role_id,
                username,
                first_name,
                last_name,
                email,
                user_id,
                company_id,
                private_key,
                public_key,
              },
              privateKEY,
              config.signOptions
            );

            if (!["company", "admin", "user"].includes(user.role_id)) {
              res.json({
                success: false,
                message: "Authentication Faild, Wrong user.",
              });
            } else {
              var tokenObj = new UsersDeviceTokens;
              var device_token = req.body.fcmToken;
              var device_type = req.body.device_type;
              if (device_token)
                await tokenObj.saveRecord(user._id, device_token, device_type);
              res.json({
                success: true,
                message: "User login Successfully",
                token: token,
                data: user,
              });
            }
          }
        }
      }
    );
  }
  catch (err) {
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

exports.user_logout = (req, res) => {

  try {

    var login_user_id = req.user._id;
    var device_type = req.body.device_type;
    var device_token = req.body.fcmToken;

    var tokenObj = new UsersDeviceTokens;

    var deletePattern = {};
    deletePattern.user_id = login_user_id;
    deletePattern.device_type = device_type;
    deletePattern.device_token = device_token;

    tokenObj.deleteRecord(deletePattern).then(tokenRes => {

      // success
      res.json({
        status: true,
        message: "User logout Successfully",
        data: tokenRes,
      });

    }).catch(err => {

      // error
      res.json({
        status: false,
        message: "User logout error",
        data: {},
      });
    });

  } catch (err) {
    // create error logs on server crash
    res.json({
      status: false,
      message: "User logout error",
      data: err,
    });
  }
};

exports.sendForgotPasswordMail = function (req, res) {
  var response = {
    success: false,
    message: "Invalid Request",
    errors: [],
    results: [],
  };
  if (req.body.email != "") {
    var user = new User();
    User.findOne({ email: req.body.email }, function (err, obj) {
      if (obj) {
        var reset_pwd_link = config.site_url + "reset-password/" + Buffer.from(obj._id.toString()).toString("base64");
        var params = {};
        params.slug = "forget_password";
        params.to = req.body.email;
        params.params = {};
        params.params.USERNAME = obj.username;
        params.params.reset_pwd_link = reset_pwd_link;
        CommonController.sendMail(params);
        response.success = true;
        response.message = "Please check your email to reset your password.";
        return res.json(response);
      } else {
        response.success = false;
        response.message = "No account registered with this email";
        return res.json(response);
      }
    });
  } else {
    var response = {};
    response.success = false;
    response.msg = "Email is required";
    return res.json(response);
  }
};

exports.resetUserPassword = async function (req, res) {
  if (
    req.body.password != "" &&
    req.body.password == req.body.confirm_password
  ) {
    let hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    User.update(
      { _id: req.body.id },
      {
        password: hashedPassword,
      },
      function (err, affected, resp) {
        if (err) {
          var response = {};
          response.status = "error";
          response.msg = err.message;
          return res.json(response);
        } else {
          var response = {};
          response.status = 1;
          response.msg = "Password reset successfully.";
          return res.json(response);
        }
      }
    );
  } else {
    var response = {};
    response.status = "error";
    response.msg = "Password and confirm password not matched or missing";
    return res.json(response);
  }
};

exports.saveUser = function (req, res) {
  var user = {};
  user.email = req.body.email;
  user.first_name = req.body.first_name;
  user.last_name = req.body.last_name;
  user.city = req.body.city;
  user.country = req.body.country;
  user.phone = req.body.phone;
  User.findByIdAndUpdate(req.body._id, user, function (err) {
    var response = {};
    response.status = "true";
    response.msg = "Profile Updated Successfully";
    return res.json(response);
  });
};

exports.changePassword = function (req, res) {
  console.log(req);
  var query = User.findOne({ _id: req.body.id ? req.body.id : req.user._id });
  query.exec(function (err, result) {
    if (result != null) {
      var user = {};
      user.password = req.body.password;
      bcrypt.hash(user.password, 10, function (err, hash) {
        if (err) {
          var response = {};
          response.status = "error";
          response.msg = err;
          return res.json(response);
        }
        // override the cleartext password with the hashed one
        user.password = hash;
        User.findByIdAndUpdate(req.body.id, user, function (err) {
          var response = {};
          response.status = "success";
          response.msg = "Password Changed Successfully";
          return res.json(response);
        });
      });
    } else {
      var response = {};
      response.status = "error";
      response.msg = "Old Password is not correct.";
      return res.json(response);
    }
  });
};

exports.profile = async (req, res) => {
  let theBody = req.body;
  var response = {
    status: 0,
    msg: "Invalid Request",
    errors: [],
    results: [],
  };
  var id = req.user._id;
  var { firstName, lastName, phone, country, city } = theBody;
  let params = { firstName, lastName, phone, country, city };
  let constraints = {
    firstName: "required",
    phone: "required",
  };

  let v = new Validator(params, constraints);
  let matched = await v.check();
  if (!matched) {
    response["msg"] = "Required fields missing";
    response['status'] = 0
    response["errors"] = v.errors;
    return res.json(response);
  }
  try {
    const theUser = await User.findOne({ _id: id });
    if (_.isEmpty(theUser)) {
      response.msg = Messages.PUT_PROFILE_NOT_FOUND;
      return res.json(response);
    }
    let updateObj = {};
    updateObj.first_name = params.firstName;
    updateObj.last_name = params.lastName;
    updateObj.phone = params.phone;
    if (params.country)
      updateObj.country = params.country;
    if (params.city)
      updateObj.city = params.city;
    if (typeof req.file !== "undefined") {
      updateObj.image = req.file.filename;
    }
    await User.findOneAndUpdate(
      { _id: id },
      updateObj,
      { new: true },
      async function (err, uUpdated) {
        if (err) {
          response.success = false;
          response.msg = err;
          return res.json(response);
        }
        const latestTheUser = await User.findOne({ _id: id });
        const { _id, role_id, username, first_name, last_name, email, user_id, company_id, private_key, public_key } = latestTheUser;
        const token = jwt.sign({ _id, role_id, username, first_name, last_name, email, user_id, company_id, private_key, public_key }, privateKEY, config.signOptions);
        response.token = token;
        if (!_.isEmpty(uUpdated)) {
          response.status = 1;
          response.data = uUpdated;
          response.msg = "Profile update successfully";
        } else {
          response.status = 0;
          response.msg = "Error in profile update";
        }
        return res.json(response);
      }
    );
  } catch (err) {
    response.msg = err.message;
    return res.json(response);
  }
};

exports.userWithKeys = async (req, res) => {
  var query = User.find({ status: 1 }).sort({
    created_at: -1,
  });
  query.exec(function (err, result) {
    var response = {};
    response.status = 1;
    result = result.map((ele) => {
      let obj = {};
      obj.private_key = ele.private_key;
      obj.public_key = ele.public_key;
      obj._id = ele._id;
      obj.username = ele.username;
      obj.email = ele.email;
      return obj;
    });
    response.data = result;
    return res.json(response);
  });
};
