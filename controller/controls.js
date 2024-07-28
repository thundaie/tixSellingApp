const jwt = require("jsonwebtoken");
require("dotenv").config();
const mongoose = require("mongoose");

//Schemas
const UserSchema = require("../models/user");
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
  const orderList = OrderSchema.find().limit(5).populate("users", "name").sort("{dateOrdered}: -1"); //the field after userId is to specify the fields you want to populate
  //-1 in the sort sorts the order the list from the latest(last) to first
  if (!orderList) return res.status(500).json({ success: false });

  res.status(200).json({
    success: true,
    orders: orderList,
  });
}



async function getOneOrder(req, res){
  let id = req.params.id

  if(!id) return res.json({ message: "Invalid parameters"})

  const order = await OrderSchema.findById(id).populate("users", "name").populate({  path: "orderItem", populate: "products"})
  //By nesting the path in an object we are able to populate both the orderItem and the product inside the OrderItem

  if(!order) return res.status(500).json({ status: false})

  res.json({
    status: "success",
    order: order
  })
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


async function deleteOrder(req, res){
  const id = req.params.id

  if(!id) return res.status(400).json({  message: "Invalid parameter"})

  try {
    let deletedOrder = await OrderSchema.findByIdAndDelete(id)

    if(!deletedOrder) return res.status(500).json({ message: "Invalid parameter"})

    res.status(200).json({
      status: "Successful",
      message: "Order deleted succesfully"
    })
  } catch (error) {
    res.status(500).json({
      message: "Internal server Error"
    })
  }
}

async function updateOrder(req, res){
  const id = req.params.id

  if(!id) return res.status(400).json({  message: "Invalid parameter"})

  let updateInfo = Promise.all(
    req.body.orderItem.map(async (order) => {
      let newOrder = new OrderItem({
        quantity: order.quantity,
        product: order.product,
      });
      const orderRecieved = await newOrder.save();
      return orderRecieved._id;
    })
  );

  const resolvedOrders = await updateInfo

  let orderUpdate = new OrderSchema({
    userId: req.body.userId,
    orderItem: resolvedOrders,
    address: req.body.address,
    phoneNumber: req.body.phoneNumber,
    status: req.body.status,
  });

  try {
    let updatedOrder = await OrderSchema.findByIdAndUpdate(id, orderUpdate, { new: true })

    if(!updatedOrder) return res.status(500).json({ message: "Invalid parameter"})

    res.status(200).json({
      status: "Successful",
      message: "Order updated succesfully",
      order: updatedOrder
    })
  } catch (error) {
    res.status(500).json({
      message: "Internal server Error"
    })
  }
}



//Category
const updateCategory = async(req, res) => {

  const id = req.params.id
  const { name, icon, color } = req.body

  let updatedCategories = categorySchema.findByIdAndUpdate(
      id,
      {
          name: name,
          icon: icon,
          color: color
      }, 
      {
          new: save
      }
  )

  if(!updatedCategories){
      res.send({
          success: false
      })
  }

  await updatedCategories.save()
  res.status(200).send({
      success: true
  })
}

const oneCategory = async(req, res) => {
  const id = req.params.id

  if(!id){
      res.status(404).send({
          message: "A valid id param must be provided"
      })
  }

  try {
      let oneCategory = await categorySchema.findById(id)

      if(!oneCategory){
          res.send({
              status: false
          })
      }
      res.send({
          status: true,
          category: oneCategory
      })
  } catch (error) {
      console.log(error)
      res.send({
          status: error
      })
  }
}



const allCategories = async (req, res) => {

  try {
    const productCategory = await categorySchema.find().limit(5)

    if(!productCategory){
        res.send({
            success: "failed"
        })
    }
    res.status(200).send(productCategory)
  } catch (error) {
    console.log(error)
    res.status(500).send({
        status: error,
        message: "Internal Server Error"
    })
}
  }


  const createCategory = async(req, res) => {
    const { name, icon, color } = req.body

    let newCategory =  new categorySchema({
        name: name, 
        icon: icon,
        color: color
    })

    if(!newCategory){
        res.send({
            success: false
        })
    }

    await newCategory.save()
    res.status(200).send({
        success: true
    })
}
 


const deleteCategory = async(req, res) => {
  const id = req.params.id

  if(!id){
      res.status(404).send({
          message: "A valid id param must be provided"
      })
  }
  try {
      let deletedCategory = await categorySchema.findByIdAndDelete(id)
      if(!deletedCategory){
          res.send({
              status: false,
              message: "Invalid ID"
          })
      }
      res.send({
          status: true
      })
  } catch (error) {
      console.log(error)
      res.send({
          status: error
      })
  }
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
  getOneOrder,
  deleteOrder,
  updateOrder,
  updateCategory,
  oneCategory,
  allCategories,
  createCategory,
  deleteCategory
};
