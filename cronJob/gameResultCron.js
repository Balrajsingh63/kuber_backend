var cron = require('node-cron');
const moment = require('moment');
const gameModel = require('../models/gameModel');
const gameRequestModel = require('../models/gameRequestModel');
class GameResultCron {


    async result() {
        cron.schedule('* 8 * * *', async () => {
            let todayRequest = await gameRequestModel.aggregate([{
                $match: { date: moment().format() }
            },{
                $group:{
                    "_id"
                }
            }])
            let gameResult = await gameModel.create({

            });
        });
    }

}

module.exports = new GameResultCron();