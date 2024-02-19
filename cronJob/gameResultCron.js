var cron = require('node-cron');
const moment = require('moment');
const gameModel = require('../models/gameModel');
const gameRequestModel = require('../models/gameRequestModel');
const resultModel = require("../models/resultModel");
const { default: mongoose } = require('mongoose');

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

}

module.exports = new GameResultCron();