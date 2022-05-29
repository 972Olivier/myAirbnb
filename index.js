const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const app = express();
app.use(formidable());
mongoose.connect("mongodb://localhost/myAirbnb");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
// console.log(process.env);
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const userRoutes = require("./routes/user");
app.use(userRoutes);

const roomRoutes = require("./routes/room");
app.use(roomRoutes);

app.all("*", (req, res) => {
  res.status(404).json({
    message: "this route doesn't exist",
  });
});

app.listen(3000, () => console.log("server started 🏆"));
