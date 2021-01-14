const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
// const allRoutes = require("./routes/main");
const PORT = process.env.PORT || 5000;

dotenv.config();

const connectionString = process.env.DB_URI;

//Configure MongoDB Database
mongoose
  .connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => {
    console.log("MongoDB Running Successfully");
  })
  .catch((err) => {
    console.log("MongoDB not Connected ");
  });

app.engine("ejs");
app.set("view engine", "ejs");

//Listen
app.listen(PORT, () => {
  console.log("Server is running...");
  console.log(process.env.DB_URI);
});
