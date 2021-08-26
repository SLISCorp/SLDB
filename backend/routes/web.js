var express = require("express");
var router = express.Router();
var VerifyToken = require("../configs/VerifyToken");
var IsAdmin = require("../middleware/isAdminPermission");
var EntityDataExpre = require("@controlller/web/DataExploreController");
var UsersController = require("@controlller/admin/UsersController");

// entity explore section api route -->
router.post("/data-explore", [VerifyToken, IsAdmin], EntityDataExpre.add);
router.get("/data-explore/list/:id", [VerifyToken, IsAdmin], EntityDataExpre.getTransactionList);
router.get("/data-explore/:id", [VerifyToken, IsAdmin], EntityDataExpre.getTransaction);
router.post("/data-explore/:id", [VerifyToken, IsAdmin], EntityDataExpre.transaferTransaction);
router.delete("/data-explore/:id", [VerifyToken, IsAdmin], EntityDataExpre.burnTransaction);
router.post("/login", UsersController.login);


module.exports = router;