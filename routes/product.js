const express = require("express");
const router = express.Router();
const {
  createProduct,
  findOneProduct,
  getAllProduct,
  deleteProduct,
  editProduct,
  getCount,
  getFeaturedProducts,
  getFeaturedProductCount,
  updateImage
} = require("../controller/controls");
const authenticate = require("../utils/auth");
const { productValidator } = require("../validator/validator");
const multer = require("multer")


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads')
  }, 
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-")
    cb(null, fileName + '-' + Date.now())
  }
})

const upload = multer({ storage: storage })


router.get("/", getAllProduct);

router.get("/:id", authenticate, findOneProduct);

router.delete("/:id", authenticate, deleteProduct);

router.post("/", authenticate, productValidator, upload.single("image"), createProduct);

router.put("/edit/:id", authenticate, editProduct);

router.put("/gallery-images/:id", upload.array('images', 10), updateImage)

router.get("/get/count", getCount);

router.get("/featured", getFeaturedProducts);

router.get("/featured/count", getFeaturedProductCount);

module.exports = router;
