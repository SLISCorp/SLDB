"use strict";
var exportFuns = {};
const config = require("../configs/config");
var url = "https://fcm.googleapis.com/fcm/send"
const axios = require('axios')

exportFuns.sendPushNotification = (messagePattern) => {
    console.log('pattern-------->', messagePattern)
    axios({
        method: "POST",
        url: url,
        data: JSON.stringify(messagePattern),
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'key=' + config.fcmServerKey,
        },
    }).then((result) => {
        console.log("Push notification send", result.data)
    }).catch(err => {
        console.log("Push notification error", err.message)
    })
}

module.exports = exportFuns;