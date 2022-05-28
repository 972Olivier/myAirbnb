const mongoose = require("mongoose");

const User = mongoose.model("User", {
  token: String,
  email: {
    unique: true,
    type: String,
  },
  username: String,
  name: String,
  description: String,
  hash: String,
  salt: String,
});

module.exports = User;
