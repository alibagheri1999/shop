const mongoose = require("mongoose");
const Information = require("./information");
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review can not be empty!"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    information: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Information",
        required: [true, "Review must belong to a information."],
      },
    ],
    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "Review must belong to a user"],
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ information: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

reviewSchema.statics.calcAverageRating = async function (informationId) {
  const stats = await this.aggregate([
    {
      $match: { information: informationId },
    },
    {
      $group: {
        _id: "$information",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  console.log(stats);
  if (stats.length > 0) {
    await Information.findByIdAndUpdate(informationId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Information.findByIdAndUpdate(informationId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post("save", function () {
  //this.constructor => alowed us to access Review wuth capital R
  //this points to current review
  this.constructor.calcAverageRating(this.information);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.one = await this.findOne();
  console.log(this.one);
});

reviewSchema.post(/^findOneAnd/, async function (next) {
  await this.one.constructor.calcAverageRating(this.one.information);
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
