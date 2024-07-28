const express = require("express");
const app = express();
const helmet = require("helmet");
const cors = require("cors");
const Limiter = require("express-rate-limit");
const connectDb = require("./connect/connect");
require("dotenv").config();

//Required
const userRouter = require("./routes/user");
const productRouter = require("./routes/product");
const expressJwt = require("./middleware/auth");
const errorHandler = require("./middleware/error-handles");

//Limiter Initialization
const rateLimit = Limiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

//connect to database
connectDb();

//MiddleWare
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.options("*", cors());
// app.use(expressJwt());
// app.use(errorHandler());

//Routes
app.use("/user", userRouter);
app.use("/product", productRouter);

const PORT = process.env.PORT || 4200;

app.get("/", (req, res) => {
  res.json({
    message: "Home Page",
  });
});

app.get("*", (req, res) => {
  res.status(404).json({
    message: "Page not found",
  });
});
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
