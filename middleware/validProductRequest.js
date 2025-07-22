const { body, validationResult } = require("express-validator");
const Routes = require("../util/Routes");
const Product = require("../models/product").Product;

const productValidationRules = [
  body(
    "title",
    "Title must be at least 3 characters long and contain only letters and numbers."
  )
    .isString()
    .trim()
    .isLength({ min: 5 }),
  //   body("imageUrl", "Image URL must be a valid URL.").trim().isURL(),
  body("price", "Price must be a positive number.")
    .isFloat({ gt: 0 })
    .withMessage("Price must be a positive number."),
  body("description", "Description must be at least 5 characters long.")
    .trim()
    .isLength({ min: 5, max: 400 }),
];

const validProductRequest = (req, res, next) => {
//   console.log("=== Validating Product Request ===", req.file);
  const errors = validationResult(req);
  const isEditMode = req.body.productId ? true : false;
  const product = {
    title: req.body.title,
    price: req.body.price,
    description: req.body.description,
    // imageUrl: req.body.imageUrl,
    _id: req.body.productId,
  };
  const imageError = (!req.file && !isEditMode) ? true : false;
  if (!errors.isEmpty() || imageError) {
    console.log("Validation Errors: ", errors.array());
    return res.status(422).render("admin/edit-product", {
      pageTitle: isEditMode ? "Edit Product" : "Add Product",
      path: isEditMode ? "/admin/edit-product" : "/admin/add-product",
      isLoggedIn: req.session.isLoggedIn,
      editing: isEditMode,
      product: product,
      hasError: true,
      errorMessage: errors.array().length > 0 ? errors.array()[0].msg : "Image file is required.",
      validationErrors: errors.array(),
    });
  }
  next();
};

module.exports = {
  productValidationRules,
  validProductRequest,
};
