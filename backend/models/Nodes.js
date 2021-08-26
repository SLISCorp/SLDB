var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
var Schema = mongoose.Schema;

var Nodes = new Schema(
    {
        licence_id: {
            type: Schema.Types.ObjectId,
            ref: "license",
        },
        node_name: { type: String, required: true },
        public_id: { type: String, required: true, unique: true },
        node_type: { type: Number, required: true },  // 1= > Data , 2=> Auth
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

Nodes.plugin(uniqueValidator, {
    message: "Provided {PATH} is already exist.",
});
module.exports = mongoose.model("nodes", Nodes, "nodes");
