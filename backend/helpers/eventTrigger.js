const User = require("@model/User");
const Event = require("@model/Events");
const UserNotifications = require("@model/userNotification");
const UserDeviceToken = require("@model/userDeviceToken");

function getType(type, trigger) {
    return type + trigger
}

function getMessage(actionType, actionUser, other_detail = {}, trigger) {
    var message = "";
    switch (getType(actionType, trigger)) {

        // group events
        case "_GroupCREATE":
            message = (actionUser.username || "") + " ADD new group " + (other_detail.name || "");
            break;
        case "_GroupUPDATE":
            message = (actionUser.username || "") + " UPDATE group detail " + (other_detail.name || "");
            break;
        case "_GroupINTEGRITY_FAILED":
            message = (actionUser.username || "") + " has error in update group detail";
            break;
        case "_GroupDELETE":
            message = (actionUser.username || "") + " DELETE group";
            break;

        // user evenst
        case "_UserCREATE":
            message = (actionUser.username || "") + " ADD new user " + (other_detail.username || "");
            break;
        case "_UserUPDATE":
            message = (actionUser.username || "") + " UPDATE user " + (other_detail.username || "");
            break;
        case "_UserDELETE":
            message = (actionUser.username || "") + " DELETE user " + (other_detail.username || "");
            break;
        case "_UserINTEGRITY_FAILED":
            message = (actionUser.username || "") + " has rrror in update user " + (other_detail.username || "") + " detail";
            break;

        // schema events
        case "_SchemaCREATE":
            message = (actionUser.username || "") + " ADD new schema " + (other_detail.name || "")
            break;
        case "_SchemaUPDATE":
            message = (actionUser.username || "") + "UPDATE schema " + (other_detail.name || "") + " detail ";
            break;
        case "_SchemaDELETE":
            message = (actionUser.username || "") + "DELETE schema detail";
            break;
        case "_SchemaINTEGRITY_FAILED":
            message = (actionUser.username || "") + "  has error in update schema " + (other_detail.name || "") + " detail ";
            break;

        // event events
        case "_EventCREATE":
            message = (actionUser.username || "") + " ADD new event " + (other_detail.name || "");
            break;
        case "_EventUPDATE":
            message = (actionUser.username || "") + " UPDATE event " + (other_detail.name || "") + " detail";
            break;
        case "_EventDELETE":
            message = (actionUser.username || "") + " DELETE event detail"
            break;
        case "_EventINTEGRITY_FAILED":
            message = (actionUser.username || "") + " has error in update event " + (other_detail.name || "") + " detail";
            break;

        // permisiion events
        case "_PermissionCREATE":
            message = (actionUser.username || "") + " ADD permission for entity";
            break;
        case "_PermissionUPDATE":
            message = (actionUser.username || "") + " UPDATE permisssion detail for entity";
            break;
        case "_PermissionDELETE":
            message = (actionUser.username || "") + " DELETE permisssion for entity";
            break;
        case "_PermissionINTEGRITY_FAILED":
            message = (actionUser.username || "") + " has error in update permisssion for entity";
            break;

        // Licence events
        case "_LicensesCREATE":
            message = (actionUser.username || "") + " ADD licence";
            break;
        case "_LicensesUPDATE":
            message = (actionUser.username || "") + " UPDATE licence detail";
            break;
        case "_LicensesDELETE":
            message = (actionUser.username || "") + " DELETE licence";
            break;
        case "_LicensesINTEGRITY_FAILED":
            message = (actionUser.username || "") + " has error in update licence";
            break;

        // Nodes events
        case "_NodesCREATE":
            message = (actionUser.username || "") + " ADD licence";
            break;
        case "_NodesUPDATE":
            message = (actionUser.username || "") + " UPDATE licence detail";
            break;
        case "_NodesDELETE":
            message = (actionUser.username || "") + " DELETE licence";
            break;
        case "_NodesINTEGRITY_FAILED":
            message = (actionUser.username || "") + " has error in update licence";
            break;

        // transaction events
        case "DATACREATE":
            message = (actionUser.username || "") + " ADD a new transaction"
            break;

        case "DATATRANSFER":
            message = (actionUser.username || "") + " transfer a transaction"
            break;

        case "DATADELETE":
            message = (actionUser.username || "") + " burn a transaction"

        case "DATAINTEGRITY_FAILED":
            message = (actionUser.username || "") + " has error in transaction opration";
            break;
    }
    return message;
}


module.exports = async (type, trigger, user, detail, title, entity_id) => {
    console.log(" ------>", type, trigger, detail, title)
    if (["DATA"].includes(type)) {
        var events = await Event.find({ event_type: "DATA", enable_event: true, $or: [{ event_owner: "ANY_OWNER" }, { event_owner: user._id }], entity_id: detail.entity_id ? detail.entity_id : entity_id, triggers: { $in: [trigger] } })
    } else {
        console.log(JSON.stringify({ event_type: "SYSTEM", enable_event: true, $or: [{ event_owner: "ANY_OWNER" }, { event_owner: user._id }], entity_id: entity_id || type, triggers: { $in: [trigger] } }))
        var events = await Event.find({ event_type: "SYSTEM", enable_event: true, $or: [{ event_owner: "ANY_OWNER" }, { event_owner: user._id }], entity_id: entity_id || type, triggers: { $in: [trigger] } })
    }
    console.log("events", events)
    if (events.length > 0) {
        let adminIds = await User.find({ $or: [{ role_id: "admin" }, { role_id: "company" }] })
        var savePattern = {
            // user_id: user._id,
            isEvent: true,
            action_type: type,
            // action_by: user._id,
            redirection: "http://localhost:3001",
            redirection_id: user.id,
            message: getMessage(type, user, detail, trigger),
            title: title
        }
        await UserNotifications.create(savePattern)

        adminIds.map(ele => {
            console.log(ele._id)
            let newSave = { ...savePattern }
            let notfObj = new UserNotifications();
            newSave.user_id = ele._id;
            console.log("newSave ------->", newSave)
            notfObj.sendNotification(newSave);
        })
    }

}

