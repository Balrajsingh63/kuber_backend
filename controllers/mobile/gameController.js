const GameModel = require('../../models/gameModel');
const { ObjectId } = require("mongoose")
const gameRequestModel = require('../../models/gameRequestModel');
class GameController {
    /**
     * Game List
     */
    async gameList(req, res) {
        let list = await GameModel.find({});
        return res.json({
            status: true,
            message: "Your game request successfully created.",
            data: list
        })
    }
    /**
     * Game Request 
     * @param {*} req 
     * @param {*} res 
     * @returns 
     */
    async gamePlay(req, res) {
        let { gameNumber, type } = req.body;
        let game = await gameRequestModel.create({
            date: new Date(),
            userId: (req.user._id),
            number,
            type,
            status: "active"
        });
        return res.json({
            message: "Your game request successfully created.",
            status: true,
            data: game
        })
    }
}
module.exports = new GameController();