const validatorUtils = require("validator");
const Validator = require("jsonschema").Validator;
const errorCode = require("./error_code.js");

const validation = {};
const v = new Validator();

validation.addSchema = schema => {
  v.addSchema(schema, schema.id);
};

// Alias format validator
const aliasRegex = new RegExp("^[a-zA-Z0-9]+([_-]?[a-zA-Z0-9])*$", "i");
Validator.prototype.customFormats.alias = input => {
  return aliasRegex.test(input);
};

// Alias or email Format validator for user search
const aliasOrEmailRegex = new RegExp("^[a-zA-Z0-9_@.-]*$", "i");
Validator.prototype.customFormats.aliasOrEmail = input => {
  return aliasOrEmailRegex.test(input);
};

// Email format validator
Validator.prototype.customFormats.email = input => {
  return validatorUtils.isEmail(email);
};

validation.addSchema({
  id: "/AliasOrEmail",
  type: "string",
  format: "aliasOrEmail",
  minLength: 2,
  maxLength: 200
});

validation.addSchema({
  id: "/UserAlias",
  type: "string",
  format: "alias",
  minLength: 2,
  maxLength: 200
});

validation.addSchema({
  id: "/UserName",
  type: "string",
  minLength: 2,
  maxLength: 200
});

validation.addSchema({
  id: "/Email",
  type: "string",
  format: "email"
});

validation.addSchema({
  id: "/Password",
  type: "string",
  minLength: 2,
  maxLength: 200
});

validation.addSchema({
  id: "/UserId",
  type: "string",
  minLength: 1,
  maxLength: 20
});

validation.addSchema({
  id: "/PlayerScore",
  type: "object",
  properties: {
    id: { $ref: "/UserId" },
    score: { type: "integer", minimum: 0 }
  },
  required: ["id", "score"]
});

validation.addSchema({
  id: "/MatchCreate",
  type: "object",
  properties: {
    player1: { $ref: "/PlayerScore" },
    player2: { $ref: "/PlayerScore" }
  },
  required: ["player1", "player2"]
});

validation.addSchema({
  id: "/MatchGet",
  type: "object",
  properties: {
    matchId: { type: "string" },
    userId: { $ref: "/UserId" },
    userId1: { $ref: "/UserId" },
    userId2: { $ref: "/UserId" }
  },
  required: []
});

validation.addSchema({
  id: "/UserCreate",
  type: "object",
  properties: {
    alias: { $ref: "/UserAlias" },
    email: { $ref: "/Email" },
    name: { $ref: "/UserName" },
    password: { $ref: "/Password" }
  },
  required: ["alias", "email", "name", "password"]
});

validation.addSchema({
  id: "/UserLoginAuth",
  type: "object",
  properties: {
    auth: { type: "string", minLength: 2 },
    password: { $ref: "/Password" }
  },
  required: ["auth", "password"]
});

validation.addSchema({
  id: "/UserLoginToken",
  type: "object",
  properties: {
    token: { type: "string", minLength: 1 }
  },
  required: ["token"]
});

validation.addSchema({
  id: "/SearchUser",
  type: "object",
  properties: {
    aliasOrEmail: { $ref: "/AliasOrEmail" }
  },
  required: []
});

// Validate object and return array of pingpong error codes, if any errors.
// Schema id should match any id added to the Validator (eg /UserCreate).
validation.validate = (object, schemaId, options) => {
  const result = v.validate(object, schemaId);
  return result.errors.map(err => {
    let ecode = errorCode.internal;
    if (err.name === "type") {
      ecode = errorCode.invalidValue;
    } else if (err.name === "format") {
      ecode = errorCode.invalidValue;
    } else if (err.name === "required") {
      ecode = errorCode.missingValue;
    }

    let { hint } = options || {};
    if (!hint) {
      // Remove 'instance' from property array
      // typical format is 'instance.fieldName'
      hint = err.property
        .split(".")
        .slice(1)
        .join(".");
      if (hint.length < 1) hint = undefined;
    }
    return { hint: hint, error: ecode, message: err.message };
  });
};

module.exports = validation;
