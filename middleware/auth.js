const { MIDDLEWARE_AUTH_CONSTANTS } = require("../config/constant.js");
const jwt = require("jsonwebtoken");
const config = require("config");
const mongoose = require("mongoose");
const { User } = require("../models/user");
const { ApiLog } = require("../models/apiLog");
const response = require("../services/response");


function test(tempObj) {
  return async (req, res, next) => {
    console.log("TempObj: ", tempObj)
    next()
  }
}

adminAuth = async function (req, res, next) {
  if (!config.get("requiresAuth")) return next();

  let reqUserId = "";
  // const token = req.header("Authorization");
  if(!req.headers.authorization) return response.error(res, MIDDLEWARE_AUTH_CONSTANTS.RESOURCE_FORBIDDEN);
  const token = req.headers.authorization.split(' ')[1];

  if (!token) 
    return response.error(res, MIDDLEWARE_AUTH_CONSTANTS.ACCESS_DENIED, 401);
    
  try {
    
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));

    req.jwtData = decoded;

    if(typeof decoded.role !== "object" || !decoded.role.includes("admin")) 
      return response.error(res, MIDDLEWARE_AUTH_CONSTANTS.RESOURCE_FORBIDDEN, 403);

    // if (decoded.role !== "admin")
    //   return response.error(res, MIDDLEWARE_AUTH_CONSTANTS.RESOURCE_FORBIDDEN, 403);

    
    let admin = await User.findOne({ _id: mongoose.Types.ObjectId(decoded.userId) });
    if (!admin || (admin && admin.accessToken !== token))
      return response.error(res, MIDDLEWARE_AUTH_CONSTANTS.ACCESS_DENIED, 401);


    // if (!admin)
    //   return response.error(res, MIDDLEWARE_AUTH_CONSTANTS.ACCESS_DENIED, 401);

    reqUserId = decoded.userId;

    await logApis(req.method, reqUserId, req.baseUrl + req.url, req.jwtData.email, req.jwtData.role, req.jwtData.subrole || "NA", req.body);

    next();

  } catch (ex) {
    return response.error(res, ex, 401);
    // return response.error(res, MIDDLEWARE_AUTH_CONSTANTS.ACCESS_DENIED, 401);
  }
};

userAuth = async function (req, res, next) {
  if (!config.get("requiresAuth")) return next();

  let reqUserId = "";
  
  // const token = req.header("Authorization");
  if(!req.headers.authorization) return response.error(res, MIDDLEWARE_AUTH_CONSTANTS.RESOURCE_FORBIDDEN);
  const token = req.headers.authorization.split(' ')[1];
  console.log(token);

  if (!token)
    return response.error(res, MIDDLEWARE_AUTH_CONSTANTS.ACCESS_DENIED, 401);

  try {
    const decoded = jwt.verify(token, config.get("jwtPrivateKey"));
    req.jwtData = decoded;
    console.log(decoded)

    if(typeof decoded.role !== "object" || !decoded.role.includes("user")) 
      return response.error(res, MIDDLEWARE_AUTH_CONSTANTS.RESOURCE_FORBIDDEN, 403);

    // if (decoded.role !== "user")
    //   return response.error(res, MIDDLEWARE_AUTH_CONSTANTS.RESOURCE_FORBIDDEN, 403);

    let user = await User.findOne({ _id: mongoose.Types.ObjectId(decoded.userId) });
    if (!user || (user && user.accessToken !== token))
      return response.error(res, MIDDLEWARE_AUTH_CONSTANTS.ACCESS_DENIED, 401);

    req.userData = user;
    reqUserId = decoded.userId;
    
    console.log(user)

    await logApis(req.method, reqUserId, req.baseUrl + req.url, req.jwtData.email, req.jwtData.role, req.jwtData.subrole || "NA", req.body);

    next();
  } catch (ex) {
    return response.error(res, MIDDLEWARE_AUTH_CONSTANTS.ACCESS_DENIED, 401);
  }
};

async function logApis(method, userId, url, email, role, subrole, body) {
  if (method != "GET"); {
    let apiLog = new ApiLog({ method, userId, url, email, role, subrole, body });
    await apiLog.save();
  }
}

module.exports.test = test;
module.exports.adminAuth = adminAuth;
module.exports.userAuth = userAuth;