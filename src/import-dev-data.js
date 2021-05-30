const fs = require("fs");
const express = require('express');
const Information = require("./../models/information");
const app = express();
require("./config/mongoose")(app)
// const mongoose = require("mongoose");
// module.exports = app => {
//     mongoose.connect('mongodb://localhost:27017/cart', {
//         useUnifiedTopology: true,
//         useNewUrlParser: true,
//         useFindAndModify: false
//     }).then(res => console.log("connected")).catch(err => console.log(err))
//     mongoose.Promise = global.Promise;
//     process.on("SIGINT", cleanup);
//     process.on("SIGTERM", cleanup);
//     process.on("SIGHUP", cleanup);
//     if (app) {
//         app.set("mongoose", mongoose);
//     }
// };
// function cleanup() {
//     mongoose.connection.close(function () {
//         process.exit(0);
//     });
// }

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Information.create(tours);
    console.log("Data successfully loaded!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Information.deleteMany();
    console.log("Data successfully deleted!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
