var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
slug = require("mongoose-slug-generator");
var Schema = mongoose.Schema;
var Group = new Schema(
  {
    title: {
      type: String,
      required: false,
      required: true,
      unique: true,
      index: true,
    },
    description: { type: String, required: false },
    slug: { type: String, slug: "title" },
    status: { type: String, required: false, enum: ["0", "1"], default: 1 },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    company_id: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false,
  }
);
Group.plugin(uniqueValidator);
module.exports = mongoose.model("groups", Group);
