const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const allRoutes = require("./routes/main");
const cors = require("cors")
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
dotenv.config();

const connectionString = process.env.DB_URI;

//Configure MongoDB Database
mongoose
  .connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((res) => {
    console.log("MongoDB Running Successfully");
  })
  .catch((err) => {
    console.log("MongoDB not Connected ");
  });


app.use("/", allRoutes);

//Listen
app.listen(PORT, () => {
  console.log("Server is running...");
});
