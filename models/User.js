const mongoose = require("mongoose");

const User = mongoose.model("User", {
  token: String,
  email: {
    unique: true,
    type: String,
  },
  photo: {
    url: { type: mongoose.Schema.Types.Mixed, default: {} },
    picture_id: String,
  },
  username: String,
  name: String,
  description: String,
  hash: String,
  salt: String,
});

module.exports = User;
