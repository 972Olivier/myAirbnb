const express = require("express");
const User = require("../models/User");
const Room = require("../models/Room");
const isAuthenticated = require("../middlewares/isAuthenticated");

const router = express.Router();

router.post("/room/publish", isAuthenticated, (req, res) => {
  // console.log(req.headers.authorization.replace("Bearer", ""));
  console.log(req.user);
  res.json("here");
});

module.exports = router;
