const express = require("express");
const User = require("../models/User");
const Room = require("../models/Room");
const isAuthenticated = require("../middlewares/isAuthenticated");
const RoomModel = require("../models/Room");
const cloudinary = require("cloudinary").v2;

const router = express.Router();

router.post("/room/publish", isAuthenticated, async (req, res) => {
  try {
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
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

router.get("/rooms", async (req, res) => {
  try {
    const roomFind = await Room.find().select("-description");
    res.json(roomFind);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

router.get("/rooms/:id", async (req, res) => {
  try {
    const findRoom = await Room.findById({ _id: req.params.id }).populate(
      "user"
    );
    // console.log(findRoom);
    res.json({
      photos: [],
      location: findRoom.location,
      _id: findRoom._id,
      title: findRoom.title,
      description: findRoom.description,
      price: findRoom.price,
      user: {
        account: {
          username: findRoom.user.username,
          description: findRoom.user.description,
          name: findRoom.user.name,
        },
        _id: findRoom.user._id,
      },
      __v: findRoom.__v,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

router.get("/room/update/:id", isAuthenticated, async (req, res) => {
  try {
    const findRoom = await Room.findById({ _id: req.params.id }).populate(
      "user"
    );
    const tokenUser = req.headers.authorization.replace("Bearer ", "");
    // console.log(tokenUser);
    // console.log(findRoom.user.token);
    if (tokenUser === findRoom.user.token) {
      // console.log(req.query);
      const objectQuery = req.query;
      // console.log(objectQuery);
      if (
        objectQuery.price ||
        objectQuery.location ||
        objectQuery.title ||
        objectQuery.description
      ) {
        if (objectQuery.price) {
          findRoom.price = objectQuery.price;
        }
        if (objectQuery.location) {
          findRoom.location = objectQuery.location;
        }
        if (objectQuery.title) {
          findRoom.title = objectQuery.title;
        }
        if (objectQuery.description) {
          findRoom.description = objectQuery.description;
        }
        await findRoom.save();
        res.json({
          photos: [],
          location: findRoom.location,
          _id: findRoom._id,
          title: findRoom.title,
          description: findRoom.description,
          price: findRoom.price,
          user: findRoom.user._id,
          __v: findRoom.__v,
        });
      } else {
        res.status(400).json({
          message: "missing parameters",
        });
      }
    } else {
      res.status(400).json({
        error: "Unauthorized",
      });
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

router.get("/room/delete/:id", isAuthenticated, async (req, res) => {
  try {
    const findRoom = await Room.findById({ _id: req.params.id }).populate(
      "user"
    );
    const tokenUser = req.headers.authorization.replace("Bearer ", "");

    if (tokenUser === findRoom.user.token) {
      // console.log(req.params.id);
      await Room.findByIdAndDelete({ _id: req.params.id });
      res.json({
        message: "Room deleted",
      });
    } else {
      res.status(400).json({
        error: "Unauthorized",
      });
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
});

router.get("/room/upload_picture/:id", isAuthenticated, (req, res) => {
  const fileKeys = Object.keys(req.files);
  let results = {};

  if (fileKeys.length === 0) {
    res.send("No file uploaded!");
    return;
  } else if (fileKeys.length < 6) {
    fileKeys.forEach(async (fileKey) => {
      try {
        const file = req.files[fileKey];
        const result = await cloudinary.uploader.upload(file.path, {
          folder: `/myAirbnb/room`,
        });
        results[fileKey] = {
          success: true,
          result: result,
        };

        if (Object.keys(results).length === fileKeys.length) {
          // tous les uploads sont terminés, on peut donc envoyer la réponse au client

          const arrayValue = Object.values(results);

          // console.log(arrayValue.length);
          const arrayUrl = [];
          for (let i = 0; i < arrayValue.length; i++) {
            const object = {
              url: arrayValue[i].result.secure_url,
              public_id: arrayValue[i].result.public_id,
            };

            arrayUrl.push(object);
          }
          // console.log(arrayUrl);
          const findRoom = await Room.findById({ _id: req.params.id });
          // console.log(findRoom);
          findRoom.photos = arrayUrl;
          await findRoom.save();

          res.json(findRoom);
        }
      } catch (error) {
        return res.json({ error: error.message });
      }
    });
  } else {
    res.status(400).json({
      message: "you can uploaded 5 pictures max",
    });
  }
});

module.exports = router;
