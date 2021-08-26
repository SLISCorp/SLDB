var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
var Schema = mongoose.Schema;
const { entityDataType } = require("@configs/config");

var ItemSchema = new Schema(
  {
    data_type: {
      type: String,
      enum: entityDataType,
      required: true,
    },
    properties: Array,
    items: Object,
  },
  { required: false }
);

var PropertySchema = new Schema([
  {
    name: { type: String, required: true },
    data_type: {
      type: String,
      enum: entityDataType,
      required: true,
    },
    refEntity: {
      type: Schema.Types.ObjectId,
      ref: "Entities",
      required: false,
    },
    description: { type: String },
    storeToBC: { type: Boolean, default: false },
    properties: { type: Object, default: {} },
    items: { type: Object, default: {} },
  },
]);

var Entities = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    autoId: { type: Boolean, default: false },
    encryptAll: { type: Boolean, default: false },
    properties: { type: Object },
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
    minimize: false,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false,
  }
);

Entities.plugin(uniqueValidator);
module.exports = mongoose.model("entities", Entities, "entities");
