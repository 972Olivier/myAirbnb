const express = require("express");
const router = express.Router();
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const isAuthenticated = require("../middlewares/isAuthenticated");
const Room = require("../models/Room");

const User = require("../models/User");
const sha256 = require("crypto-js/sha256");
const cloudinary = require("cloudinary").v2;

const formdata = require("form-data");
const Mailgun = require("mailgun.js");

const mailgun = new Mailgun(formdata);
const client = mailgun.client({
  username: "Olivier",
  key: process.env.MAILGUN_API_KEY,
});

// Identifiants mailgun
// const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY; // L'API_KEY fournie par mailgun
// const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN; // Le domaine fourni par mailgun

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
        res.json(newUser);
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

router.get("/user/upload_picture/:id", isAuthenticated, async (req, res) => {
  try {
    // console.log(req.headers.authorization.replace("Bearer ", ""));
    // console.log(req.user);
    // console.log(req.params.id);
    // res.json(req.files.photo);
    // console.log(req.files.photo.path);
    const cloudinaryPhotoUser = await cloudinary.uploader.upload(
      req.files.photo.path,
      {
        folder: `/myAirbnb`,
      }
    );
    // console.log(cloudinaryPhotoUser); affiche toutes les infos de la photo uploded
    const findUser = await User.findById({ _id: req.params.id });
    findUser.photo = {
      url: cloudinaryPhotoUser.secure_url,
      picture_id: cloudinaryPhotoUser.public_id,
    };

    await findUser.save();
    res.json({
      account: {
        photo: findUser.photo,
        username: findUser.username,
        description: findUser.description,
        name: findUser.name,
      },
      _id: findUser._id,
      email: findUser.email,
      rooms: [],
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

router.get("/user/delete_picture/:id", isAuthenticated, async (req, res) => {
  try {
    // console.log(req.params.id);
    const userWithoutPhoto = await User.findById({ _id: req.params.id });
    // console.log(userWithoutPhoto);
    const id = userWithoutPhoto.photo.picture_id;
    // console.log("test ===> " + id);
    await cloudinary.api.delete_resources_by_prefix(`${id}`);
    userWithoutPhoto.photo = null;
    await userWithoutPhoto.save();
    res.json({
      account: {
        photo: userWithoutPhoto.photo,
        username: userWithoutPhoto.username,
        description: userWithoutPhoto.description,
        name: userWithoutPhoto.name,
      },
      _id: userWithoutPhoto._id,
      email: userWithoutPhoto.email,
      rooms: [],
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//### Lire un profil utilisateur

router.get("/users/:id", async (req, res) => {
  try {
    // console.log(req.params.id);
    const findById = await User.findById({ _id: req.params.id });
    // console.log(findById);
    const roomUser = await Room.find({ user: findById });
    // console.log(roomUser);
    const roomsPush = [];
    const forEach = roomUser.forEach((element) => {
      roomsPush.push(element._id);
    });
    findById.rooms = roomsPush;
    await findById.save();
    res.json({
      _id: findById._id,
      account: {
        username: findById.username,
        name: findById.name,
        description: findById.description,
        photo: findById.photo,
      },
      rooms: findById.rooms,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

//### Lire les annonces d'un utilisateur

router.get("/user/rooms/:id", async (req, res) => {
  try {
    const findByIdUser = await User.findById({ _id: req.params.id }).select(
      "rooms"
    );
    let array = findByIdUser.rooms;
    const arrayRooms = [];
    for (let i = 0; i < array.length; i++) {
      let result = await Room.findById({ _id: array[i] });
      arrayRooms.push(result);
    }
    res.json(arrayRooms);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

//*----- modifier des élements de l'utilisateur--------*/

router.post("/user/update", isAuthenticated, async (req, res) => {
  try {
    // console.log(req.fields);
    const { email, name, description, username } = req.fields;
    // console.log(email, name, description, username);
    const findEmail = await User.findOne({ email });
    const findUsername = await User.findOne({ username });
    // console.log(req.user);
    // console.log(findEmail);
    // console.log(findUsername);
    if (email && !findEmail) {
      req.user.email = email;
      await req.user.save();
    }

    if (username && !findUsername) {
      req.user.username = username;
      await req.user.save();
    }
    if (req.user.description !== description && description) {
      req.user.description = description;
      await req.user.save();
    }
    if (name && req.user.name !== name) {
      req.user.name = name;
      await req.user.save();
    }
    res.json({
      _id: req.user._id,
      email: req.user.email,
      account: {
        username: req.user.username,
        name: req.user.name,
        description: req.user.description,
        photo: req.user.photo,
      },
      rooms: req.user.rooms,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

/*---- modifier le mot de passe d'un utilisateur authentifié -----*/

router.post("/user/update_password", isAuthenticated, async (req, res) => {
  // console.log(req.user);
  try {
    if (req.fields.previousPassword !== req.fields.newPassword) {
      // à faire vérifier que le mot de passe ancien refait le hass. si c'est le cas on continue
      if (
        req.user.hash ===
        sha256(req.fields.previousPassword + req.user.salt).toString(encBase64)
      ) {
        // //------la suite---
        const newToken = uid2(16);
        console.log("newToken ====>", newToken);
        const newSalt = uid2(16);
        console.log("newSalt ===>", newSalt);
        const newHash = SHA256(req.fields.newPassword + newSalt).toString(
          encBase64
        );
        console.log("newHash", newHash);
        req.user.token = newToken;
        req.user.salt = newSalt;
        req.user.hash = newHash;
        await req.user.save();

        // mailgun et envoie de message pour indiquer que le mot de passe est modifié
        const messageData = {
          from: `MyAibnb <MyAirbnb@email.com>`,
          to: "oliviercen@gmail.com", // à changer par un email valide de l'utilisateur ====> req.user.email
          subject: "New password",
          text: "your new password is a reality !!!!!",
        };

        client.messages
          .create(process.env.MAILGUN_DOMAIN, messageData)
          .then((response) => {
            console.log(response);
            res.status(200).json({
              _id: req.user._id,
              email: req.user.email,
              token: req.user.token,
              account: {
                username: req.user.username,
                name: req.user.name,
                description: req.user.description,
                photo: req.user.photo,
              },
              rooms: req.user.rooms,
            });
          })
          .catch((error) => {
            res.status(400).json({
              message: error.message,
            });
          });

        // res.json("passworded checked");
      } else {
        res.status(400).json({
          message: "unhautorized",
        });
      }
    } else {
      res.json("same password");
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

//### Envoyer un mail afin qu'un utilisateur non authentifié puisse modifier son mot de passe
router.put("/user/recover_password", async (req, res) => {
  // console.log(req.fields.email);
  // res.json("here");
  try {
    if (req.fields.email) {
      const user = await User.findOne({
        email: req.fields.email,
      });
      if (user) {
        const token_limited = uid2(16);
        // console.log(tokenLimited);
        user.tokenLimitedPassword = token_limited;
        const time_start = Date.now(); // date en milliseconde
        // console.log(timeStart);
        user.timeStartPassword = time_start;
        await user.save();
        // console.log(user);
        // envoi de l'email contenant le token temporaire-------------
        const messageData = {
          from: `MyAibnb <MyAirbnb@email.com>`,
          to: "oliviercen@gmail.com", // à changer par un email valide de l'utilisateur ====> req.user.email
          subject: "New password",
          text: `your temporary token ==> ${user.tokenLimitedPassword}`,
        };

        client.messages
          .create(process.env.MAILGUN_DOMAIN, messageData)
          .then((response) => {
            console.log(response);
          })
          .catch((error) => {
            res.status(400).json({
              message: error.message,
            });
          });

        //------------------------------------
        res.json({
          message: "A link has been sent to the user",
        });
      } else {
        res.status(400).json({
          message: "user not found",
        });
      }
    } else {
      res.status(400).json({
        message: "missing parameters",
      });
    }
  } catch (error) {
    res.status(400).json({
      message: message.error,
    });
  }
});

module.exports = router;
