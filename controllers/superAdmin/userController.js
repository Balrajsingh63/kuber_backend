/** @format */

const { default: mongoose } = require("mongoose");
const User = require("../../models/userModel");
const { createReference } = require("../../uility/helpers");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gameModel = require("../../models/gameModel");
const gameRequestModel = require("../../models/gameRequestModel");
const moneyRequestModel = require("../../models/moneyRequestModel");
const saltRounds = 10;

class UserController {
  /**
   * List Of Admin List
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async index(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;

      // Convert page and limit to integers
      const pageNumber = parseInt(page);
      const pageSize = parseInt(limit);
      const skip = (pageNumber - 1) * pageSize;

      // Fetch users with "Admin" role, applying pagination
      const list = await User.aggregate([
        {
          $match: {
            role: "Admin",
          },
        },
        {
          $skip: skip, // Skip records for previous pages
        },
        {
          $limit: pageSize, // Limit the number of records to the page size
        },
      ]);

      // Get total count of "Admin" users for pagination
      const totalCount = await User.countDocuments({
        role: "Admin",
      });

      // Return the paginated response
      return res.json({
        data: list,
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(totalCount / pageSize),
          totalItems: totalCount,
        },
        status: true,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Internal Server Error", status: false });
    }
  }

  /**
   * Admin Show Information By Id
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async show(req, res) {
    try {
      const { id } = req.params;

      // Get pagination parameters from the query (defaults: page = 1, limit = 10)
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Aggregation pipeline with pagination
      const list = await User.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "reference",
            as: "customers",
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            reffrenceId: 1,
            mobile: 1,
            wallet: 1,
            role: 1,
            status: 1,
            isBlock: 1,
            createdAt: 1,
            updatedAt: 1,
            customers: {
              $slice: ["$customers", skip, limit], // Apply pagination to the "customers" field
            },
            userGame: 1,
          },
        },
      ]);
      // Get the total count of customers
      const totalCount = await User.countDocuments({
        reference: id,
      });

      return res.json({
        data: list[0],
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
        },
        status: true,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Internal Server Error", status: false });
    }
  }

  /**
   * Admin Register Apis
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async adminRegister(req, res) {
    try {
      const { email, password, mobile, name } = req.body;
      let userCheck = await User.findOne({ email: email });
      if (userCheck) {
        return res.json({
          status: false,
          message: "Admin already exist on this email",
        });
      }
      let reffrenceId = createReference();
      await User.create({
        email: email,
        name: name,
        password: await bcrypt.hashSync(password, saltRounds),
        role: "Admin",
        mobile: mobile,
        reffrenceId: reffrenceId,
      });
      res.status(201).json({
        status: true,
        message: "User register successfully.",
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({
        message: "Somthing want worng ! try again later",
      });
    }
  }
  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async adminUpdate(req, res) {
    try {
      const { id } = req.params;
      const { email, mobile, name } = req.body;
      await User.findOneAndUpdate(
        { _id: id },
        {
          email: email,
          name: name,
          mobile: mobile,
        }
      );
      res.status(201).json({
        status: true,
        message: "User updated successfully.",
      });
    } catch (error) {
      console.log(error.message);
      return res.status(500).json({
        message: "Somthing want worng ! try again later",
      });
    }
  }
  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async adminBlock(req, res) {
    try {
      const { id } = req.params;
      const getAdmin = await User.findOne({ _id: id });
      getAdmin.isBlock = !getAdmin.isBlock;
      await getAdmin.save();
      res.status(201).json({
        status: true,
        message: getAdmin.isBlock
          ? "User blocked successfully."
          : "User unblocked successfully.",
      });
    } catch (error) {
      return res.status(500).json({
        message: "Somthing want worng ! try again later",
      });
    }
  }
  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async adminDelete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await User.findByIdAndDelete(id);
      res.status(201).json({
        status: true,
        message: "User deleted successfully.",
      });
    } catch (error) {
      console.error(error.message());
      return res.status(500).json({
        message: "Somthing want worng ! try again later",
      });
    }
  }
  /**
   *
   * @param {*} req
   * @param {*} res
   * @returns
   */
  async adminGameList(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query; // Default values: page = 1, limit = 10
      const { adminId } = req.params;
      // Convert page and limit to integers
      const pageNumber = parseInt(page);
      const pageSize = parseInt(limit);
      const skip = (pageNumber - 1) * pageSize;
      // Aggregation pipeline for fetching paginated data
      const gameList = await gameModel.aggregate([
        {
          $match: {
            $or: [
              {
                userId: new mongoose.Types.ObjectId(adminId),
              },
              {
                userId: { $exists: false },
                status: "active",
              },
            ],
          },
        },
        {
          $skip: skip, // Skip records for previous pages
        },
        {
          $limit: pageSize, // Limit the number of records to the page size
        },
      ]);

      // Total count of games for the admin
      const totalCount = await gameModel.countDocuments({
        $or: [
          { userId: new mongoose.Types.ObjectId(adminId) },
          {
            userId: { $exists: false },
          },
        ],
      });

      // Send paginated response
      return res.json({
        data: gameList,
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(totalCount / pageSize),
          totalItems: totalCount,
        },
        status: true,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Internal Server Error", status: false });
    }
  }

  async adminGameRequest(req, res) {
    try {
      const { adminId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      // Convert page and limit to integers
      const pageNumber = parseInt(page);
      const pageSize = parseInt(limit);
      const skip = (pageNumber - 1) * pageSize;

      // Step 1: Fetch relevant games for the admin
      const getGames = await gameModel.aggregate([
        {
          $match: {
            $or: [
              { userId: new mongoose.Types.ObjectId(adminId) },
              {
                userId: { $exists: false },
              },
            ],
          },
        },
      ]);

      // Extract game IDs for filtering game requests
      const gameIds = getGames.map((game) => game._id);
      // Step 2: Fetch game requests with pagination
      const gameRequests = await gameRequestModel.aggregate([
        {
          $match: {
            type: { $in: gameIds },
            date: { $gte: new Date(new Date().setUTCHours(0, 0, 0, 0)) },
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
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "customers",
          },
        },
        {
          $unwind: {
            path: "$customers",
          },
        },
        {
          $unwind: {
            path: "$games",
          },
        },
        {
          $match: {
            "customers.reference": new mongoose.Types.ObjectId(adminId),
          },
        },
        {
          $skip: skip, // Skip records for previous pages
        },
        {
          $limit: pageSize, // Limit the number of records to the page size
        },
      ]);

      // Step 3: Get total count of matching game requests
      const totalCount = await gameRequestModel.countDocuments({
        type: { $in: gameIds },
        reference: new mongoose.Types.ObjectId(adminId),
      });

      // Send paginated response
      return res.json({
        data: gameRequests,
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(totalCount / pageSize),
          totalItems: totalCount,
        },
        status: true,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Internal Server Error", status: false });
    }
  }

  async adminWithdrawalRequest(req, res) {
    try {
      const { adminId } = req.params;
      const { page = 1, limit = 10 } = req.query; // Default page = 1, limit = 10
      const pageNumber = parseInt(page, 10);
      const pageSize = parseInt(limit, 10);

      // Get customers associated with the admin
      const customerList = await User.aggregate([
        {
          $match: {
            reference: new mongoose.Types.ObjectId(adminId),
          },
        },
      ]);

      // Extract customer IDs
      let getCustomersIds = customerList.map((user) => user._id);

      // Count total matching records for pagination
      const totalCount = await moneyRequestModel.countDocuments({
        userId: { $in: getCustomersIds },
      });

      // Fetch withdrawal requests with pagination
      const withdrawalRequestList = await moneyRequestModel.aggregate([
        {
          $match: {
            userId: { $in: getCustomersIds },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "customers",
          },
        },
        {
          $unwind: {
            path: "$customers",
          },
        },
        {
          $sort: {
            _id: -1, // Sort by descending ID (newest first)
          },
        },
        {
          $skip: (pageNumber - 1) * pageSize, // Skip documents for previous pages
        },
        {
          $limit: pageSize, // Limit the number of documents per page
        },
      ]);

      // Return the response with pagination metadata
      return res.json({
        data: withdrawalRequestList,
        pagination: {
          currentPage: pageNumber,
          totalPages: Math.ceil(totalCount / pageSize),
          totalItems: totalCount,
        },
        status: true,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal Server Error",
        status: false,
      });
    }
  }
}

module.exports = new UserController();
