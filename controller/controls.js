const jwt = require("jsonwebtoken");
require("dotenv").config();
const mongoose = require("mongoose");

//Schemas
const UserSchema = require("../models/user");
const CartSchema = require("../models/cart");
const OrderSchema = require("../models/order");
const ProductsSchema = require("../models/products");
const categorySchema = require("../models/category");
const OrderItem = require("../models/orderItem");

const JWT_SECRET = process.env.JWT_SECRET;

async function signUp(req, res) {
  const newUser = new UserSchema({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    isAdmin: req.body.isAdmin,
  });
  try {
    const userCreated = await newUser.save();
    if (!userCreated)
      return res.status(500).json({ message: "internal server error" });
    const token = jwt.sign({ username: req.body.username }, JWT_SECRET, {
      expiresIn: "1hr",
    });
    console.log("user Saved");
    res.status(200).json({
      status: "Success",
      user: userCreated,
      token: token,
    });
    res.cookie("token", token, { maxAge: 3600000 });
  } catch (error) {
    res.status(500).json({
      message: "An error occured while trying to create user",
    });
    console.log(error);
  }
}

async function signIn(req, res) {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      res.json({
        message: "Please fill in all required fields",
      });

      const user = await UserSchema.findOne({ username: username });

      if (!user || !UserSchema.comparePassword(password)) {
        res.json({
          message: "Incorrect LogIn credentials",
        });
      }
      const token = jwt.sign(
        { username: user.username, isAdmin: user.isAdmin },
        SIGNIN_SECRET,
        {
          expiresIn: "1h",
        }
      );
      res.cookie("token", token, { maxAge: 3600000 });
      res.redirect("/");
    }
  } catch (error) {
    res.status(500).json({
      message: "An error occured while trying to signIn",
    });
    console.log(error);
  }
}

async function getAllUsers(req, res) {
  const allUsers = await UserSchema.find().select("-password").limit(5);

  if (!allUsers)
    return res.status(500).json({ message: "Internal server error" });

  res.status(200).send(allUsers);
}

async function getOneUser(req, res) {
  const id = req.params.id;

  if (!id) return await UserSchema.find().select("-password").limit(5);

  try {
    let oneUser = await UserSchema.findById(id);

    if (!oneUser)
      return res.status(500).json({ message: "Internal server error" });

    res.status(200).json({
      user: oneUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "An internal server error occured while trying to retrive user",
    });
    console.log(error);
  }
}

async function userCount(req, res) {
  const userCount = await userSchema.countDocuments((count) => count);

  if (!userCount) return res.status(500).json({ message: false });

  res.json({
    userCount: userCount,
  });
}

// async function updateUser(req, res){}

async function createProduct(req, res) {
  const category = await categorySchema.findById(req.body.categories);

  if (!category) return res.status(400).json({ message: "Invalid Category" });

  const newProduct = new ProductsSchema({
    title: req.body.title,
    price: req.body.price,
    description: req.body.description,
    categories: req.body.categories,
    stockCount: req.body.stockCount,
    featured: req.body.featured,
  });
  if (!newProduct) {
    res.send("Kindly input all fields");
  }
  try {
    await newProduct.save();
    res.status(200).json({
      message: "The product has been added successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occured while trying to create your product",
    });
  }
}

async function findOneProduct(req, res) {
  const id = req.params.id;

  if (!id) {
    res.status(401).json({ message: "provide a relevant _id" });
  }

  if (!mongoose.isValidObjectId(id)) {
    return res.json({ message: "Please enter a valid Id" });
  }
  // .select can be used to select fields we want to display with space between the parameter
  // to show where we are diffrentiating
  try {
    const productFound = await ProductsSchema.findOne({ _id: id }).select(
      "title description"
    );
    if (!productFound) {
      res.json({
        message: "Product not found",
      });
      res.json({
        Product: productFound,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "An error occured while trying to retrieve your product",
    });
  }
}

const getAllProduct = async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { categories: req.query.categories.split(",") };
  }

  const allProducts = await ProductsSchema.find(filter)
    .populate("Category")
    .sort({ title: -1 })
    .limit(5)
    .select("-_id");

  if (!allProducts)
    return res.status(500).json({ message: "Internal Server Error" });
  res.send(allProducts);
};
/*
const productFilter = req.query.categories;
  let allProducts;
  try {
    productFilter
      ? (allProducts = await ProductsSchema.find({
          categories: {
            $in: [productFilter],
          },
        })
          .sort({ name: -1 })
          .limit(5))
      : (allProducts = await ProductsSchema.find({})
          .sort({ name: -1 })
          .limit(5));

    res.status(200).json({
      product: allProducts,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occured while trying to retrieve products",
    });
  }
*/
const editProduct = async (req, res) => {
  const category = await categorySchema.findById(req.body.categories);
  if (!category) return res.status(400).json({ message: "Invalid Category" });

  const { id } = req.params;
  const changedProduct = {
    title: req.body.title,
    price: req.body.price,
    description: req.body.description,
    categories: req.body.categories,
  };

  if (!changedProduct) {
    res.send("Kindly input update parameters");
  }
  try {
    await ProductsSchema.findByIdAndUpdate(
      id,
      { $set: changedProduct },
      { new: true }
    );
    res.status(200).json({
      message: "The product has been updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occured while trying to update your product",
    });
  }
};

async function deleteProduct(req, res) {
  const id = req.params.id;

  if (!id) {
    res.status(401).json({ message: "provide a relevant _id" });
  }

  try {
    await ProductsSchema.deleteOne({ _id: id });
    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error while trying to delete your product",
    });
  }
}

async function getCount(req, res) {
  const productCount = await ProductsSchema.countDocuments((count) => count);

  if (!productCount) return res.status(500).json({ message: false });

  res.json({
    productCount: productCount,
  });
}

async function getFeaturedProducts(req, res) {
  const productCount = await ProductsSchema.find({ featured: true });

  if (!productCount) return res.status(500).json({ message: false });

  res.send(product);
}

async function getFeaturedProductCount(req, res) {
  const count = req.params.count ? req.params.count : 0;

  if (!count) return res.json({ message: "Input all relevant fields" });

  const productCount = await ProductsSchema.find({ featured: true }).limit(
    +count
  );

  //used + infront of count so as to convert the input string to an int

  if (!product) return res.status(500).json({ message: false });
}

async function getAllOrders(req, res) {
  const orderList = OrderSchema.find().limit(5);

  if (!orderList) return res.status(500).json({ success: false });

  res.status(200).json({
    success: true,
    orders: orderList,
  });
}

async function createOrder(req, res) {
  let newOrderId = Promise.all(
    req.body.orderItem.map(async (order) => {
      let newOrder = new OrderItem({
        quantity: order.quantity,
        product: order.product,
      });
      const orderRecieved = await newOrder.save();
      return orderRecieved._id;
    })
  );

  const resolvedOrders = await newOrderId

  let newOrder = new OrderSchema({
    userId: req.body.userId,
    orderItem: resolvedOrders,
    address: req.body.address,
    phoneNumber: req.body.phoneNumber,
    status: req.body.status,
  });

  let order = newOrder.save();

  if (!order) {
    return res.status(400).send("order was not created");
  }

  res.json({
    status: "success",
    order: order,
  });
}

module.exports = {
  signIn,
  signUp,
  getAllUsers,
  getOneUser,
  createProduct,
  findOneProduct,
  getAllProduct,
  deleteProduct,
  editProduct,
  getFeaturedProducts,
  getCount,
  userCount,
  getAllOrders,
  createOrder,
};
