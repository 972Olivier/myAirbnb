const express = require("express");

const router = express.Router();

router.post("/user/sign_up", (req, res) => {
  //   const { email, password, username, name, description } = req.fields;
  //   console.log(email), console.log(password);
  //   console.log(username);
  //   console.log(name);
  //   console.log(description);

  try {
    // console.log(req.fields);
    res.json({
      _id: "5e58ca7f576975074f23e6e6",
      token: "bRCfDgm9SrB49raag4ZgtpgC1DvE99lh1zlkSR7ZnUkoxQKKeJlwkFQKYF9nFgel",
      email: "jean@gmail.com",
      username: "Jean-75",
      description: "My name is Jean.",
      name: "Jean",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

module.exports = router;
