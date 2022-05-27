const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const app = express();
app.use(formidable());
mongoose.connect("mongodb://localhost/myAirbnb");

const userRoutes = require("./routes/user");
app.use(userRoutes);

app.all("*", (req, res) => {
  res.status(404).json({
    message: "this route doesn't exist",
  });
});

app.listen(3000, () => console.log("server started 🏆"));
