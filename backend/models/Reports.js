var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Reports = new Schema(
  {
    entity: {
      type: String,
      ref: "entities",
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    group_id: {
      type: Schema.Types.ObjectId,
      ref: "groups",
      required: false,
    },
    company_id: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    action: String,
    status: { type: Number, required: false, enum: [0, 1], default: 1 },
  },
  {
    minimize: false,
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    versionKey: false,
  }
);
Reports.methods.saveRecord = async function (createPattern) {
  return Reports.create(createPattern).then(createRes => {
    return createRes;
  }).catch(err => {
    throw err;
  });
}
module.exports = mongoose.model("reports", Reports, "reports");
