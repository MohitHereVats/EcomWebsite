const { check, body, validationResult } = require("express-validator");
const Routes = require("../util/Routes");
const User = require("../models/user").User;

/** * Validation rules for user signup
 * See check function will check the whole request, include headers, body, params, query etc.
 * In this case it will look for "email" in the request.
 * While for password and confirmPassword, it will look for the body only.
 * Make sure to sanitize the input using .normalizeEmail() for email and .trim() for password.
 * This is important to prevent XSS attacks and ensure the data is clean.
 * The validation rules are then used in the route handler to validate the request.
 * If the validation fails, it will return a 422 status code with the error message.
 * If the validation passes, it will call the next middleware function.
 */
const userValidationRules = [
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email address."),
    // .normalizeEmail(), // Removed to preserve original input for error display
  body("password", "Password must be at least 6 characters long and contain only letters and numbers.")
    .isLength({ min: 6 })
    // .isAlphanumeric()
    .trim(),
  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match.");
      }
      return true;
    }),
];

const validSignUpRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation Errors: ", errors.array());
    console.log("Email : ",req.body.email)
    return res.status(422).render("auth/signup", {
      pageTitle: "SignUp",
      path: Routes.SIGNUP,
      isLoggedIn: req.session.isLoggedIn,
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }
  next();
};

//Async function to check if email already exists
const checkEmailExists = (req, res, next) => {
  const email = req.body.email;
  User.findOne({ email: email })
    .then((user) => {
      if (user) {
        req.flash("error", "Email already exists.");
        return res.redirect(Routes.SIGNUP);
      }
      next();
    })
    .catch((err) => {
      console.log("Error while checking email existence: ", err);
      res.redirect(Routes.SIGNUP);
    });
};

module.exports = {
    userValidationRules,
    validSignUpRequest,
    checkEmailExists
}
