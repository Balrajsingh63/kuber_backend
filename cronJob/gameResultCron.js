var cron = require('node-cron');
const moment = require('moment');
const gameModel = require('../models/gameModel');
const gameRequestModel = require('../models/gameRequestModel');
const resultModel = require("../models/resultModel");
const { default: mongoose } = require('mongoose');
const userModel = require('../models/userModel');
const { ObjectId } = mongoose.Types;
// const userModel = require("../models/gameModel");
class GameResultCron {
    async result() {

        cron.schedule('*/1 * * * *', async () => {

            try {
                let todayRequest = await gameRequestModel.aggregate([
                    {
                        $addFields: {
                            "today": {
                                $dateToString: {
                                    format: "%Y-%m-%d",
                                    date: "$date"
                                }
                            }
                        }
                    }, {
                        $match: { today: { $eq: moment().format("Y-MM-DD").toString() } }
                    }, {
                        $unwind: "$gameNumber"
                    },
                    {
                        $group: {
                            "_id": "$gameNumber.number",
                            count: { $sum: 1 },
                            totalPrice: { $sum: "$gameNumber.price" },
                            minPrice: { $min: "$gameNumber.price" },
                            minCount: { $min: { $sum: 1 } },
                            data: { $push: "$$ROOT" }
                        }
                    },
                    {
                        $unwind: "$data" // Unwind to get back the original documents
                    },
                    {
                        $sort: { totalPrice: 1 } // Sorting by total price in ascending order
                    }
                ]);


                if (todayRequest.length > 0) {

                    const currentTime = moment();

                    const findGame = await gameModel.findOne({
                        _id: new mongoose.Types.ObjectId(todayRequest[0]?.data?.type)
                    });
                    // const resultTimeToday = moment(`${moment().format("YYYY-MM-DD")} ${gameInfo.resultTime}`, 'YYYY-MM-DD HH:mm');

                    // Add 5 minutes to the result time
                    // const adjustedResultTime = resultTimeToday.add(5, 'minutes');

                    // Check if the current time is after the adjusted result time
                    // const isAfterAdjustedResultTime = currentTime.isBetween(resultTimeToday, adjustedResultTime);

                    // Check if the current time is between the start time and end time
                    // const isWithinTimeRange = currentTime.isBetween(startTimeToday, endTimeToday);

                    // if (isAfterAdjustedResultTime) {
                    //     let gameResult = await resultModel.create({
                    //         gameId: findGame._id,
                    //         number: todayRequest[0].id,
                    //         startTime: findGame.startTime,
                    //         endTime: findGame.endTime,
                    //         date: new Date(),
                    //     });// Log the result for debugging
                    // }
                }

            } catch (error) {
                console.error("Error during aggregation:", error);
            }
            console.log(todayRequest);

        });
    }

    // async settlement() {
    //     cron.schedule('*/10 * * * * *', async () => {
    //         const yesterday = moment().subtract(1, 'days').startOf('day');
    //         let gameId = await gameModel.find({})
    //         // let gameId = await gameModel.find({}, { _id: 1 });

    //         for (const iterator of gameId) {
    //             console.log(yesterday, "---**---***");
    //             let startTimeData = moment(iterator.startTime, 'hh:mm A').subtract(1, 'day');
    //             let endTimeData = moment(iterator.endTime, 'hh:mm A').subtract(1, 'day');
    //             // console.log(startTimeData, endTimeData, "*********");
    //             // if (endTimeData.isBefore(startTimeData)) {
    //             //     endTimeData.add(1, 'day'); // Add 1 day to end time if it's before start time
    //             // }
    //             if (endTimeData.isBefore(startTimeData)) {
    //                 endTimeData = endTimeData.add(24, 'hours'); // Add 24 hours (1 day) to end time if it's before start time
    //             }
    //             console.log(startTimeData, endTimeData, "****===*****");
    //             let gameRequests = await gameRequestModel.find({
    //                 date: { $gte: startTimeData, $lte: endTimeData },
    //                 type: gameId,
    //                 "gameNumber.number": number
    //             });
    //             console.log("gameRequests====", gameRequests.length)
    //             if (gameRequests.length > 0) {
    //                 for (const iterator of gameRequests) {
    //                     let useData = await userModel.findOne({ _id: iterator.userId })
    //                     await useData.updateOne({
    //                         wallet: Number(useData.wallet) + Number(iterator.gameNumber[0].price * 90)
    //                     })
    //                 }
    //             } else {
    //                 console.log("gameRequests.length ===0")
    //             }
    //         }
    //         if (endTimeData.isBefore(startTimeData)) {
    //             endTimeData.add(1, 'day'); // Add 1 day to end time if it's before start time
    //         }
    //         // let duration = moment.duration(endTimeData.diff(startTimeData));
    //         // let hours = duration.asHours();

    //     })

    // }


    async settlement() {
        cron.schedule(' 55 23 * * *', async () => {
            const yesterday = moment().subtract(1, 'days').startOf('day');
            let gameId = await gameModel.find({ _id: { $ne: ObjectId("65f096b6a7e18dd1b60b1bc3") } })
            for (const iterator of gameId) {
                // let startTimeData = moment(iterator.startTime, 'hh:mm A').subtract(1, 'days');
                // let endTimeData = moment(iterator.endTime, 'hh:mm A').subtract(1, 'days')
                let startTimeData = moment(iterator.startTime, 'hh:mm A');
                let endTimeData = moment(iterator.endTime, 'hh:mm A');
                // console.log("startTimeData==", startTimeData, "endTimeData==", endTimeData);
                // if (endTimeData.isBefore(startTimeData)) {
                //     endTimeData.add(1, 'day'); // Add 1 day to end time if it's before start time
                // }
                console.log("startTimeData==", startTimeData, "endTimeData==", endTimeData);
                let resultNumber = await resultModel.find({
                    $and: [{
                        createdAt: { $gte: startTimeData, $lte: endTimeData },
                        gameId: iterator?._id,
                    }]
                }).sort({ createdAt: -1 });
                let gameRequests = await gameRequestModel.find({
                    $and: [{
                        date: { $gte: startTimeData, $lte: endTimeData },
                        type: iterator?._id,
                        "gameNumber.number": resultNumber[0].number
                    }]
                });
                // console.log({ userIds });
                if (gameRequests.length > 0) {
                    for (const _user of gameRequests) {
                        let useData = await userModel.findOne({ _id: _user.userId })
                        let updateUser = await useData.updateOne({
                            wallet: Number(useData.wallet) + Number(_user.gameNumber[0].price * 90)
                        })
                    }
                } else {
                    console.log("gameRequests.length ===0")
                }
            }

        })

    }




}

module.exports = new GameResultCron();