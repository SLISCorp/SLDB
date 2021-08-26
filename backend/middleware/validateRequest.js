"use strict";

// const ErrorLogs = require('../models/ErrorLogs');
var exportFuns = {};

//++++++++++++++++++++++++++++++++++++++++++ APPLICATION MIDDLEWARES +++++++++++++++++++++++++++++++++++++++++++

exportFuns.returnResponse = (req, res, status_code, message, status, data={}) => {

    if(status_code == 500) {
        
        data = { body: req.body, headers: req.headers, params: req.params, files: req.files,err:data  };

        // save error logs
        var createPattern = {
            status: status,
            statusCode:status_code,
            message: message,
            request_data: data.message,
        };

        // var errorLogsObj = new ErrorLogs;
        // errorLogsObj.saveRecord(createPattern);
    }

    res.json({
        "status": status,
        "statusCode":status_code,
        "message": message,
        "data": data
    });
    return;
}

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

module.exports = exportFuns;
