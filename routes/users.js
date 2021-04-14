const { USER_CONSTANTS, AUTH_CONSTANTS } = require("../config/constant.js");
const util = require("util");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const config = require("config");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const response = require("../services/response");
const _ = require("lodash");
const express = require("express");
const router = express.Router();
const {
  User,
  UserAudit,
  validateUserPost,
  validateUserPut,
  validateEmail,
  validateUserLogin,
  validateChangePassword,
  validateResetPassword,
  validateRefreshToken,
} = require("../models/user");
const { formatter } = require("../services/commonFunctions");
const { userAuth } = require("../middleware/auth");
const { Token } = require("../models/emailVerificationtoken");

mongoose.set("debug", true);

// Get user list
router.get("/", adminAuth, async (req, res) => {
  let criteria = {};
  var skipVal, limitVal;
  if (isNaN(parseInt(req.query.offset))) skipVal = 0;
  else skipVal = parseInt(req.query.offset);

  if (isNaN(parseInt(req.query.limit))) limitVal = 500;
  else limitVal = parseInt(req.query.limit);

  if (req.query.firstName) {
    var regexName = new RegExp(req.query.firstName, "i");
    criteria.firstName = regexName;
  }
  if (req.query.lastName) {
    var regexName = new RegExp(req.query.lastName, "i");
    criteria.lastName = regexName;
  }
  if (req.query.email) criteria.email = req.query.email;
  if (req.query.phone) criteria.phone = req.query.phone;
  if (req.query.status) criteria.status = req.query.status;
  if (req.query.startDate) {
    criteria.insertDate = { $gte: parseInt(req.query.startDate) };
  }
  if (req.query.endDate) {
    criteria.insertDate = { $lte: parseInt(req.query.endDate) };
  }
  if (
    req.query.startDate != null &&
    req.query.endDate != null &&
    req.query.startDate != "" &&
    req.query.endDate != ""
  ) {
    criteria.insertDate = {
      $gte: parseInt(req.query.startDate),
      $lte: parseInt(req.query.endDate),
    };
  }

  let userList = await User.aggregate([
    { $match: criteria },
    { $sort: { insertDate: -1 } },
    { $skip: skipVal },
    { $limit: limitVal },
    {
      $project: {
        _id: 0,
        userId: "$_id",
        roles: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        phone: 1,
        department: 1,
        isVerified: 1,
        status: 1,
        profilePic: 1,
        createdBy: 1,
        modifiedBy: 1,
        lastLogin: 1,
        modifiedDate: 1,
        insertDate: 1,
        creationDate: 1,
      },
    },
  ]);

  res.send({ statusCode: 200, message: "Success", data: { userList } });
});

router.get("/auditLog/:userId", userAuth, async (req, res) => {
  let criteria = {};
  var skipVal, limitVal;
  if (isNaN(parseInt(req.query.offset))) skipVal = 0;
  else skipVal = parseInt(req.query.offset);

  if (isNaN(parseInt(req.query.limit))) limitVal = 100;
  else limitVal = parseInt(req.query.limit);

  criteria.userId = req.params.userId;

  let auditLog = await UserAudit.aggregate([
    { $match: criteria },
    { $sort: { modifiedDate: -1 } },
    { $skip: skipVal },
    { $limit: limitVal },
    {
      $lookup: {
        from: "states",
        localField: "stateId",
        foreignField: "stateId",
        as: "stateData",
      },
    },
    {
      $project: {
        _id: 0,
        userId: 1,
        role: 1,
        fullName: 1,
        email: 1,
        phone: 1,
        address: 1,
        status: 1,
        stateName: { $arrayElemAt: ["$stateData.name", 0] },
        stateCode: { $arrayElemAt: ["$stateData.code", 0] },
        stateId: 1,
        address: 1,
        createdBy: 1,
        modifiedBy: 1,
        modifiedDate: 1,
      },
    },
  ]);

  res.send({ statusCode: 200, message: "Success", data: { auditLog } });
});

// Create a new User
router.post("/", async (req, res) => {
  const { error } = validateUserPost(req.body);
  if (error) return response.validationErrors(res, error.details[0].message);

  let user = await User.findOne({
    $or: [{ email: req.body.email.toLowerCase() }, { phone: req.body.phone }],
  });

  if (user) {
    if (req.body.email === user.email)
      return response.error(res, USER_CONSTANTS.EMAIL_ALREADY_EXISTS, 400);

    if (req.body.phone === user.phone)
      return response.error(res, USER_CONSTANTS.PHONE_ALREADY_EXISTS, 400);
  }

  const email = req.body.email.toLowerCase();
  const { firstName, lastName, phone, password, department } = req.body;

  console.log({ firstName, lastName, phone, password, email, department });

  try {
    //instantiate User model
    user = new User({
      firstName,
      lastName,
      email,
      phone,
      password,
      department,
      status: "active",
    });

    //create salt for user password hash
    const salt = await bcrypt.genSalt(10);

    //hash password and replace user password with the hashed password
    user.password = await bcrypt.hash(password, salt);

    // save user to db
    await user.save();

    // Create a verification token for this user
    var token = new Token({
      _userId: user._id,
      token: crypto.randomBytes(16).toString("hex"),
    });

    // Save the verification token
    token.save(function (err) {
      if (err) return response.error(res, err.message, 500);
    });

    return response.success(res, USER_CONSTANTS.VERIFICATION_EMAIL_SENT);
  } catch (err) {
    console.error(err.message);
    return response.error(res, err.message, 500);
  }
});

// Update existing user
router.put("/", userAuth, async (req, res) => {
  const { error } = validateUserPut(req.body);
  if (error)
    return res
      .status(400)
      .send({
        statusCode: 400,
        message: "Failure",
        data: error.details[0].message,
      });

  let user;
  if (req.jwtData.role === "user") {
    user = await User.findById(req.body.userId);
    if (!user)
      return res
        .status(400)
        .send({
          statusCode: 400,
          message: "Failure",
          data: USER_CONSTANTS.INVALID_USER,
        });
  } else {
    user = await User.findById(req.jwtData.userId);
    if (!user)
      return res
        .status(400)
        .send({
          statusCode: 400,
          message: "Failure",
          data: USER_CONSTANTS.INVALID_USER,
        });
  }

  await logCurrentUserState(user);

  user.fullName = req.body.fullName || user.fullName;
  user.address = req.body.address || user.address;
  user.role = req.body.role || user.role;
  user.stateId = req.body.stateId || user.stateId;
  if (req.body.email && req.body.email != user.email) {
    tempUser = await User.findOne({ email: req.body.email });
    if (tempUser)
      return res
        .status(400)
        .send({
          statusCode: 400,
          message: "Failure",
          data: USER_CONSTANTS.EMAIL_ALREADY_EXISTS,
        });
    user.email = req.body.email;
  }
  if (req.body.phone && req.body.phone != user.phone) {
    tempUser = await User.findOne({ phone: req.body.phone });
    if (tempUser)
      return res
        .status(400)
        .send({
          statusCode: 400,
          message: "Failure",
          data: USER_CONSTANTS.PHONE_ALREADY_EXISTS,
        });
    user.phone = req.body.phone;
  }

  if (req.jwtData.role == "user") {
    user.status = req.body.status || user.status;
  }

  user.modifiedBy = req.jwtData.email;
  user.modifiedDate = Math.round(new Date() / 1000);
  await user.save();
  user.userId = user._id;

  let response = _.pick(user, [
    "userId",
    "firstName",
    "lastName",
    "phone",
    "email",
    "address",
    "status",
  ]);

  res.send({ statusCode: 200, message: "Success", data: response });
});

// verify email
router.get("/verify/:token", async (req, res) => {
  const { token } = req.params;
  if (!token)
    return response.redirect(res, USER_CONSTANTS.VERIFICATION_FAILURE);
  // if(!token) return response.error(res, USER_CONSTANTS.VERIFICATION_FAILURE);
  console.log("token isssss:::::" + token);

  // Find a matching token
  Token.findOne({ token }, function (err, token) {
    if (!token)
      return response.redirect(res, USER_CONSTANTS.VERIFICATION_FAILURE);
    // if (!token) return response.error(res, USER_CONSTANTS.VERIFICATION_FAILURE);

    // If we found a token, find a matching user
    User.findOne({ _id: token._userId }, function (err, user) {
      if (!user) return response.redirect(res, USER_CONSTANTS.INVALID_USER);
      // if (!user) return response.error(res, USER_CONSTANTS.INVALID_USER);
      if (user.isVerified)
        return response.redirect(res, USER_CONSTANTS.USER_ALREADY_VERIFIED);
      // if (user.isVerified) return response.error(res, USER_CONSTANTS.USER_ALREADY_VERIFIED);

      // Verify and save the user
      user.isVerified = true;
      user.status = "active";
      user.save(function (err) {
        if (err) return response.error(res, err.message);
        return response.redirect(res);
      });
    });
  });
});

// resend verify email
router.post("/resend", async (req, res) => {
  // Check for validation errors
  const { error } = validateEmail(req.body);
  if (error) return response.validationErrors(res, error.details[0].message);

  const { email } = req.body;
  console.log("email isssss:::::" + email);

  const user = await User.findOne({ email });
  if (!user) return response.error(res, USER_CONSTANTS.INVALID_USER);
  if (user.isVerified)
    return response.error(res, USER_CONSTANTS.USER_ALREADY_VERIFIED);

  // Create a verification token for this user
  var token = new Token({
    _userId: user._id,
    token: crypto.randomBytes(16).toString("hex"),
  });

  // Save the verification token
  token.save(function (err) {
    if (err) return response.error(res, err.message, 500);
  });

  return response.success(res, USER_CONSTANTS.VERIFICATION_EMAIL_SENT);
});

// User login api
router.post("/login", async (req, res) => {
  const { error } = validateUserLogin(req.body);
  if (error) return response.validationErrors(res, error.details[0].message);

  let criteria = {};
  if (req.body.email && req.body.email != "")
    criteria.email = req.body.email.toLowerCase();

  let user = await User.findOne(criteria);

  if (!user) return response.error(res, AUTH_CONSTANTS.INVALID_CREDENTIALS);

  if (!user.isVerified)
    return response.error(res, USER_CONSTANTS.NOT_YET_VERIFIED);

  if (user.status != "active")
    return response.error(res, AUTH_CONSTANTS.INACTIVE_ACCOUNT);

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword)
    return response.error(res, AUTH_CONSTANTS.INVALID_CREDENTIALS);

  // create access token
  const payload = { userId: user._id, email: user.email };
  const secret = config.get("jwtPrivateKey");
  const options = {
    expiresIn: "1d",
    issuer: "datingapp.com",
    audience: user._id.toString(),
  };

  const token = await jwt.sign(payload, secret, options);

  // create refresh token
  const refreshTokenPayload = {
    userId: user._id,
    email: user.email,
  };
  const refreshTokenSecret = config.get("jwtRefreshTokenPrivateKey");
  const refreshTokenOptions = {
    expiresIn: "1y",
    issuer: "datingapp.com",
    audience: user._id.toString(),
  };

  const refreshToken = await jwt.sign(
    refreshTokenPayload,
    refreshTokenSecret,
    refreshTokenOptions,
  );

  user.accessToken = token;
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();
  user.userId = user._id;

  let details = _.pick(user, [
    "userId",
    "firstName",
    "lastName",
    "phone",
    "email",
    "status",
    "profilePic",
    "lastLogin",
  ]);
  return response.withData(res, {
    token: token,
    refreshToken: refreshToken,
    details: details,
  });
});

// user password change
router.post("/password/change", userAuth, async (req, res) => {
  const { error } = validateChangePassword(req.body);
  if (error) return response.error(res, error.details[0].message);

  let user = await User.findById(req.jwtData.userId);
  if (!user) return response.error(res, AUTH_CONSTANTS.INVALID_USER);

  const { oldPassword, newPassword } = req.body;

  const validPassword = await bcrypt.compare(oldPassword, user.password);
  if (!validPassword)
    return response.error(res, AUTH_CONSTANTS.INVALID_PASSWORD);

  //create salt for user password hash
  const salt = await bcrypt.genSalt(10);

  //hash password and replace user password with the hashed password
  let encryptPassword = await bcrypt.hash(newPassword, salt);

  user.password = encryptPassword;
  await user.save();
  return response.success(res, AUTH_CONSTANTS.PASSWORD_CHANGE_SUCCESS);
});

router.post("/password/forgot", async (req, res) => {
  // Check for validation errors
  const { error } = validateEmail(req.body);
  if (error) return response.validationErrors(res, error.details[0].message);

  const { email } = req.body;
  console.log("email isssss:::::" + email);

  const user = await User.findOne({ email });
  if (!user) return response.error(res, USER_CONSTANTS.INVALID_USER);

  const resetToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
  user.save(function (err) {
    if (err) return response.error(res, err.message, 500);
  });

  return response.success(res, USER_CONSTANTS.RESET_PASSWORD_EMAIL_SENT);
});

router.get("/password/forgot/:token", async (req, res) => {
  const { token } = req.params;

  // Find a matching token
  user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) return response.error(res, USER_CONSTANTS.INVALID_USER);

  // res.redirect('http://frontend_form_url');
  return response.success(
    res,
    "Waiting for frontend to provide a password form url to redirect to",
  );
});

router.post("/password/reset/:token", async (req, res) => {
  const { error } = validateResetPassword(req.body);
  if (error) return response.error(res, error.details[0].message);

  const { newPassword, confirmNewPassword } = req.body;

  if (newPassword !== confirmNewPassword)
    return response.error(res, USER_CONSTANTS.PASSWORD_MISMATCH);

  try {
    user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return response.success(res, USER_CONSTANTS.INVALID_USER);

    //create salt for user password hash
    const salt = await bcrypt.genSalt(10);

    //hash password and replace user password with the hashed password
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // save user to db
    await user.save();

    return response.success(res, USER_CONSTANTS.PASSWORD_CHANGE_SUCCESS);
  } catch (err) {
    console.error(err.message);
    return response.error(res, err.message, 500);
  }
});

router.post("/refresh-token", async (req, res) => {
  const { error } = validateRefreshToken(req.body);
  if (error) return response.error(res, error.details[0].message);

  const { refreshToken } = req.body;

  try {
    const decoded = await jwt.verify(
      refreshToken,
      config.get("jwtRefreshTokenPrivateKey"),
    );
    console.log(decoded);

    if (!decoded) return response.error(res);

    // create new access token
    const payload = {
      userId: decoded.userId,
      email: decoded.email,
    };
    const secret = config.get("jwtPrivateKey");
    const options = {
      expiresIn: "1d",
      issuer: "gigpayflow.com",
      audience: decoded.userId,
    };

    const token = await jwt.sign(payload, secret, options);

    // create new refresh token
    const newRefreshTokenPayload = {
      userId: decoded.userId,
      email: decoded.email,
    };
    const newRefreshTokenSecret = config.get("jwtRefreshTokenPrivateKey");
    const newRefreshTokenOptions = {
      expiresIn: "1y",
      issuer: "gigpayflow.com",
      audience: decoded.userId,
    };

    const newRefreshToken = await jwt.sign(
      newRefreshTokenPayload,
      newRefreshTokenSecret,
      newRefreshTokenOptions,
    );

    // get user and replace access token
    user = await User.findById(decoded.userId);
    user.accessToken = token;
    user.refreshToken = newRefreshToken;

    await user.save();
    return response.withData(res, { token: token, refreshToken: refreshToken });
  } catch (error) {
    return response.error(res, error.message);
  }
});

async function logCurrentUserState(user) {
  let auditUser = new UserAudit({
    userId: user._id.toString(),
    fullName: user.fullName,
    phone: user.phone,
    email: user.email,
    stateId: user.stateId,
    address: user.address,
    status: user.status,
    profilePic: user.profilePic,
    createdBy: user.createdBy,
    modifiedBy: user.modifiedBy,
    modifiedDate: user.modifiedDate,
  });
  await auditUser.save();
}

module.exports = router;
