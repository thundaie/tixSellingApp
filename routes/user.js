const express = require("express");
const router = express.Router();
const { signInValidator, signUpValidator } = require("../validator/validator");
const authenticate = require("../utils/auth");

const {
  signIn,
  signUp,
  getAllUsers,
  getOneUser,
  verifyUser,
  verifiedUser,
  passwordReset,
  verifyPasswordReset
} = require("../controller/controls");

router.get("/", getAllUsers);

router.get("/:id", getOneUser);

router.post("/signIn", signInValidator, signIn);

router.post("/signUp", signUpValidator, signUp);

router.put("/update");

router.post("/reset-password", passwordReset)

router.post("/verify-password-reset", verifyPasswordReset)

router.get("/verify/:userId/:uniqueString", verifyUser)

router.get("/verified", verifiedUser)
module.exports = router;
