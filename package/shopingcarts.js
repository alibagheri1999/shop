const router = require("express").Router();
const bodyParser = require("body-parser");
const cartController = require("../controller/shopingcarts");

router.param("id", cartController.param);
router.post("/", cartController.addItemToCart);
router.get("/", cartController.getCart);
router.delete("/empty-cart", cartController.emptyCart);
router.delete("/:id", cartController.removecarts);
module.exports = router;
