const express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
var logger = require('morgan');
const cors = require("cors");
var app = express();
require('dotenv').config();
require('module-alias/register')
require('./configs/db.js');
app.use(logger('dev'));


// app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
var adminRouter = require('./routes/admin');
var webRouter = require('./routes/web');
app.use('/static', express.static(path.join(__dirname, 'public/images/')));
app.use('/admin', adminRouter);
app.use('/web-service', webRouter);



// app.use(function (req, res, next) {
//     next(createError(404));
// });


// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log("err----->", err);
  res.send(err)
  // res.render('error');
});

module.exports = app;