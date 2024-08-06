const joi = require("joi");

const newTask = joi.object({
  username: joi.string().required().min(1).max(30).trim(),
  email: joi.string().required().trim(),
  password: joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
});

const newProduct = joi.object({
  title: joi.string().required().min(1).trim(),
  price: joi.number().required(),
  description: joi.string().required().min(5).trim(),
  categories: joi.array(),
  image: joi.string().required(),
  featured: joi.boolean(),
  stockCount: joi.number().required(),
});

const signUpValidator = async (req, res, next) => {
  const { username, email, password } = req.body;
  const bodyPayload = { username, email, password };

  try {
    await newTask.validateAsync(bodyPayload);
    next();
  } catch (error) {
    console.log(error);
    res.json({
      message: "Please Input the correct values into the relevant fields",
    });
  }
};

const signInValidator = async (req, res, next) => {
  const { username, password } = req.body;
  const bodyPayload = { username, password };

  try {
    await newTask.validateAsync(bodyPayload);
    next();
  } catch (error) {
    console.log(error);
    res.json({
      message: "Please Input the correct values into the relevant fields",
    });
  }
};

const productValidator = async (req, res, next) => {
  const bodyPayload = {
    title: req.body.title,
    price: req.body.price,
    description: req.body.description,
    categories: req.body.categories,
    image: req.body.image,
    featured: req.body.featured,
    stockCount: req.body.stockCount,
  };
  try {
    await newProduct.validateAsync(bodyPayload);
    next();
  } catch (error) {
    res.json({
      message: "Please Input the correct values into the relevant fields",
    });
  }
};

module.exports = {
  signInValidator,
  signUpValidator,
  productValidator,
};
