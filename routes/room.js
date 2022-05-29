const express = require("express");
const User = require("../models/User");
const Room = require("../models/Room");
const isAuthenticated = require("../middlewares/isAuthenticated");
const res = require("express/lib/response");
const { findByIdAndDelete } = require("../models/Room");

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

module.exports = router;
