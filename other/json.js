// const fs = require("fs");

// const informations = JSON.parse(fs.readFileSync(`${__dirname}/files.json`));

// exports.PostAll = (req, res, next) => {
//   console.log(req.body);

//   const information = new Information({
//     _id: new mongoose.Types.ObjectId(),
//     name: req.body.name,
//     number: req.body.number,
//   });
//   information
//     .save()
//     .then((result) => {
//       console.log(result);
//       const newId = new mongoose.Types.ObjectId();
//       const newinformation = Object.assign({ id: newId }, req.body);
//       informations.push(newinformation);
//       fs.writeFile(
//         `${__dirname}/files.json`,
//         JSON.stringify(informations),
//         (err) => {
//           res.status(201).json({
//             status: "success",
//             data: {
//               information: newinformation,
//             },
//           });
//         }
//       );
//       console.log("Method : POST");
//       console.log("success");
//     })
//     .catch((err) => {
//       console.log(err);
//       res.status(500).json({
//         error: err,
//       });
//     });
// };

exports.GetAll = async (req, res, next) => {
  try {
    console.log(req.body); //display()
    const queryObj = { ...req.query };
    let querystr = JSON.stringify(queryObj);
    querystr = querystr.replace(/\b(gte|lte|gt|lt)\b/g, (match) => `$${match}`);
    let query = await Information.find(JSON.parse(querystr));

    const information = await query.query;

    res.status(200).json({
      count: information.length,
      id: information.id,
      name: information.name,
      number: information.number,
      date: information.date,
      request: {
        type: "GET",
        url: "http://localhost:3000/information",
      },
    });
    console.log("Method : GET");
    console.log("success");
  } catch {
    res.status(404).json({
      error: err,
    });
  }
};
