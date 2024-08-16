const router = require("express").Router();
require("dotenv").config();
const { initiateTransaction, verifyTransaction} = require("../controller/controls")

router.post("/paystack/:id", initiateTransaction)
router.get("/verify", verifyTransaction)
module.exports = router;
