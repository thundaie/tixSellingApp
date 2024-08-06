const express = require("express");
const router = express.Router();
const { signInValidator, signUpValidator } = require("../validator/validator");
const authenticate = require("../utils/auth");

const {
  signIn,
  signUp,
  getAllUsers,
  getOneUser,
} = require("../controller/controls");

router.get("/", getAllUsers);

router.get("/:id", getOneUser);

router.post("/signIn", signInValidator, signIn);

router.post("/signUp", signUpValidator, signUp);

router.put("/update");

module.exports = router;
