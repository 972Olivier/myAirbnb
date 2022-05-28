const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.replace("Bearer ", "");
    const userFind = await User.findOne({ token });
    if (userFind) {
      // console.log(userFind);
      // console.log(token);
      req.user = userFind;
      next();
    } else {
      res.status(400).json({
        error: "Unauthorized",
      });
    }
  } else {
    res.status(400).json({
      error: "Unauthorized",
    });
  }
};

module.exports = isAuthenticated;
