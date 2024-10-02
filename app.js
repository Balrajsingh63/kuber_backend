/** @format */

var createError = require("http-errors");
var express = require("express");
const http = require("http");
const fs = require("fs");
var https = require("https");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var indexRouter = require("./routes/index");
var mobIndexRoute = require("./routes/mobileRoute/indexRoute");
var adminRoute = require("./routes/index");
var { result } = require("./cronJob/gameResultCron");
const Result = require("./models/resultModel");
const { config } = require("process");
const db = require("./config/db");
const { Server } = require("socket.io");
const gameModel = require("./models/gameModel");
const moment = require("moment");
const GameRequestModel = require("./models/gameRequestModel");
const userModel = require("./models/userModel");
const superAdminRoutes = require("./routes/superAdmin/indexRoutes");
const cronJob = require("./cronJob/gameResultCron");
var app = express();
// cronJob.settlement()
// var https_options = {
//   key: fs.readFileSync("/etc/nginx/ssl/private.key"),
//   cert: fs.readFileSync("/etc/nginx/ssl/certificate.crt"),
//   ca: fs.readFileSync('/etc/nginx/ssl/ca_bundle.crt')
// };

const httpServer = http.createServer(app);
// const httpServer = https.createServer(https_options, app);
const io = new Server(httpServer, {
	cors: "*",
});

require("dotenv").config();
result();
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
// app.use('/v1', indexRouter);
app.use("/v1/admin", adminRoute);
app.use("/v1/app", mobIndexRoute);
app.use("/v1/super", superAdminRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

io.on("connect", (socket) => {
	console.log("connected socket ******", `${socket.id}`);

	socket.on("disconnect", (reason) => {
		socket.disconnect();
		console.log("disconnect socket", reason);
	});

	socket.on("create", function (room) {
		socket.join(room);
	});

	socket.on(
		"result",
		async ({ startTime, endTime, date, number, resultTime, gameId }) => {
			console.log("date", date);
			let currentDateTime = new Date(date); // Get the current date and time
			let game = await gameModel.findOne({
				_id: gameId,
			});
			// Find a document where createdAt matches the current date and time, and _id matches gameId
			let checkResult = await Result.findOne({
				createdAt: {
					$gte: new Date(
						currentDateTime.getFullYear(),
						currentDateTime.getMonth(),
						currentDateTime.getDate(),
						0,
						0,
						0,
					),
					$lt: new Date(
						currentDateTime.getFullYear(),
						currentDateTime.getMonth(),
						currentDateTime.getDate() + 1,
						0,
						0,
						0,
					),
				},
				gameId: gameId,
			});
			if (checkResult) {
				await checkResult.updateOne({
					number,
					date: date,
					resultTime,
				});
			} else {
				const result = await Result.create({
					startTime: game.startTime,
					endTime: game.endTime,
					date: currentDateTime,
					number,
					resultTime: game.resultTime,
					gameId,
				});
			}
			// const gameTime = await gameModel.findOne({ _id: gameId });
			// setTimeout(async () => {
			//   let startTimeData = moment(gameTime.startTime, 'hh:mm A');
			//   let endTimeData = moment(gameTime.endTime, 'hh:mm A');

			//   if (endTimeData.isBefore(startTimeData)) {
			//     endTimeData.add(1, 'day'); // Add 1 day to end time if it's before start time
			//   }
			//   console.log(startTimeData, endTimeData, gameTime);
			//   // let duration = moment.duration(endTimeData.diff(startTimeData));
			//   // let hours = duration.asHours();
			//   let gameRequests = await GameRequestModel.find({
			//     $and: [{
			//       date: { $gte: startTimeData, $lte: endTimeData },
			//       type: gameId,
			//       "gameNumber.number": number
			//     }]
			//   },
			//   );
			//   if (gameRequests.length > 0) {
			//     for (const iterator of gameRequests) {
			//       let useData = await userModel.findOne({ _id: iterator.userId })
			//       await useData.updateOne({
			//         wallet: Number(useData.wallet) + Number(iterator.gameNumber[0].price * 90)
			//       })
			//     }
			//   }
			// }, 300000)

			io.emit("result_reload", { status: true });
		},
	);
});

httpServer.listen(3006, () => {
	console.log("server connected successfully");
});
