const mongoose = require("mongoose");
const validator = require('validator');

// define schema
const UsersDeviceTokensSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    device_type: String,
    device_token: String,
}, {
    timestamps: true
});

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

UsersDeviceTokensSchema.methods.saveRecord = async function (userId, deviceToken, deviceType) {

    if (userId != "" && deviceToken != "" && deviceType != "") {

        var savePattern = {
            user_id: userId,
            device_token: deviceToken,
            device_type: deviceType,
        };

        var findPattern = { user_id: userId };

        return UsersDeviceTokens.findOne(findPattern).then(resultData => {

            if (!resultData) {

                return UsersDeviceTokens.create(savePattern).then(createRes => {
                    return createRes;
                }).catch(err => {
                    throw err;
                });

            } else {

                return UsersDeviceTokens.updateOne(findPattern, savePattern).then(updateRes => {
                    return updateRes;
                }).catch(err => {
                    throw err;
                });
            }

        }).catch(err => {
            throw err;
        });

    } else {
        return;
    }
}

UsersDeviceTokensSchema.methods.updateRecord = async function (findPattern, updatePattern) {

    return UsersDeviceTokens.updateOne(findPattern, updatePattern).then(updateRes => {
        return updateRes;
    }).catch(err => {
        throw err;
    });
}

UsersDeviceTokensSchema.methods.getRecord = async function (findPattern) {

    return UsersDeviceTokens.findOne(findPattern).then(resultData => {
        return resultData;
    }).catch(err => {
        throw err;
    });
}

UsersDeviceTokensSchema.methods.deleteRecord = async function (deletePattern) {

    return UsersDeviceTokens.deleteOne(deletePattern).then(deleteRes => {
        return deleteRes;
    }).catch(err => {
        throw err;
    });
}

UsersDeviceTokensSchema.methods.delete = async function (deletePattern) {

    return UsersDeviceTokens.deleteMany(deletePattern).then(deleteRes => {
        return deleteRes;
    }).catch(err => {
        throw err;
    });
}

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const UsersDeviceTokens = mongoose.model('users_device_tokens', UsersDeviceTokensSchema);
module.exports = UsersDeviceTokens;