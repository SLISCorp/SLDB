var mongoose = require("mongoose");
const config = require("@configs/config");
var uniqueValidator = require("mongoose-unique-validator");
slug = require("mongoose-slug-generator");
var _ = require('lodash');
const mongooseFieldEncryption = require("mongoose-field-encryption").fieldEncryption;
var Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

var User = new Schema(
  {
    role_id: {
      type: String,
      required: true,
      enum: ["superadmin", "company", "admin", "user"],
    },
    username: { type: String, required: true, unique: true },
    usertype: { type: String, required: false },
    first_name: { type: String, required: false },
    last_name: { type: String, required: false },
    full_name: { type: String, required: false },
    city: { type: String, required: false },
    country: { type: String, required: false },
    phone: { type: String, required: false },
    image: { type: String, get: setURL },
    slug: { type: String, slug: "username" },
    groups: [{ type: Schema.Types.ObjectId, ref: 'groups' }],
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: false, minlength: 6 },
    status: { type: String, required: false, enum: ["0", "1"], default: 1 },
    public_key: String,
    private_key: String,
    notification_status: { type: String, default: 1 },
    company_id: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: [
        function (value) {
          return this.role_id == "user" || this.username == "admin"
            ? true
            : false;
        },
        "Company id is required to create the user",
      ],
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: [
        function (value) {
          return this.username == "user" ? true : false;
        },
        "Parent user is required to create the user",
      ],
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false,
    toObject: { getters: true, setters: true },
    toJSON: { getters: true, setters: true }
  }
);

function setURL(v) {
  if (_.isEmpty(v)) {
    return process.env.API_URL + "static/users/userDefault.png";
  }
  return process.env.API_URL + "static/users/" + v;
}
User.plugin(mongooseFieldEncryption, {
  fields: ["public_key", "private_key"],
  secret: config.secret_key,
});
User.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};
User.pre("save", function (next) {
  var user = this;
  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();
  // hash the password using our new salt
  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) return next(err);
    // override the cleartext password with the hashed one
    user.password = hash;
    next();
  });
});


User.plugin(uniqueValidator);
mongoose.plugin(slug);
module.exports = mongoose.model("users", User);
