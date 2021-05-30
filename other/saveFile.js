// const fs = require("fs");

// const readdata = (file) => {
//   return new Promise((resolve, reject) => {
//     fs.readFile(file, (err, data) => {
//       if (err) reject("I could not find that file 😢");
//       resolve(data);
//     });
//   });
// };

// const writedata = (file, data) => {
//   return new Promise((resolve, reject) => {
//     fs.writeFile(file, data, (err) => {
//       if (err) reject("Could not write file 😢");
//       resolve("success");
//     });
//   });
// };

// const getdata = async () => {
//   try {
//     const data = await readdata(`${__dirname}/files.json`);4
//     await writedata('dog-img.txt');
//   } catch (err) {
//     console.log(err);
//   }
// };
const fs = require("fs");
const mongoose = require("mongoose");
const Information = require("../models/information");
module.exports = (app) => {
  mongoose
    .connect("mongodb://localhost:27017/cart", {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useFindAndModify: false,
    })
    .then((res) => console.log("connected"))
    .catch((err) => console.log(err));
  mongoose.Promise = global.Promise;
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  process.on("SIGHUP", cleanup);
  if (app) {
    app.set("mongoose", mongoose);
  }
};
function cleanup() {
  mongoose.connection.close(function () {
    process.exit(0);
  });
}

// READ JSON FILE
const information = JSON.parse(
  fs.readFileSync(`${__dirname}/saveFile.json`, "utf-8")
);

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Information.create(tours);
    console.log("Data successfully loaded!");
  } catch (err) {
    console.log(err);
  }
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Information.deleteMany();
    console.log("Data successfully deleted!");
  } catch (err) {
    console.log(err);
  }
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
