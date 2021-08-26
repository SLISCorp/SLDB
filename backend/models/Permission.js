var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
var Schema = mongoose.Schema;

var Permission = new Schema(
  {
    entity_id: { type: Schema.Types.ObjectId, ref: "entities", required: true },
    group_id: { type: Schema.Types.ObjectId, ref: "groups", required: true },
    permission: {
      read: { type: Boolean, default: false },
      encrypt: { type: Boolean, default: false },
      write: { type: Boolean, default: false },
    },
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
    status: { type: Number, required: false, enum: [0, 1], default: 1 },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false,
  }
);

Permission.plugin(uniqueValidator);
module.exports = mongoose.model("permissions", Permission);
