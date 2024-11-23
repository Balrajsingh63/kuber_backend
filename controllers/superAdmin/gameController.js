/** @format */

const { default: mongoose } = require("mongoose");
const gameModel = require("../../models/gameModel");

class GameController {
  /**
   * Game List Method
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async index(req, res) {
    const currentDate = new Date(); // Current date
    const currentDateString = currentDate.toISOString().split("T")[0]; // Get the current date string

    // Get the page and pageSize from the query params (defaults to 1 and 10 respectively)
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    // Calculate the skip value based on the current page and page size
    const skip = (page - 1) * pageSize;

    try {
      const list = await gameModel.aggregate([
        {
          $match: {
            createdAt: { $lte: currentDate },
          },
        },
        {
          $lookup: {
            from: "results",
            let: { gameId: "$_id" },
            pipeline: [
              {
                $match: {
                  $and: [
                    { $expr: { $eq: ["$gameId", "$$gameId"] } }, // Use $expr to compare gameId
                  ],
                },
              },
              {
                $project: {
                  gameId: 1,
                  resultTime: 1,
                  number: 1,
                  createdAtString: {
                    $dateToString: {
                      format: "%Y-%m-%d",
                      date: "$createdAt",
                    },
                  }, // Project createdAt as a string
                },
              },
              {
                $match: {
                  createdAtString: currentDateString, // Compare createdAt date string with the current date string
                },
              },
              {
                $limit: 1,
              },
            ],
            as: "result",
          },
        },
        {
          $unwind: {
            path: "$result",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $skip: skip, // Skip documents based on the page number and page size
        },
        {
          $limit: pageSize, // Limit the number of documents based on page size
        },
      ]);

      // Get the total count of documents matching the query (without pagination)
      const totalCount = await gameModel.countDocuments({
        createdAt: { $lte: currentDate },
      });

      const totalPages = Math.ceil(totalCount / pageSize); // Calculate total pages based on the count and pageSize

      return res.json({
        status: true,
        message: "Game list.",
        data: list,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalCount: totalCount,
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: "An error occurred.",
        error: err.message,
      });
    }
  }

  /**
   * Create Game Mehod apis
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async gameCreate(req, res) {
    try {
      const { name, startTime, resultTime, endTime, status } = req.body;

      // Validate input fields
      if (!name || !startTime || !resultTime || !endTime) {
        return res.status(400).json({
          status: false,
          message:
            "All fields (name, startTime, resultTime, endTime) are required.",
        });
      }

      // Create a new game entry in the database
      const newGame = await gameModel.create({
        name,
        startTime,
        resultTime,
        endTime,
        status: status || "inactive", // Default to 'inactive' if status is not provided
      });

      return res.status(201).json({
        status: true,
        message: "Game created successfully.",
        data: newGame, // Return the created game data if needed
      });
    } catch (error) {
      console.error("Error creating game:", error);
      return res.status(500).json({
        status: false,
        message: "Failed to create game. Please try again later.",
      });
    }
  }

  /**
   * Delete Game Apis
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async deleteGame(req, res) {
    try {
      const { id } = req.params;

      // Validate the provided ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: false,
          message: "Invalid game ID.",
        });
      }

      // Attempt to find and delete the game
      const game = await gameModel.findByIdAndDelete(id);

      // Check if the game exists
      if (!game) {
        return res.status(404).json({
          status: false,
          message: "Game not found. Deletion failed.",
        });
      }

      return res.status(200).json({
        status: true,
        message: "Game deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting game:", error);
      return res.status(500).json({
        status: false,
        message:
          "An error occurred while deleting the game. Please try again later.",
      });
    }
  }

  /**
   * Show Game Apis
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async showGame(req, res) {
    try {
      const { id } = req.params;

      // Validate the id format (optional)
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          status: false,
          message: "Invalid game ID format.",
        });
      }

      const game = await gameModel.findOne({
        _id: new mongoose.Types.ObjectId(id), // Use mongoose.Types.ObjectId to convert id
      });

      // If no game is found
      if (!game) {
        return res.status(404).json({
          status: false,
          message: "Game not found.",
        });
      }

      return res.json({
        status: true,
        message: "Game fetched successfully.",
        data: game,
      });
    } catch (error) {
      console.error("Error fetching game:", error);
      return res.status(500).json({
        status: false,
        message: "An error occurred while fetching the game.",
      });
    }
  }

  /**
   * Update Game APis
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async updateGame(req, res) {
    try {
      const { id } = req.params;
      const { name, startTime, resultTime, endTime, status } = req.body;

      // Validate the provided ID
      // if (!new mongoose.Types.ObjectId.isValid(id)) {
      //   return res.status(400).json({
      //     status: false,
      //     message: "Invalid game ID.",
      //   });
      // }

      // Find and update the game
      const game = await gameModel.findByIdAndUpdate(
        new mongoose.Types.ObjectId(id),
        { name, startTime, resultTime, endTime, status },
        { new: true } // Return the updated document
      );

      // Check if the game exists
      if (!game) {
        return res.status(404).json({
          status: false,
          message: "Game not found. Update failed.",
        });
      }

      return res.status(200).json({
        status: true,
        message: "Game updated successfully.",
        data: game,
      });
    } catch (error) {
      console.error("Error updating game:", error);
      return res.status(500).json({
        status: false,
        message:
          "An error occurred while updating the game. Please try again later.",
      });
    }
  }

  /**
   * Game Request List APis
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async gameRequestList(req, res) {
    const { userId } = req.query;
    const gamesId = await GameModel.find({ userId });
    let gameArr = gamesId.flatMap((v) => v._id);
    let list = await GameRequestModel.aggregate([
      {
        $addFields: {
          today: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$date",
            },
          },
        },
      },
      {
        $match: {
          today: { $eq: moment().format("Y-MM-DD").toString() },
          type: { $in: gameArr },
        },
      },
      {
        $lookup: {
          from: "games",
          localField: "type",
          foreignField: "_id",
          as: "games",
        },
      },
      {
        $unwind: "$gameNumber",
      },
      {
        $group: {
          _id: "$gameNumber.number",
          count: { $sum: 1 },
          totalPrice: { $sum: "$gameNumber.price" },
          data: { $addToSet: "$$ROOT" },
        },
      },
    ]);
    return res.json({
      status: true,
      message: "Game Request list.",
      data: list,
    });
  }

  async gameStatus(req, res) {
    try {
      const { gameId } = req.params;
      // Find the game by its ID
      const getGame = await gameModel.findOne({
        _id: new mongoose.Types.ObjectId(gameId),
      });

      if (!getGame) {
        return res.status(404).json({
          status: false,
          message: "Game not found.",
        });
      }
      // Toggle the game status between 'active' and 'inactive'
      getGame.status = getGame.status === "active" ? "inactive" : "active";
      // Save the updated game status
      await getGame.save();

      // Return a success response
      return res.status(200).json({
        status: true,
        message: `Game status changed to ${getGame.status}.`,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        status: false,
        message: "An error occurred while updating the game status.",
        error: error.message,
      });
    }
  }
}

module.exports = new GameController();
