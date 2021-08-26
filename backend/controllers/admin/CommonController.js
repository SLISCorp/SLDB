const config = require('@configs/config')
const nodemailer = require("nodemailer");
var mongoose = require('mongoose');
const User = require("@model/User");
const Email = require("@model/Email");
const CResponse = require("@response");
const UserNotifications = require("@model/userNotification");
const { calculateNotificationTime } = require("../../helpers/common")
async function sendMail(params) {
    var result = await Email.findOne({ 'slug': params.slug });

    if (!result) {
        console.log('email template not found.')
        return false;
    }
    result = JSON.parse(JSON.stringify(result));

    var message = result.content;
    params.params.site_url = config.site_url;
    params.params.admin_mail = config.admin_mail;
    params.params.site_name = config.site_name;
    for (prop in params.params) {
        var val = params.params[prop];
        //message = message.replace("{{"+prop+"}}",val);	
        message = message.replace(new RegExp("{{" + prop + "}}", 'gi'), val);
    }
    var smtpTransport = nodemailer.createTransport({
        host: config.senderHost,
        port: config.senderPort,
        secure: false, // true for 465, false for other ports
        auth: {
            user: config.email_from,
            pass: config.email_auth_password
        }
    });

    var mail = {
        from: config.email_from,
        to: params.to,
        subject: result.subject,
        html: message
    }
    smtpTransport.sendMail(mail, function (error, response) {
        console.log('response->', response, error);
        smtpTransport.close();
        if (error) {
            return true;
        } else {
            return false;
        }
    });


}

exports.sendMail = sendMail;

exports.testmail = function (req, res) {
    var params = {};
    params.slug = 'user_register';
    params.to = 'ankit.pandey@octalinfosolution.com';
    params.subject = 'Send Email Using Node.js';
    params.params = {};
    params.params.name = 'Ankit';
    sendMail(params);

    var response = {};
    response.status = 'success';
    response.msg = 'mail sent successfully';
    return res.json(response);
};

exports.gameSetting = function (req, res) {
    var query = GameSetting.findOne();
    query.exec(function (err, result) {
        var response = {};
        response.status = 'success';
        response.data = result;
        return res.json(response);
    });
};

exports.saveGameSetting = function (req, res) {
    var gameSetting = {};
    gameSetting.game_start_date = req.body.game_start_date;
    gameSetting.game_end_date = req.body.game_end_date;
    GameSetting.findOneAndUpdate(req.body._id, gameSetting, { new: true, upsert: true }, function (err) {
        var response = {};
        response.status = 'true';
        response.msg = 'Game Setting Updated Successfully';
        return res.json(response);
    });
};

exports.gameVideos = function (req, res) {
    var query = GameVideo.find();
    query.exec(function (err, result) {
        var response = {};
        response.status = 'success';
        response.data = result;
        return res.json(response);
    });
};

exports.addGameVideos = function (req, res) {
    var gameVideo = new GameVideo();
    gameVideo.category = req.body.category;
    gameVideo.title = req.body.title;
    gameVideo.video = req.body.video;
    gameVideo.short_description = req.body.short_description;

    gameVideo.save(function (err) {
        if (err) {
            var response = {};
            response.status = 'error';
            response.msg = err.message;
            return res.json(response);
        } else {
            var response = {};
            response.status = 'true';
            response.msg = 'Game video added successfully.';
            return res.json(response);
        }

    });
};

exports.deleteGameVideo = function (req, res) {
    GameVideo.remove({ _id: req.params.user_id }).exec();
    var response = {};
    response.status = 'true';
    response.msg = 'Game Video deleted successfully.';
    return res.json(response);
};

exports.updateStatusGameVideo = function (req, res) {
    var gameVideo = {};
    gameVideo.status = req.params.status;
    GameVideo.findByIdAndUpdate(req.params.id, gameVideo, function (err) {
        var response = {};
        response.status = 'true';
        response.msg = 'Status successfully changed.';
        return res.json(response);
    });

};

exports.viewGameVideo = function (req, res) {
    var query = GameVideo.findOne({ '_id': req.params.id });
    query.exec(function (err, result) {
        var response = {};
        response.status = 'success';
        response.data = result;
        return res.json(response);
    });
};

exports.editGameVideo = function (req, res) {
    var gameVideo = {};
    gameVideo.title = req.body.title;
    gameVideo.video = req.body.video;
    gameVideo.short_description = req.body.short_description;
    gameVideo.category = req.body.category;
    GameVideo.findByIdAndUpdate(req.body._id, gameVideo, function (err) {
        if (err) {
            var response = {};
            response.status = 'false';
            response.msg = 'Something went wrong.';
            return res.json(response);
        } else {
            var response = {};
            response.status = 'true';
            response.msg = 'Game Video updated successfully.';
            return res.json(response);
        }

    });
};

exports.get_notifications_list = (req, res) => {
    try {
        // console.log(req.body);
        var userData = req.user;
        console.log(userData)
        if (!userData || !userData._id) {
            CResponse.returnResponse(
                req,
                res,
                401,
                "Invalid user access",
                false,
                {}
            );
            return;
        }
        var page_no = req.body.page_no
            ? +req.body.page_no
                ? +req.body.page_no
                : 1
            : 1;
        var limit = 10000;

        var findPattern = {
            $or: [{
                user_id: userData._id
            }, { isEvent: true }]
        };

        var sortPattern = { createdAt: -1 };

        var notificationObj = new UserNotifications();

        notificationObj
            .getUserNotificationsList(findPattern, sortPattern, page_no, limit)
            .then((notifications_data) => {
                notifications_data = JSON.parse(JSON.stringify(notifications_data));
                // console.log("notifications_data =>", notifications_data);
                notifications_data.data = notifications_data.data.map((ele) => {
                    if (ele.createdAt) {
                        ele.time = calculateNotificationTime(ele.createdAt);
                    }
                    return ele;
                });
                if (notifications_data && notifications_data.total_count > 0) {
                    // success
                    CResponse.returnResponse(
                        req,
                        res,
                        200,
                        "Success",
                        true,
                        notifications_data
                    );
                } else {
                    // error
                    CResponse.returnResponse(
                        req,
                        res,
                        400,
                        "No notification found",
                        false,
                        {}
                    );
                }
            })
            .catch((err) => {
                // console.log("err", err);
                // error
                CResponse.returnResponse(
                    req,
                    res,
                    400,
                    err.message,
                    false,
                    {}
                );
            });
    } catch (err) {
        // create error logs on server crash
        CResponse.returnResponse(
            req,
            res,
            400,
            err.message,
            false,
            {}
        );
    }
};

