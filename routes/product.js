const express = require("express")
const router = express.Router()
const { createProduct, findOneProduct, getAllProduct, deleteProduct, editProduct} = require("../controller/controls")
const authenticate = require("../utils/auth")
const { productValidator } = require("../validator/validator")

router.get("/", getAllProduct)

router.get("/:id", authenticate, findOneProduct)

router.delete("/:id", authenticate, deleteProduct)

router.post("/", authenticate, productValidator, createProduct)

router.put("/edit/:id", authenticate, editProduct)


module.exports = router