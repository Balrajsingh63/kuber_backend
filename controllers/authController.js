/** @format */

const userModel = require("../models/userModel");
const msg = require("../uility/constant");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
class AuthController {
  async login(req, res) {
    let { phone, password } = req.body;
    let user = await userModel
      .findOne({
        mobile: phone,
        role: "Customer",
        isBlock: false,
      })
      .lean();
    if (!user) {
      return res.status(200).json({
        status: false,
        message: msg.Invalid_Record,
        data: [],
      });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(200).json({
        status: false,
        message: msg.Password_Not_Match,
        data: [],
      });
    }
    let token = jwt.sign(user, process.env.privateKey);
    user.token = token;
    return res.status(200).json({
      status: true,
      message: msg.login_success,
      data: user,
    });
  }

  async userRegister(req, res) {
    try {
      const { name, phone, password, email, reference } = req.body;
      let userCheck = await userModel.findOne({ mobile: phone });
      if (userCheck) {
        return res.json({
          status: false,
          message: "User already exist on this number",
        });
      }
      if (!reference) {
        return res.json({
          status: false,
          message: "Refernce Id is required",
        });
      }
      const parentId = await userModel.findOne({ reffrenceId: reference });
      await userModel.create({
        name: name,
        // email: email,
        mobile: phone,
        password: await bcrypt.hashSync(password, saltRounds),
        role: "Customer",
        status: "Deactivate",
        reference: parentId._id,
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

  async forgetPassword(req, res) {
    try {
      const { phone } = req.body;

      // Check if phone is provided
      if (!phone) {
        return res.status(400).json({
          status: false,
          message: "Phone number is required.",
        });
      }

      // Find user with the given phone number
      const user = await userModel.findOne({ phone, isBlock: false });

      if (!user) {
        return res.status(404).json({
          status: false,
          message: "This phone number is not registered with us.",
        });
      }

      // Success response
      res.status(200).json({
        status: true,
        message: "User found successfully.",
        token: user._id, // Assuming this is a temporary token or identifier
      });
    } catch (error) {
      // Log the error for debugging
      console.error("Error in forgetPassword:", error);

      // Send an error response
      res.status(500).json({
        status: false,
        message: "An internal server error occurred. Please try again later.",
      });
    }
  }

  async changePassword(req, res) {
    try {
      const { token, password, confirmPassword } = req.body;
      // Validate input
      if (!token || !password || !confirmPassword) {
        return res.status(400).json({
          status: false,
          message: "Token, password, and confirm password are required.",
        });
      }

      // Check if passwords match
      if (password !== confirmPassword) {
        return res.status(400).json({
          status: false,
          message: "Passwords do not match.",
        });
      }

      // Validate password length (optional, adjust as needed)
      if (password.length < 6) {
        return res.status(400).json({
          status: false,
          message: "Password must be at least 6 characters long.",
        });
      }

      // Find user by token
      const user = await userModel.findById(token);
      if (!user) {
        return res.status(404).json({
          status: false,
          message: "Invalid token or user not found.",
        });
      }
      // Update user's password (assumes bcrypt for hashing)
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      user.password = hashedPassword;
      await user.save();
      // Success response
      res.status(200).json({
        status: true,
        message: "Password changed successfully.",
      });
    } catch (error) {
      // Log the error for debugging
      console.error("Error in changePassword:", error);
      // Internal server error response
      res.status(500).json({
        status: false,
        message: "An internal server error occurred. Please try again later.",
      });
    }
  }
}

module.exports = new AuthController();
