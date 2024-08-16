const jwt = require("jsonwebtoken");
require("dotenv").config();
const mongoose = require("mongoose");
const multer = require("multer")
const axios = require("axios");
const QRCode = require("qrcode");
const nodeMailer = require("nodemailer")
const { v4: uuidv4 } = require("uuid")
const bcrypt = require("bcrypt")

//Schemas
const UserSchema = require("../models/user");
const OrderSchema = require("../models/order");
const ProductsSchema = require("../models/products");
const categorySchema = require("../models/category");
const OrderItem = require("../models/orderItem");
const userVerification = require("../models/newVerification")


//ENV files
const JWT_SECRET = process.env.JWT_SECRET;
const testKey = process.env.TEST_SECRET_KEY;
const authenticationEmail = process.env.AUTH_EMAIL
const authenticationPassword = process.env.AUTH_PASSWORD


//Transporter for the mail recovery setup

const transporter = nodeMailer.createTransport({
  service: "outlook",
  auth: {
    user: authenticationEmail,
    pass: authenticationPassword
  }
})


//testing the transporter
transporter.verify((err, data) => {
  if(err){
    return console.log(`an error occured. \n ${err}`)
  }
  console.log("transporter ready")
})

//Multer config for saving images

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = file_types_allowed[file.mimetype]
    let uploadError = new Error('Invalid image type')
    if(isValid) {
      uploadError = null
    }  
    cb(uploadError, 'public/uploads')
  }, 
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-")
    const fileExtension = file_types_allowed[file.mimetype]
    cb(null, `${fileName} + '-' + ${Date.now()}.${fileExtension}`)
  }
})

const upload = multer({ storage: storage })

//Infuse into product post request upload.single('image')

//MIMe types are used for file extension

const file_types_allowed = {
  "images/png": "png",
  "images/jpeg": "jpeg",
  "images/jpg": "jpg"
}

//Email Verification
sendVerificationEmail = async ({_id, email}, res) => {
  //URL to be used in the mail we're sending out
  const currentUrl = `http://localhost:${process.env.PORT}`

  const uniqueString = uuidv4() + _id

  const mailOptions = {
    from: authenticationEmail,
    to: email,
    subject: "Verify your email",
    html: `<p>VErify your email address to complete your signUp</p>
            <p>Link expires in <b>5 minutes</b></p>
            <p>press <a href=${currentUrl + "user/verify/" + _id + "/" + uniqueString}> here</a></p>`
  }

  //Before saving, the uniqueValue has to be hashed and saved
  try {
   const savedUnique = await bcrypt.hash(uniqueString, 10)
   if(!savedUnique) return console.log("Error while trying to save unique String")

    const newVerification = new userVerification({
      userId: _id,
      uniqueString: savedUnique,
      createdAt: Date.now(),
      expiresIn: Date.now() + 21600000
    })

   await newVerification.save()

    await transporter.sendMail(mailOptions, (err) => {
      if(err){
        console.log(err)
        return res.status(500).json({
          message: "Error sending out confirmation email"
        })
      }
      return res.status(200).json({
        message: "Please chech your email address to confirm signUp"
      })
    })
  } catch (error) {
    console.log(error)
  }
}


//USERS
async function signUp(req, res) {
  const newUser = new UserSchema({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    isAdmin: req.body.isAdmin,
  });
  try {
    const userCreated = await newUser.save();
    if (!userCreated){
      return res.status(500).json({ message: "internal server error" });
    }
    const token = jwt.sign({ username: req.body.username }, JWT_SECRET, {
      expiresIn: "1hr",
    });
    console.log("user Saved");
    sendVerificationEmail(userCreated, res)
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

//PRODUCT

async function createProduct(req, res) {
  const category = await categorySchema.findById(req.body.categories);

  if (!category) return res.status(400).json({ message: "Invalid Category" });


  const file = req.file //TO check if file exists

  if(!file) return res.status(400).send("No image in request ")
  const fileName = file.fileName
  const basePath = `${req.protocol}://${req.get('host')}/public/upload/` //req.protocol serves http, req.get('host'), serves localhost: PORT

  const newProduct = new ProductsSchema({
    title: req.body.title,
    price: req.body.price,
    description: req.body.description,
    categories: req.body.categories,
    image: `${basePath}${fileName}`, //Translates to http://localhost:3000/public/upload
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

//to update an image

async function updateImage(req, res){
  if(!mongoose.isValidObjectId(req.params.id)){
    return res.status(400).send("Invalid Product Id")
  }

  const id = req.params.id
  const files = req.files
  let imagePath = []
  const basePath = `${req.protocol}://${req.get('host')}/public/upload/`

  if(files) {
    files.map(file => {
      imagePath.push(`${basePath}${file.filename}`)
    })
  }

  const product = await ProductsSchema.findOneAndUpdate(id, {
    images: imagePath
  }, { new: true })
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

  if (!productCount) return res.status(500).json({ message: false });

  return res.status(200).json({ featuredCount: productCount });
}

//ORDERS

async function getAllOrders(req, res) {
  const orderList = OrderSchema.find()
    .limit(5)
    .populate("users", "name")
    .sort("{dateOrdered}: -1"); //the field after userId is to specify the fields you want to populate
  //-1 in the sort sorts the order the list from the latest(last) to first
  if (!orderList) return res.status(500).json({ success: false });

  res.status(200).json({
    success: true,
    orders: orderList,
  });
}

async function getOneOrder(req, res) {
  let id = req.params.id;

  if (!id) return res.json({ message: "Invalid parameters" });

  const order = await OrderSchema.findById(id)
    .populate("users", "name")
    .populate({ path: "orderItem", populate: "products" });
  //By nesting the path in an object we are able to populate both the orderItem and the product inside the OrderItem

  if (!order) return res.status(500).json({ status: false });

  res.json({
    status: "success",
    order: order,
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

  const resolvedOrders = await newOrderId;

  const totalPrices = await Promise.all(
    resolvedOrders.map(async (allOrders) => {
      const orderItem = await OrderItem.findById(allOrders).populate(
        "products",
        "price"
      ); //Helps us find the price
      let subTotal = orderItem.product.price * orderItem.quantity;

      return subTotal;
    })
  );

  const total = totalPrices.reduce((a, b) => a + b, 0); //The total prices returns an array and the reduce function adds it back.

  let newOrder = new OrderSchema({
    userId: req.body.userId,
    orderItem: resolvedOrders,
    address: req.body.address,
    phoneNumber: req.body.phoneNumber,
    status: req.body.status,
    totalPrice: total,
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

async function totalSales(req, res) {
  const totalSales = await OrderSchema.aggregate([
    { $group: { _id: null, totalSales: { $sum: "$totalPrice" } } },
  ]);

  if (!totalSales) {
    return res.status(400).json({ nessage: "Total sales cannot be retrived" });
  }

  return res.status(200).json({
    totalSales: totalSales.pop().totalSales, //.pop gets the first of the array since the aggregate returns an array
  });
}

async function orderCount(req, res) {
  const orderNumber = await OrderSchema.countDocuments((count) => count);

  if (!orderNumber) return res.status(500).json({ status: false });

  res.status(200).json({
    orderCount: orderNumber,
  });
}

async function getSingleUserOrder(req, res){
  const id = req.params.id

  if(!id) return res.status(400).json({ message: "Provide relevant parameters" })

  const singleOrder = OrderItem.find({ _id: id }).populate({
    path: "orderItem", populate: {
      path: "products", populate: "Category"
    }
  }).sort({ "dateOrdered": -1 })


  if(!singleOrder) return res.status(400).json({success: false})

  return res.status(200).json({ order: singleOrder })
}

async function deleteOrder(req, res) {
  const id = req.params.id;

  if (!id) return res.status(400).json({ message: "Invalid parameter" });

  try {
    let deletedOrder = await OrderSchema.findByIdAndDelete(id).then(
      async (order) => {
        if (order) {
          await order.orderItem.map(async (orderItems) => {
            await OrderItem.findByIdAndDelete(orderItems);
          });
          return res.status(200).json({ message: "Order deleted succesfully" });
        } else {
          return res.status(404).json({ success: false });
        }
      }
    );

    if (!deletedOrder)
      return res
        .status(500)
        .json({ message: "An error occured while trying to delete" });

    res.status(200).json({
      status: "Successful",
      message: "Order deleted succesfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server Error",
    });
  }
}

async function updateOrder(req, res) {
  const id = req.params.id;

  if (!id) return res.status(400).json({ message: "Invalid parameter" });

  let orderUpdate = {
    status: req.body.status,
  };

  try {
    let updatedOrder = await OrderSchema.findByIdAndUpdate(id, orderUpdate, {
      new: true,
    });

    if (!updatedOrder)
      return res.status(500).json({ message: "Invalid parameter" });

    res.status(200).json({
      status: "Successful",
      message: "Order updated succesfully",
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server Error",
    });
  }
}

//CATEGORY
const updateCategory = async (req, res) => {
  const id = req.params.id;
  const { name, icon, color } = req.body;

  let updatedCategories = categorySchema.findByIdAndUpdate(
    id,
    {
      name: name,
      icon: icon,
      color: color,
    },
    {
      new: save,
    }
  );

  if (!updatedCategories) {
    res.send({
      success: false,
    });
  }

  await updatedCategories.save();
  res.status(200).send({
    success: true,
  });
};

const oneCategory = async (req, res) => {
  const id = req.params.id;

  if (!id) {
    res.status(404).send({
      message: "A valid id param must be provided",
    });
  }

  try {
    let oneCategory = await categorySchema.findById(id);

    if (!oneCategory) {
      res.send({
        status: false,
      });
    }
    res.send({
      status: true,
      category: oneCategory,
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: error,
    });
  }
};

const allCategories = async (req, res) => {
  try {
    const productCategory = await categorySchema.find().limit(5);

    if (!productCategory) {
      res.send({
        success: "failed",
      });
    }
    res.status(200).send(productCategory);
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: error,
      message: "Internal Server Error",
    });
  }
};

const createCategory = async (req, res) => {
  const { name, icon, color } = req.body;

  let newCategory = new categorySchema({
    name: name,
    icon: icon,
    color: color,
  });

  if (!newCategory) {
    res.send({
      success: false,
    });
  }

  await newCategory.save();
  res.status(200).send({
    success: true,
  });
};

const deleteCategory = async (req, res) => {
  const id = req.params.id;

  if (!id) {
    res.status(404).send({
      message: "A valid id param must be provided",
    });
  }
  try {
    let deletedCategory = await categorySchema.findByIdAndDelete(id);
    if (!deletedCategory) {
      res.send({
        status: false,
        message: "Invalid ID",
      });
    }
    res.send({
      status: true,
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: error,
    });
  }
};



//PAYSTACK
const initiateTransaction = async (req, res) => {
  const id = req.params.id;
  const basePath = `${req.protocol}://${req.get("host")}`;

  const userOrder = `${basePath}/order/${id}`;

  try {
    //fetch order details from the order API
    const orderResponse = await axios.get(userOrder);

    const { email, amount } = orderResponse.data;

    // Initialize the Paystack transaction
    const paystackResponse = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // Amount in kobo
      },
      {
        headers: {
          Authorization: `Bearer ${testKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { data } = paystackResponse.data;

    // Generate the QR code
    const qrCodeDataUrl = await QRCode.toDataURL(
      data.authorization_url,
      { errorCorrectionLevel: "H" },
      (err, data) => {
        if (err) {
          res
            .status(500)
            .send("An error occured while trying to generate QRCode");
          console.log(err);
        }
        return data;
      }
    );

    res.json({
      status: "success",
      message: "Payment initialized successfully",
      data: {
        authorization_url: data.authorization_url,
        qr_code: qrCodeDataUrl,
      },
    });
  } catch (error) {
    console.error("Error initializing payment:", error);
    res.status(500).json({
      status: "error",
      message: "Could not initialize payment",
    });
  }
};


const verifyTransaction = async (req, res) => {
  const { reference, orderId } = req.body;

  try {
    // Verify the Paystack transaction
    const verifyResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${testKey}`,
        },
      }
    );

    const { data } = verifyResponse.data;

    if (data.status === "success") {
      // Payment was successful, generate QR code
      const qrCodeDataUrl = await QRCode.toDataURL(data.authorization_url, { errorCorrectionLevel: 'H' }, (err, data) => {
        if(err){
          console.log(err)
          return res.status(500).send("An error occured while generating qrcode")
        } 
        return data

      });

      res.json({
        status: "success",
        message: "Payment verified successfully",
        data: {
          qr_code: qrCodeDataUrl,
        },
      });
    } else {
      res.status(400).json({
        status: "error",
        message: "Payment verification failed",
      });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      status: "error",
      message: "Could not verify payment",
    });
  }
};





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
  getFeaturedProductCount,
  getCount,
  userCount,
  totalSales,
  orderCount,
  getAllOrders,
  createOrder,
  getOneOrder,
  getSingleUserOrder,
  deleteOrder,
  updateOrder,
  updateCategory,
  oneCategory,
  allCategories,
  createCategory,
  deleteCategory,
  updateImage,
  initiateTransaction,
  verifyTransaction
};
