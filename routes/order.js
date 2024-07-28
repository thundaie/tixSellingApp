const express = require("express")
const router = express.Router()
const { getAllOrders, createOrder } = require("../controller/controls")


router.get("/", getAllOrders)
router.post("/", createOrder)