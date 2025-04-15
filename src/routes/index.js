/* modular routes take care of sub paths and their implementation details */
const session = require("./session");
const user = require("./user");
const message = require("./message");

export default {
  session,
  user,
  message,
};
