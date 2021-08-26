var express = require("express");
var router = express.Router();
const multer = require("multer");
var crypto = require("crypto");
const mime = require("mime");
var VerifyToken = require("../configs/VerifyToken");
const { entityDataType } = require("@configs/config");
var IsAdmin = require("../middleware/isAdminPermission");
var UsersController = require("@controlller/admin/UsersController");
var CommonController = require("@controlller/admin/CommonController");
var GroupController = require("@controlller/admin/GroupController");
var EntityController = require("@controlller/admin/EntityController");
var PermissionController = require("@controlller/admin/PermissionController");
var EntityDataExpre = require("@controlller/admin/DataExploreController");
var EventController = require("@controlller/admin/EventController");
var NodesController = require("@controlller/admin/NodesController");

var userStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/users/");
  },
  filename: function (req, file, cb) {
    crypto.pseudoRandomBytes(16, function (err, raw) {
      cb(
        null,
        raw.toString("hex") + Date.now() + "." + mime.extension(file.mimetype)
      );
    });
  }
});
var ValidImage = (req, file, cb) => {
  if (
    file.mimetype == "image/png" ||
    file.mimetype == "image/jpg" ||
    file.mimetype == "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
    return cb({
      mesage: "Only .png, .jpg and .jpeg format allowed!",
      file: file,
    });
  }
};
var upload = multer({ storage: userStorage, fileFilter: ValidImage, limits: { fileSize: 5 * 1024 * 1024 }, }).single("profile_pic");

router.all("/users/add", [VerifyToken, IsAdmin], UsersController.add);
// router.all('/users/test', UsersController.test);
router.all("/users/login", UsersController.login);
router.all("/users/reset-password", UsersController.resetUserPassword);
router.all("/users/edit/:user_id", [VerifyToken, IsAdmin], UsersController.edit);
router.get("/users", [VerifyToken, IsAdmin], UsersController.getAllUser);
router.all(
  "/users/view/:user_id", [VerifyToken, IsAdmin],
  UsersController.view
);
router.get("/users/profile", [VerifyToken], UsersController.myProfile)
router.post("/users/get_notifications_list", [VerifyToken, IsAdmin], CommonController.get_notifications_list)
router.post("/users/user_logout", [VerifyToken], UsersController.user_logout)
router.put("/users/profile", [VerifyToken,
  function (req, res, next) {
    upload(req, res, function (err) {
      console.log(err)
      if (err instanceof multer.MulterError) {
        var response = { status: false, msg: err.message, errors: err.Error, };
        return res.json(response);
      } else if (err) {
        var response = { status: false, msg: err.mesage, errors: err.Error };
        return res.json(response);
      }
      next();
    });
  }
], UsersController.profile)
router.get(
  "/users/delete/:user_id", [VerifyToken, IsAdmin],
  UsersController.delete
);
router.all("/users/saveuser", [VerifyToken, IsAdmin], UsersController.saveUser);
router.all("/users/user-keys", [VerifyToken], UsersController.userWithKeys);
router.all(
  "/users/changepassword", VerifyToken,
  UsersController.changePassword
);
router.post("/users/forgot-password", UsersController.sendForgotPasswordMail);

// Group route start here
router.all("/groups/add", [VerifyToken, IsAdmin], GroupController.add);
router.put("/groups/:id", [VerifyToken, IsAdmin], GroupController.edit);
router.get("/groups/:id", [VerifyToken, IsAdmin], GroupController.view);
router.delete("/groups/:id", [VerifyToken, IsAdmin], GroupController.delete);
router.all("/groups", [VerifyToken, IsAdmin], GroupController.listGroup);

// entity route start here
router.post("/entity", [VerifyToken, IsAdmin], EntityController.add);
router.put("/entity/:id", [VerifyToken, IsAdmin], EntityController.edit);
router.put(
  "/entity/status/:id", [VerifyToken, IsAdmin],
  EntityController.changeStatus
);
router.get("/entity/view/:id", [VerifyToken, IsAdmin], EntityController.view);
router.get("/entity/ref-entity", [VerifyToken, IsAdmin], EntityController.refEntities);
router.get("/entity", [VerifyToken, IsAdmin], EntityController.listEntity);

// events route start here
router.post("/events", [VerifyToken, IsAdmin], EventController.add);
router.put("/events/:id", [VerifyToken, IsAdmin], EventController.edit);
router.put(
  "/events/status/:id", [VerifyToken, IsAdmin],
  EventController.changeStatus
);
router.get("/events/view/:id", [VerifyToken, IsAdmin], EventController.view);
router.delete("/events/:id", [VerifyToken, IsAdmin], EventController.delete);
router.get("/events/", [VerifyToken, IsAdmin], EventController.listEvents);
router.get("/events/owners-list", [VerifyToken, IsAdmin], EventController.ownersList);
// entity route start here
router.post("/permission", [VerifyToken, IsAdmin], PermissionController.add);
router.put(
  "/permission/:id", [VerifyToken, IsAdmin],
  PermissionController.edit
);
router.put(
  "/permission/status/:id", [VerifyToken, IsAdmin],
  PermissionController.changeStatus
);
router.delete(
  "/permission/:id", [VerifyToken, IsAdmin],
  PermissionController.delete
);
router.get("/permission/view/:id", [VerifyToken, IsAdmin], PermissionController.view);
router.get(
  "/permission/enties_list", [VerifyToken, IsAdmin],
  PermissionController.enties_list
);
router.get(
  "/permission/group_list/:id", [VerifyToken, IsAdmin],
  PermissionController.group_list
);
router.get(
  "/permission/:id", [VerifyToken, IsAdmin],
  PermissionController.permissionList
);

//common
router.get("/data-types", function (req, res, next) {
  res.json({ status: 1, statusCode: 200, message: "Success", data: entityDataType, });
});

// entity explore section api route -->
router.post("/data-explore", [VerifyToken, IsAdmin], EntityDataExpre.add);
router.get("/data-explore/list/:id", [VerifyToken, IsAdmin], EntityDataExpre.getTransactionList);
router.get("/data-explore/:id", [VerifyToken, IsAdmin], EntityDataExpre.getTransaction);
router.post("/data-explore/:id", [VerifyToken, IsAdmin], EntityDataExpre.transaferTransaction);
router.delete("/data-explore/:id", [VerifyToken, IsAdmin], EntityDataExpre.burnTransaction);



// License api route -->

router.post("/license", [VerifyToken, IsAdmin], NodesController.add);
router.put("/license/:id", [VerifyToken, IsAdmin], NodesController.edit);
// router.put("/license/status/:id", [VerifyToken, IsAdmin], NodesController.changeStatus);
router.get("/license/view/:id", [VerifyToken, IsAdmin], NodesController.view);
router.delete("/license/:id", [VerifyToken, IsAdmin], NodesController.delete);
router.get("/license/", [VerifyToken, IsAdmin], NodesController.listLicenses);
router.get("/nodes/view/:id", [VerifyToken, IsAdmin], NodesController.ViewNodes);
router.get("/nodes/", [VerifyToken, IsAdmin], NodesController.listNodes);
router.put("/nodes/:id", [VerifyToken, IsAdmin], NodesController.editNode);





router.post(
  "/profile", [
  VerifyToken,
  function (req, res, next) {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        var response = { success: false, msg: err.message, errors: err.Error, };
        return res.json(response);
      } else if (err) {
        var response = { success: false, msg: err.mesage, errors: err.Error };
        return res.json(response);
      }
      next();
    });
  },
],
  UsersController.profile
);

module.exports = router;