const SYSTEM_FAILURE = "Internal server error!!!";

const MIDDLEWARE_AUTH_CONSTANTS = {
  ACCESS_DENIED: "Access denied. No authorization token provided",
  RESOURCE_FORBIDDEN: "You don't have access to the request resource.",
  INVALID_AUTH_TOKEN: "Invalid token",
};

const AUTH_CONSTANTS = {
  INVALID_CREDENTIALS: "Invalid email or password",
  INVALID_PASSWORD:
    "You have entered incorrect old password. Please try again with valid password.",
  INACTIVE_ACCOUNT: "Account is not active. please contact admin",
  INVALID_EMAIL:
    "The email provided is not registered. Please sign up to continue.",
  PASSWORD_CHANGE_SUCCESS: "Password changed succesfully",
};

const VERSION_CONSTANT = {
  SUBMIT_SUCCESS: "Version details added successfully",
  NO_UPDATE: "You are on latest version",
  VERSION_MANDATORY: "Query parameter v is mandatory",
  APPTYPE_MANDATORY: "Query parameter appType is mandatory",
};

const ADMIN_CONSTANTS = {
  INVALID_EMAIL: "Invalid username/password.",
  BLOCKED_ACCOUNT: "Your account is blocked. Please contact admin.",
};

const ROLE_CONSTANTS = {
  SUBMIT_SUCCESS: "Role added successfully",
  UPDATE_SUCCESS: "Role updated successfully",
  NOT_FOUND: "Role not found",
};

const USER_CONSTANTS = {
  INVALID_USER: "User with given id not found",
  UPDATE_SUCCESS: "User updated successfully",
  SUBMIT_SUCCESS: "User added successfully",
  EMAIL_ALREADY_EXISTS: "Email already registered",
  PHONE_ALREADY_EXISTS: "Phone number already registered",
  MOBILE_EMAIL_ALREADY_EXISTS: "Mobile and Email both already registered",
  ALL_CHECKS_VALID: "All check are valid",
  VERIFICATION_SUCCESS: "Verification success. Please log in.",
  VERIFICATION_FAILURE:
    "We were unable to find a valid token. Your token may have expired.",
  USER_ALREADY_VERIFIED: "This user has already been verified.",
  VERIFICATION_EMAIL_SENT:
    "Please confirm yourself by clicking on verify user button sent to your email :-)",
  RESET_PASSWORD_EMAIL_SENT: "A reset email has been sent to your email",
  PASSWORD_MISMATCH: "Passwords do not match",
  NOT_YET_VERIFIED: "Your account has not been verified.",
  PASSWORD_CHANGE_SUCCESS: "Password reset successfully!",
};

module.exports.SYSTEM_FAILURE = SYSTEM_FAILURE;
module.exports.AUTH_CONSTANTS = AUTH_CONSTANTS;
module.exports.MIDDLEWARE_AUTH_CONSTANTS = MIDDLEWARE_AUTH_CONSTANTS;
module.exports.ADMIN_CONSTANTS = ADMIN_CONSTANTS;
module.exports.VERSION_CONSTANT = VERSION_CONSTANT;
module.exports.ROLE_CONSTANTS = ROLE_CONSTANTS;
module.exports.USER_CONSTANTS = USER_CONSTANTS;
