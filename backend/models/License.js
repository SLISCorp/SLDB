var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
var Schema = mongoose.Schema;

var License = new Schema(
    {
        license_lable: { type: String, required: true },
        start_date: { type: Date, required: true },
        validity: { type: Number, required: true },
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

License.plugin(uniqueValidator, {
    message: "Provided {PATH} is already exist.",
});
module.exports = mongoose.model("license", License, "licenses");
