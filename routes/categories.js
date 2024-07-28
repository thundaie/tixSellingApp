const categorySchema = require("../models/category");
const router = require("express").Router();
const {
  updateCategory,
  oneCategory,
  allCategories,
  createCategory,
  deleteCategory,
} = require("../controller/controls");
const category = require("../models/category");

router.get("/", allCategories);

router.post("/", createCategory);

router.delete("/:id", deleteCategory);

router.get("/:id", oneCategory);

router.put("/", updateCategory);
