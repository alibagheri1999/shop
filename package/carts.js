const router = require("express").Router();
const productController = require("../controller/carts");
const multerInstance = require("../src/config/multer");
router.post(
  "/",
  multerInstance.upload.single("image"),
  productController.createProduct
);

router.param("id", productController.param);
router.get("/", productController.getProducts);
router.get("/:id", productController.getProductById);
router.delete("/:id", productController.removeProduct);
module.exports = router;
