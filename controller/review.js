const Review = require("./../models/review");
//const catchAsync = require("./../src/catchAsync");
const factory = require("./handlerFactory");

exports.setId = (req, res, next) => {
  if (!req.body.information) req.body.information = req.params.informationId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.getReview = factory.getOne(Review);
exports.getAllReviews = factory.getAll(Review);
