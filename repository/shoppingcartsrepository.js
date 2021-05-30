const Cart = require("../models/shopingcarts");
exports.cart = async () => {
  const carts = await Cart.find().populate({
    path: "items.productId",
    select: "name price total",
  });
  return carts[0];
};
exports.addItem = async (payload) => {
  const newItem = await Cart.create(payload);
  return newItem;
};



exports.removecarts = async (id) => {
  const carts = await Cart.findByIdAndRemove(id);
  return carts;
};