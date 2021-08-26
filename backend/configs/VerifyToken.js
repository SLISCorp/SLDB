var jwt = require("jsonwebtoken");
const fs = require("fs");
var config = require("./config");
var publicKEY = fs.readFileSync("configs/public.key", "utf8");
function verifyToken(req, res, next) {
  var token = req.headers["x-access-token"];
  if (!token) {
    var response = { success: false, auth: false, msg: "No token provided" };
    return res.status(403).send(response);
  }
  jwt.verify(token, publicKEY, config.signOptions, function (err, decoded) {
    if (err) {
      var response = {
        success: false,
        auth: false,
        msg: "Failed to authenticate token",
      };
      return res.status(403).send(response);
    }
    if (decoded.role_id === "company") {
      decoded.user_id = decoded._id;
      decoded.company_id = decoded._id;
    }
    req.user = decoded;
    console.log(req.user)
    next();
  });
}
module.exports = verifyToken;
