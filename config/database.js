//F8eCt87OGOZALtgF
const mongoose = require("mongoose");
require("dotenv").config();


const { DATABASE_URI } = process.env;

exports.connect = () => {
  mongoose
    .connect(DATABASE_URI,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
    .then(() => {
      console.log("Succesfully connected to database");
    })
    .catch((err) => {
      console.log("database connection failed.");
    });
};
