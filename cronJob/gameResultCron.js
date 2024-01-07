var cron = require('node-cron');
const moment = require('moment');
const gameModel = require('../models/gameModel');
const gameRequestModel = require('../models/gameRequestModel');
const resultModel = require("../models/resultModel");
class GameResultCron {
    async result() {
        cron.schedule('*/30 * * * *', async () => {
            console.log("aaya", new Date());
            let todayRequest = await gameRequestModel.aggregate([{
                $addFields: {
                    "today": {
                        $dateString: {
                            format: "%Y-%m-%d",
                            date: $date
                        }
                    }
                }
            },
                //  {
                //     $match: {
                //         today: { $eq: moment().format("Y-m-d").toString() },
                //     }
                // }
            ])
            //  {
            //     $group: {
            //         "_id": "$gameNumber.number",
            //         count: { $sum: 1 }
            //     }
            // }
            // ])

            console.log(todayRequest);
            // let gameResult = await resultModel.create({

            // });
        });
    }

}

module.exports = new GameResultCron();