const Information = require("../models/information");
const mongoose = require("mongoose");
const fs = require("fs");
const url = require("url");
const multer = require("multer");
const sharp = require("sharp");

//const informations = JSON.parse(fs.readFileSync(`${__dirname}/files.json`));
const APIFeatures = require(".././src/apifeatures");
const factory = require("./handlerFactory");
const { json } = require("body-parser");
const catchAsync = require("../src/catchAsync");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadInformationPhoto = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);
// upload.single(image);
// upload.array("images", 5);
exports.resizeInformationImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // 1) Cover image
  req.body.imageCover = `information-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);
  //2) images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `information-${req.params.id}-${Date.now()}${
        i + 1
      }.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );
  console.log(req.body);
  next();
});

exports.aliasTopnumber = (req, res, next) => {
  req.query.limit = "5";
  req.query.sort = "-number";
  req.query.fields = "name,number,date";
  next();
};

exports.GetAll = factory.getAll(Information);
// async (req, res) => {
//   try {
//     //display()
//     const features = new APIFeatures(Information.find(), req.query)
//       .filter()
//       .sort()
//       .limitFields()
//       .paginate();
//     const information = await features.query;
//     res.status(200).json({
//       status: "success",
//       count: information.length,
//       products: information.map((docs) => {
//         return {
//           docs: docs,
//           // id: docs.id,
//           // name: docs.name,
//           // number: docs.number,
//           // date: docs.date,
//           // difficulty: docs.difficulty,
//           // ratingsAverage: docs.ratingsAverage,
//           // ratingsQuantity: docs.ratingsQuantity,
//           // price: docs.price,
//           // date: docs.date,
//         };
//       }),

//       request: {
//         type: "GET",
//         url: "http://localhost:3000/information",
//       },
//     });
//   } catch {
//     res.status(404).json({
//       error: err,
//     });
//   }
// };

exports.PostAll = (req, res, next) => {
  console.log(req.body);

  Information.find({ name: req.body.name })
    .exec()
    .then((doc) => {
      if (doc.length >= 1) {
        res.status(409).json({
          message: "name exist",
          date: doc.date,
        });
      } else {
        information = new Information({
          _id: new mongoose.Types.ObjectId(),
          name: req.body.name,
          number: req.body.number,
          difficulty: req.body.difficulty,
          ratingsAverage: req.body.ratingsAverage,
          ratingsQuantity: req.body.ratingsQuantity,
          price: req.body.price,
          date: req.body.date,
          guides: [req.body.guides],
        });
        information
          .save()
          .then((result) => {
            console.log(result);

            fs.appendFileSync(
              `${__dirname}/writefiles.json`,
              JSON.stringify(information) + ",\n"
            );
            res.status(201).json({
              status: "success",
              data: {
                information,
              },
            });

            console.log("Method : POST");
            console.log("success");
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({
              error: err,
            });
          });
      }
    });
};

exports.GetOne = factory.getOne(Information, { path: "review" });
// (req, res, next) => {
//   const id = req.params.pack;
//   Information.findById(id)
//     .populate("review")
//     .populate("guiedes")
//     // .select("name number id difficulty ratingsAverage ratingsQuantity price")
//     .exec()
//     .then((docs) => {
//       console.log(docs);
//       if (docs) {
//         res.status(200).json({
//           message: docs,
//         });
//       } else {
//         res.status(404).json({
//           error: "not found",
//         });
//       }
//     })
//     .catch((err) => {
//       res.status(500).json({
//         error: err,
//       });
//     });
// };

exports.UpdateOne = factory.updateOne(Information);

///*  */async (req, res, next) => {
//   const id = req.params.id;
//   const inf = await Information.findOne({ _id: id });
//   inf.name = req.body.name;
//   inf.number = req.body.number;
//   inf.difficulty = req.body.difficulty;
//   inf.ratingsAverage = req.body.ratingsAverage;
//   inf.ratingsQuantity = req.body.ratingsQuantity;
//   inf.price = req.body.price;
//   await inf.save();
//   res.status(200).json({
//     updatedList: inf,
//   });
// };

exports.DeleteOne = factory.deleteOne(Information);
// exports.DeleteOne = async (req, res, next) => {
//   const id = req.params.pack;
//   const deleteedFiles = await Information.findByIdAndRemove(id);
//   if (deleteedFiles) {
//     res.status(200).json({
//       message: "success",
//     });
//   } else {
//     res.status(404).json({
//       error: "not founded",
//     });
//   }
// };

exports.getdata = (req, res, next) => {
  const readdata = fs.readFileSync(`./data.json`, "utf-8");
  const somedata = JSON.parse(readdata);
  console.log(somedata);
  res.send(somedata);
};

exports.param = (req, res, next, value) => {
  console.log(`id is ${value}`);
  next();
};

exports.deleteall = async (req, res, next) => {
  // try {
  //   await Information.deleteMany();
  //   console.log("Data successfully deleted!");
  // } catch (err) {
  //   console.log(err);
  //   res.status(500).json({
  //     error: err,
  //   });
  // }
  try {
    let inf = await Information.find().select("name number _id ");
    inf.name = [];
    inf.number = [];
    inf._id = [];
    let data = await inf.save();
    res.status(200).json({
      type: "Success",
      message: "id has been emptied",
      data: data,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      type: "Invalid",
      message: "Something went wrong",
      err: err,
    });
  }
};

//exports.getstats = async (req, res) => {
//   try {
//     const stats = await Information.aggregate([
//       {
//         $match: { number: { $gte: 100 } },
//       },
//       {
//         $group: {
//           //_id: null,
//           //avgnumber: { $avg: "$number" },
//           minnum: { $min: "$number" },
//           maxnum: { $max: "$number" },
//         },
//       },
//     ]);
//     res.stats(200).json({
//       status: "success",
//       data: {
//         message: stats,
//       },
//     });
//   } catch {
//     res.status(404).json({
//       status: "fail",
//       error: err,
//     });
//   }
// };

exports.getstats = async (req, res) => {
  try {
    const stats = await Information.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: "$difficulty" },
          numInformation: { $sum: 1 },
          numRatings: { $sum: "$ratingsQuantity" },
          avgRating: { $avg: "$ratingsAverage" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      // {
      //   $match: { _id: { $ne: 'EASY' } }
      // }
    ]);

    res.status(200).json({
      status: "success",
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.getMounthlyplan = async (req, res) => {
  try {
    const year = req.params.year * 1; // 2021

    const plan = await Information.aggregate([
      {
        $unwind: "$date",
      },
      {
        $match: {
          date: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$date" },
          numStarts: { $sum: 1 },
          information: { $push: "$name" },
        },
      },
      {
        $addFields: { month: "$_id" },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: { numStarts: -1 },
      },
      {
        $limit: 12,
      },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.getInformationWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    return res.status(400).json({
      error: "plz provide latiture and longitude in the format lat,lng",
    });
  }
  const information = await Information.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });
  res.status(200).json({
    status: "success",
    data: {
      data: information,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(",");

  const multiplier = unit === "mi" ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    return res.status(400).json({
      error: "plz provide latiture and longitude in the format lat,lng",
    });
  }

  const distances = await Information.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: "distance",
        distanceMultiplier: multiplier,
        spherical: true,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      data: distances,
    },
  });
});
