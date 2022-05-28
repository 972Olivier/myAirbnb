const express = require("express");
const router = express.Router();
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const User = require("../models/User");
const sha256 = require("crypto-js/sha256");

router.post("/user/sign_up", async (req, res) => {
  // // console.log(req.fields);
  const { email, password, username, name, description } = req.fields;
  //   console.log(email), console.log(password);
  // console.log(username);
  //   console.log(name);
  //   console.log(description);

  // créer un token par utilisateur
  // encrypter pasword avec un hash et un salt
  const token = uid2(16);
  // console.log(token);
  const salt = uid2(16);
  const hash = SHA256(password + salt).toString(encBase64);
  // console.log(hash);
  // vérifier si tous les paramètres existes
  try {
    if (email && username && password && name && description) {
      //vérifier email et username pas déjà en BDD
      const findUserByUsername = await User.findOne({ username });
      const findUserByEmail = await User.findOne({ email });
      // console.log(findUserByEmail);
      if (findUserByEmail || findUserByUsername) {
        res.status(400).json({
          error: "This email or this username already has an account.",
        });
      } else {
        const newUser = new User({
          token,
          email,
          username,
          name,
          description,
          hash,
          salt,
        });

        await newUser.save();
        res(newUser);
      }
    } else {
      res.status(400).json({
        error: "Missing parameters",
      });
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

router.post("/user/log_in", async (req, res) => {
  try {
    // console.log(req.fields);
    //verification email et password
    if (req.fields.email && req.fields.password) {
      const findUser = await User.findOne({ email: req.fields.email });
      if (findUser) {
        const userHash = sha256(req.fields.password + findUser.salt).toString(
          encBase64
        );
        // console.log(userHash);
        // console.log(findUser.hash);
        if (userHash === findUser.hash) {
          res.json({
            _id: findUser._id,
            token: findUser.token,
            email: req.fields.email,
            username: findUser.username,
            description: findUser.description,
            name: findUser.name,
          });
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
    } else {
      res.status(400).json({
        error: "Missing parameters",
      });
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

module.exports = router;
