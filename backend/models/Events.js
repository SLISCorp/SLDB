var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
var Schema = mongoose.Schema;

var Events = new Schema(
  {
    event_owner: {
      // who made action to trigger the event
      type: String,
      ref: "users",
      required: true,
      default: "ANY_OWNER",
    },
    event_type: { type: String, required: true, enum: ["DATA", "SYSTEM"] }, // "DATA","SYSTEM"
    event_name: { type: String, required: true, unique: true }, // a valid non space name for event
    entity_id: {
      // ID of enetity on which action performed or string for system specific action
      required: true,
      ref: "entities",
      type: String,
    },
    type: {
      // the type of the event; possible values: HTTP, TCP, WS, RABBITMQ
      type: String,
      required: true,
      enum: ["HTTP", "TCP", "WQ", "INTERNALMQ", "RABBITMQ"],
    },
    publishing_uri: { type: String, required: true },
    node_name: { type: String, default: null },
    enable_event: { type: Boolean, required: true, default: true },
    triggers: { type: Array, default: [], required: true }, //["CREATE","TRANSFER","INTEGRITY_FAILED","DELETE","UPDATE"]
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

Events.path("publishing_uri").validate((val) => {
  urlRegex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;
  return urlRegex.test(val);
}, "Invalid URL.");

Events.path("event_name").validate((val) => {
  urlRegex = /^\S+\w{1,32}\S{1,}/;
  return urlRegex.test(val);
}, "Invalid event name.");

Events.plugin(uniqueValidator, {
  message: "Provided {PATH} is already exist.",
});
module.exports = mongoose.model("events", Events, "events");
