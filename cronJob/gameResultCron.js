var cron = require('node-cron');
const moment = require('moment');
const gameModel = require('../models/gameModel');
const gameRequestModel = require('../models/gameRequestModel');
const resultModel = require("../models/resultModel");
class GameResultCron {
    async result() {
        cron.schedule('*/5 * * * *', async () => {
            console.log("aaya");
            let todayRequest = await gameRequestModel.aggregate([{
                $match: { date: moment().format() }
            }, {
                $group: {
                    "_id": "$gameNumber.number",
                    count: { $sum: 1 }
                }
            }])

            console.log(todayRequest);
            // let gameResult = await resultModel.create({

            // });
        });
    }

}

module.exports = new GameResultCron();