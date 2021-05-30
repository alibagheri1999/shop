const Product = require("../models/carts");


// exports.products = async (req, res, next) => {
//   const features = new APIFeatures(Product.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const products = await features.query;

//   return products;
// };

exports.productById = async (id) => {
  const product = await Product.findById(id);
  return product;
};
exports.createProduct = async (payload) => {
  const newProduct = await Product.create(payload);
  return newProduct;
};
exports.removeProduct = async (id) => {
  const product = await Product.findByIdAndRemove(id);
  return product;
};
