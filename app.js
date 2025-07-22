process.config = require("dotenv").config();
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDbSession = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");

const errorController = require("./controllers/error");
const { CollectionNames, DataBaseName } = require("./util/constants");
const decodeImage = require('./middleware/decodeImage');


// const sequelize = require('./util/database');
// const Product = require('./models/product');
// const Cart = require('./models/cart');
// const CartItem = require('./models/cart-item');
// const Order = require('./models/order');
// const OrderItem = require('./models/order-item');

const User = require("./models/user").User;

const mongoConnect = require("./util/database").mongoConnect;
const mongooseConnect = require("./util/database").mongooseConnect;

const app = express();

const store = new MongoDbSession(
  {
    uri: `mongodb+srv://RootUser:RootUser%40900@nodecluster.2sll7.mongodb.net/${DataBaseName}?retryWrites=false&w=majority&appName=NodeCluster`,
    collection: CollectionNames.Session,
  },
  (err) => {
    console.log("Some Sort of Error : ", err);
  }
);

const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(decodeImage);
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

/**
 * This below sesion middleware will add "session" in request and you can access like: "req.session" 
 This middleware also sets the cookie and do the cookie parsing
 This session Middleware adds/fetches/updates session data to MongoDb with the help of store -> In this case: MongoDbStore
 Now if you will save user like this: req.session.user = user;, the session middle ware will fetch the session everytime
 but it will not fetch user data because store has idea only about collections.

 By this: req.session.user = user -> Only the data gets stored and not the magic methods of mongoose.

*/

app.use(
  session({
    secret: "My Secret",
    resave: false,
    saveUninitialized: false,
    store: store,
    // cookie: {
    // You can also add some cookie related changes here.
    // }
  })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  (res.locals.isLoggedIn = req.session.isLoggedIn),
    (res.locals.csrfToken = req.csrfToken());
  next();
});

// app.use((req, res, next) => {
//   // res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   res.setHeader('Access-Control-Allow-Credentials', 'true');
//   // res.setHeader('Access-Control-Expose-Headers', 'Content-Length, X-JSON, X-Requested-With, X-CSRF-Token');
//   next();
// });

app.use((req, res, next) => {
  //By directly throwing error we can test error handling middleware.
  //For Promises: If from here you throw error, like inside catch block, it will not be caught by error handling middleware.
  // If you want to test error handling middleware, you can use next(error) or next(error) inside catch block.
  // next(new Error("This is a test error")); // Uncomment to test error handling middleware.
  // Or you can use next() without any argument, it will
  // just pass the control to next middleware, which is error handling middleware.

  // throw new Error("This is a test error");
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500; // You can set custom error code here.
      next(error); // This will pass the error to the next middleware.
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  console.log("Error Occurred: ", error);
  res.status(500).render("500", {
    pageTitle: "Error",
    isLoggedIn: false, //req.session.isLoggedIn,
    path: "/500",
    errorMessage: error.message || "An unknown error occurred!",
  });
});

// mongoConnect(() => {
//   app.listen(3000);
//   // Product.save();
// });

mongooseConnect(() => {
  app.listen(process.env.PORT);
});
