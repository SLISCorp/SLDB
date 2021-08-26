const mongoose = require("mongoose");
const Users = require("../models/User");
const UsersDeviceTokens = require("../models/userDeviceToken");
const { sendPushNotification } = require("../helpers/sendPushNotification");
const config = require("@configs/config");
const ObjectId = mongoose.Types.ObjectId;
// define schema
const UserNotificationsSchema = new mongoose.Schema(
    {
        user_id: { type: mongoose.Types.ObjectId, ref: "users", required: false },
        isEvent: { type: Boolean, default: false },
        action_type: String,
        action_by: { type: mongoose.Types.ObjectId, ref: "users", required: false },
        redirection: String,
        redirection_id: String,
        title: String,
        message: String,
    },
    {
        timestamps: true,
    }
);

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

UserNotificationsSchema.methods.saveRecord = async function (createPattern, other_detail = {}) {
    return UserNotifications.create(createPattern)
        .then((createRes) => {
            return UserNotifications.findOne({ _id: createRes._id })
                .populate("action_by", "username image")
                .then((notfObj) => {
                    notfObj.action_by = {
                        _id: notfObj.action_by._id,
                        name: notfObj.action_by.name,
                        image: notfObj.action_by.image
                    };
                    notfObj.title = config.siteTitle;
                    notfObj.message = getMessage(notfObj.action_type, notfObj.action_by, other_detail);
                    // call send notification function
                    sendNotification(notfObj);
                    return notfObj;
                })
                .catch((err) => {
                    throw err;
                });
        })
        .catch((err) => {
            console.log(err);
        });
};

UserNotificationsSchema.methods.sendNotification = (pattern) => {
    console.log("sendingg in...........")
    sendNotification(pattern);
};

UserNotificationsSchema.methods.getRecord = async function (findPattern) {
    return UserNotifications.findOne(findPattern)
        .then((findRes) => {
            return findRes;
        })
        .catch((err) => {
            throw err;
        });
};

UserNotificationsSchema.methods.deleteRecord = async function (deletePattern) {
    return UserNotifications.deleteOne(deletePattern)
        .then((deleteRes) => {
            return deleteRes;
        })
        .catch((err) => {
            throw err;
        });
};

UserNotificationsSchema.methods.getUserNotificationsList = async function (
    findPattern,
    sortPattern,
    page_no,
    limit
) {
    var skip = (page_no - 1) * limit;

    var countQuery = UserNotifications.find().where(findPattern).countDocuments();

    var dataQuery = UserNotifications.find().populate(
        "action_by",
        "name image"
    );
    dataQuery.where(findPattern).sort(sortPattern).skip(skip).limit(limit);

    return dataQuery.exec().then((notificationsData) => {
        var modifiedArray = notificationsData.map((notfObj) => {
            notfObj.action_by = {
                user_id: notfObj.action_by && notfObj.action_by._id,
                name: notfObj.action_by && notfObj.action_by.name,
                user_image: notfObj.action_by && notfObj.action_by.image
            };
            // notfObj.title = config.siteTitle;
            notfObj.message = notfObj.isEvent && notfObj.message || getMessage(notfObj.action_type, notfObj.action_by);

            return notfObj;
        });

        return countQuery.exec().then((total_count) => {
            return {
                current_page: page_no,
                total_pages: Math.ceil(total_count / limit),
                total_count: total_count,
                data: modifiedArray,
            };
        });
    });
};

UserNotificationsSchema.methods.removeNotificationsData = async function (
    user1Id,
    user2Id
) {
    var findPattern = {
        $or: [
            { user_id: user1Id, action_by: user2Id },
            { user_id: user2Id, action_by: user1Id },
        ],
    };

    return UserNotifications.deleteMany(findPattern)
        .then((deleteRes) => {
            return deleteRes;
        })
        .catch((err) => {
            throw err;
        });
};

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

function getMessage(actionType, actionUser, other_detail = {}) {
    var message = "";

    switch (actionType) {
        case "_GroupAdd":
            message = actionUser.name + " Add new group " + other_detail.name;
            break;
        case "_GroupEdit":
            message = actionUser.name + " Update group detail " + other_detail.name;;
            break;
        case "_UserAdd":
            message = actionUser.name + " Add new user " + other_detail.name;;
            break;
        case "_UserEdit":
            message = actionUser.name + " Update user " + other_detail.name + " detail";
            break;
        case "_SchemaAdd":
            message = actionUser.name + " Add new schema " + other_detail.name;
            break;
        case "_SchemaUpdate":
            message = actionUser.name + "Update schema " + other_detail.name + " detail ";
            break;
        case "_EventAdd":
            message = actionUser.name + " Add new event " + other_detail.name;;
            break;
        case "_EventEdit":
            message = actionUser.name + " Update event " + other_detail.name + " detail";
            break;
        case "_PermissionAdd":
            message = actionUser.name + " Add permission for entity " + other_detail.name;;
            break;
        case "_PermissionUpdate":
            message = actionUser.name + " Update permisssion detail " + other_detail.name;;
            break;
        case "_AddTransaction":
            message = actionUser.name + " add new transaction with ID:" + other_detail.transaction_id;
            break;
        case "_TransferTransaction":
            message = actionUser.name + " transfer transaction with ID:" + other_detail.transaction_id;
            break;
        case "BurnTransaction":
            message = actionUser.name + " burn transaction with ID:" + other_detail.transaction_id;
            break;
    }
    return message;
}

// function to send notification
function sendNotification(createPattern) {
    console.log("createPattern -------->1", createPattern)
    Users.findOne({ _id: ObjectId(createPattern.user_id) })
        .then((userData) => {
            if (userData) {
                if (userData.notification_status == 1 || userData.notification_status === undefined) {
                    UsersDeviceTokens.find({ user_id: ObjectId(createPattern.user_id) })
                        .then((all_tokens) => {
                            if (all_tokens && all_tokens.length > 0) {
                                all_tokens.forEach(function (token_data) {
                                    console.log("token_data----------->", token_data)
                                    let messagePattern = {
                                        notification: {
                                            title: createPattern.title,
                                            body: createPattern.message,
                                            click_action: createPattern.redirection,
                                            icon: "http://url-to-an-icon/icon.png"
                                        },
                                        to: token_data.device_token
                                    }
                                    console.log("sendingg ...........>>", messagePattern)
                                    sendPushNotification(messagePattern);
                                });
                            }
                            if (createPattern.token) {
                                var messagePattern = {
                                    notification: {
                                        title: createPattern.title,
                                        body: createPattern.message,
                                        click_action: createPattern.redirection,
                                        icon: "http://url-to-an-icon/icon.png"
                                    },
                                    to: createPattern.token
                                }
                                sendPushNotification(messagePattern);
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                }
            } else if (createPattern.token) {
                var messagePattern = {
                    to: createPattern.token,
                    data: createPattern,
                    notification: {
                        title: createPattern.title,
                        body: createPattern.message,
                    },
                };
                sendPushNotification(messagePattern);
            }
        })
        .catch((err) => {
            console.log(err);
        });
}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

const UserNotifications = mongoose.model(
    "user_notifications",
    UserNotificationsSchema
);
module.exports = UserNotifications;
