const productRepository = require("../repository/repository");
const Product = require("../models/carts");
const APIFeatures = require("../src/apifeatures");
const path = require("path");
exports.createProduct = async (req, res) => {
  try {
    let payload = {
      name: req.body.name,
      price: req.body.price,
      // image: req.file.path
    };
    let product = await productRepository.createProduct({
      ...payload,
    });
    res.status(200).json({
      status: true,
      data: product,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err,
      status: false,
    });
  }
};
exports.getProducts = async (req, res) => {
  try {
    const features = new APIFeatures(Product.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const products = await features.query;

    res.status(200).json({
      status: true,
      count: products.length,
      data: products,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err,
      status: false,
    });
  }
};
exports.getProductById = async (req, res) => {
  try {
    let id = req.params.id;
    let productDetails = await productRepository.productById(id);
    res.status(200).json({
      status: true,
      data: productDetails,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      error: err,
    });
  }
};
exports.removeProduct = async (req, res) => {
  try {
    let id = req.params.id;
    let productDetails = await productRepository.removeProduct(id);
    res.status(200).json({
      status: true,
      data: productDetails,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      error: err,
    });
  }
};

exports.param = (req, res, next, value) => {
  console.log(`id is ${value}`);
  next();
};
