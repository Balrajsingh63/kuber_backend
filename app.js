var createError = require('http-errors');
var express = require('express');
const http = require("http")
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require("cors");
var indexRouter = require('./routes/index');
var mobIndexRoute = require('./routes/mobileRoute/indexRoute');
var adminRoute = require("./routes/index");
var { result } = require("./cronJob/gameResultCron");
const { config } = require('process');
const db = require("./config/db");
const { Server } = require("socket.io");
var app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: "*"
});
require('dotenv').config()
result();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use('/v1', indexRouter);
app.use("/v1/admin", adminRoute)
app.use('/v1/app', mobIndexRoute);

app.get("/test", (req, res) => {
  console.log("aayya");
})
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

io.on("connection", (socket) => {
  console.log("connected socket")
  socket.on("disconnect", (reason) => {
    console.log("disconnect socket")
  });
});

httpServer.listen(3006, () => {
  console.log("server connected successfully")
})
