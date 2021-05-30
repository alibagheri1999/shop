const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");
//const User = require("./user");
const Schema = mongoose.Schema;
let informaionSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    name: {
      type: String,
      require: [true, "A information must have a name"],
      unique: true,
      trim: true,
      maxlength: [
        40,
        "A information name must have less or equal then 50 characters",
      ],
      minlength: [
        5,
        "A information name must have more or equal then 5 characters",
      ],
      // validate: [
      //   validator.isAlpha,
      //   "information name must only contain characters",
      // ],
    },
    slug: String,
    number: {
      type: Number,
      require: [true, "A information must have a number"],
      min: [100, "Rating must be above 1.0"],
      max: [5000000000000000, "Rating must be below 5.0"],
    },
    difficulty: {
      type: String,
      required: [true, "A information must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium, difficult",
      },
    },
    imageCover: {
      type: String,
      required: [true, "A information must have image"],
    },
    images: [String],
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    price: {
      type: Number,
      required: [true, "A information must have a price"],
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < 10000;
        },
        message: "Discount price ({VALUE}) should be below regular 1000",
      },
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    date: { type: Date, default: new Date() },
    secret: { type: Boolean /*, default: false*/ },
    startLocation: {
      //GeoJson
      type: {
        type: String,
        default: "point",
        enum: ["point"],
      },
      coordinates: [Number],
      address: { type: String },
      description: { type: String },
    },
    location: [
      {
        type: {
          type: String,
          default: "point",
          enum: ["point"],
        },
        coordinates: [Number],
        address: { type: String },
        description: { type: String },
        day: Number,
      },
    ],
    summary: String,
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    // reviews: [
    //   {
    //     type: mongoose.Schema.ObjectId,
    //     ref: "Review",
    //   },
    // ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//informaionSchema.index({ number: 1 });
informaionSchema.index({ number: 1, ratingsAverage: -1 });
informaionSchema.index({ slug: 1 });
informaionSchema.index({ startLocation: "2dsphere" });

informaionSchema.virtual("point").get(function () {
  return (this.ratingsAverage / 5) * 100 + " from 100";
});

informaionSchema.virtual("review", {
  ref: "Review",
  foreignField: "information",
  localField: "_id",
});

informaionSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// informaionSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async id => await User.findById(_id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre('save', function(next) {
//   console.log('Will save document...');
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
// tourSchema.pre('find', function(next) {
informaionSchema.pre(/^find/, function (next) {
  this.find({ secret: { $ne: true } });

  this.start = Date.now();
  next();
});

informaionSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  next();
});

informaionSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v-passwordChangedAt",
  });
  next();
});

//AGGREGATION MIDDLEWARE
// informaionSchema.pre("aggregate", function (next) {
//   this.pipeline().unshift({ $match: { secret: { $ne: true } } });

//   console.log(this.pipeline());
//   next();
// });
module.exports = mongoose.model("information", informaionSchema);
