const errorCode = {
  inUse: {errorName: "ValueInUse", errorCode: 901},
  invalidToken: {errorName: "InvalidToken", errorCode: 902},
  invalidUser: {errorName: "InvalidUser", errorCode: 903},
  internal: {errorName: "InternalError", errorCode: 904},
  notAllowed: {errorName: "NotAllowed", errorCode: 905},
  invalidValue: {errorName: "InvalidValue", errorCode: 906},
  missingValue: {errorName: "MissingValue", errorCode: 907}
};

module.exports = errorCode;
