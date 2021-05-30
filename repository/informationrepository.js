const Information = require("../models/information");

exports.findinf = async () => {
  const infs = await Information.find().select("name number _id ");
  return carts[0];
};
