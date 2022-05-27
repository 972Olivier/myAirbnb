const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const app = express();
app.use(formidable());
mongoose.connect("mongodb://localhost/myAirbnb");
