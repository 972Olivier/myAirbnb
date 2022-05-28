const express = require("express");
const User = require("../models/User");
const Room = require("../models/Room");
const isAuthenticated = require("../middlewares/isAuthenticated");

const router = express.Router();

router.post("/room/publish", isAuthenticated, async (req, res) => {
  // console.log(req.user);
  // console.log(req.fields);
  const { title, description, price, location } = req.fields;
  // console.log(title);
  // console.log(description);
  // console.log(price);
  // console.log(location);
  const locationToArray = Object.values(location);
  if (title && description && price && location) {
    const newRoom = new Room({
      title,
      description,
      location: locationToArray,
      price,
      user: req.user._id,
    });
    // console.log(newRoom);

    await newRoom.save();
    res.json({
      photos: [],
      location: locationToArray,
      _id: newRoom._id,
      title: newRoom.title,
      description: newRoom.description,
      price: newRoom.price,
      user: newRoom.user,
      __v: newRoom.__v,
    });
  } else {
    res.status(400).json({
      message: "missing parameters",
    });
  }
});

module.exports = router;
