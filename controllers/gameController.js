const GameModel = require('../models/gameModel');
const GameRequestModel = require('../models/gameRequestModel');
class GameController {
    async index(req, res) {
        let list = await GameModel.find({});
        return res.json({
            status: true,
            message: "Game list.",
            data: list
        })
    }

    async gameRequestList(req, res) {
        let list = await GameRequestModel.find({}).populate("userId");
        return res.json({
            status: true,
            message: "Game list.",
            data: list
        })
    }

    async gameCreate(req, res) {
        const { name, status } = req.body;
        const storeData = await GameModel.create({ name, status });
        return res.json({
            status: true,
            message: "Game created successfully."
        })
    }
}
module.exports = new GameController();