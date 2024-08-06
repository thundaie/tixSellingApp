const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  createOrder,
  getOneOrder,
  deleteOrder,
  updateOrder,
  totalSales,
  orderCount,
  getSingleUserOrder
} = require("../controller/controls");

router.get("/", getAllOrders);
router.post("/", createOrder);
router.get("/:id", getOneOrder);
router.delete("/:id", deleteOrder);
router.put("/:id", updateOrder);
router.get("/get/totalsales", totalSales);
router.get("/get/count", orderCount);
router.get("/get/userorder/:id", getSingleUserOrder)

module.exports = router;
