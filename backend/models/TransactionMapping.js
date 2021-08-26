var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
var Schema = mongoose.Schema;
var TransactionSchema = new Schema(
  {
    transaction_id: String,
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    entity_id: {
      type: Schema.Types.ObjectId,
      ref: "entities",
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

TransactionSchema.plugin(uniqueValidator);
module.exports = mongoose.model(
  "transactions",
  TransactionSchema,
  "transactions"
);
