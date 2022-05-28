const mongoose = require("mongoose");

const Room = mongoose.model("Room", {
  photos: { type: mongoose.Schema.Types.Mixed, default: {} },
  location: Array,
  title: String,
  description: String,
  price: Number,
  ser: { type: mongoose.Types.ObjectId, ref: "User" },
});

module.exports = Room;
