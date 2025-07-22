
const { body, validationResult } = require("express-validator");
const Routes = require("../util/Routes");
const User = require("../models/user").User;

const userLoginRules = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email address."),
    // .normalizeEmail(),
  body("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long.")
];

const validLoginRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      pageTitle: "Login",
      path: Routes.LOGIN,
      isLoggedIn: req.session.isLoggedIn,
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: req.body.email,
        password: req.body.password
      },
      validationErrors: errors.array()
    });
  }
  next();
};

const checkUserExists = (req, res, next) => {
  const email = req.body.email;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "User does not exist.");
        return res.redirect(Routes.LOGIN);
      }
      req.user = user; // Attach user to request object for further processing
      next();
    })
    .catch((err) => {
      console.log("Error checking user existence: ", err);
      res.redirect(Routes.SIGNUP);
    });
};

module.exports = {
  userLoginRules,
  validLoginRequest,
  checkUserExists
};
