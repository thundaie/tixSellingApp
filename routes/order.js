const express = require("express")
const router = express.Router()
const { getAllOrders, createOrder, getOneOrder, deleteOrder } = require("../controller/controls")


router.get("/", getAllOrders)
router.post("/", createOrder)
router.get("/:id", getOneOrder)
router.delete("/:id", deleteOrder)