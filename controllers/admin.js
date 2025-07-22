const mongoose = require("mongoose");
const path = require("path");

const Routes = require("../util/Routes");
const fileHelper = require("../util/fileHelper");

const Product = require("../models/product").Product;

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    isLoggedIn: req.session.isLoggedIn,
    errorMessage: null,
    hasError: false,
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const price = req.body.price;
  const description = req.body.description;
  const imageUrl = req.file.path;

  console.log("Printing File Data: ", req.file);

  const product = new Product({
    title,
    price,
    description,
    imageUrl: imageUrl,
    userId: req.user._id, // You can also use req.user only it will automatically fetch Id from user data.
  });
  product
    .save()
    .then((result) => {
      console.log("Created Product");
      console.log(result);
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500; // You can set custom error code here.
      next(error); // This will pass the error to the next middleware.
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        isLoggedIn: req.session.isLoggedIn,
        errorMessage: null,
        hasError: false,
        validationErrors: [],
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500; // You can set custom error code here.
      next(error); // This will pass the error to the next middleware.
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.file ? req.file.path : null; // Use the uploaded file path or the existing image URL.
  const updatedDesc = req.body.description;
  // const product = new Product(updatedTitle, updatedPrice, updatedDesc, updatedImageUrl);
  // findByIdAndUpdate
  Product.findOneAndUpdate(
    { _id: prodId, userId: req.user._id },
    {
      title: updatedTitle,
      price: updatedPrice,
      imageUrl: updatedImageUrl ? updatedImageUrl : undefined, // If no new image is uploaded, keep the existing one.
      description: updatedDesc,
    }
  )
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      // If you want to delete the old image file from the server, you can use fileHelper.
      if (updatedImageUrl) {
        const oldImagePath = path.join(__dirname, "..", product.imageUrl);
        fileHelper.deleteFile(oldImagePath);
      }
      console.log("UPDATED PRODUCT!");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log("Inside PostEditController: ", err);
      res.redirect(Routes.MAIN_INDEX);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    // .select('title description price -_id') // This is use to select specific fields and with '-' sign you can exclude some fields.
    /**
     * This populate('reference key value', 'pass here keys name if you want to populate specific fields')
     * This is used when you want to fetch every data of reference key and not just Id.
     * In this below case while calling populate on userId it will fetch every data related to user inside that particular
     * product object.
     */
    // .populate('userId')
    .then((products) => {
      console.log("Products Here :) ");
      // console.log(products);
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
        isLoggedIn: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500; // You can set custom error code here.
      next(error); // This will pass the error to the next middleware.
    });
};

exports.postDeleteProduct = (req, res, next) => {
  // console.log("=== DELETE PRODUCT DEBUG ===");
  // console.log("Request method:", req.method);
  // console.log("Request body:", req.body);
  // console.log("Request headers:", req.headers);
  // console.log("Product ID from body:", req.body.productId);
  // console.log("CSRF token from body:", req.body._csrf);
  // console.log("===============================");

  const prodId = req.body.productId;
  //lets delete the product from cart as well if it exists.
  req.user
    .deleteFromCart(prodId)
    .then((user) => {
      // console.log("Product deleted from cart if it existed.", user);
      // findByIdAndDelete
      return Product.findOneAndDelete({ userId: req.user._id, _id: prodId });
    })
    .then((product) => {
      if (!product) {
        throw new Error("Product not found.");
      }
      // If you want to delete the image file from the server, you can use fs.unlink
      const filePath = path.join(__dirname, "..", product.imageUrl);
      fileHelper.deleteFile(filePath);
      console.log("Product Deleted", product);
      //Lets not redirect to products page after deleting product.
      // res.redirect("/admin/products");
      res
        .status(200)
        .json({ success: true, message: "Product deleted successfully!" });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500; // You can set custom error code here.
      next(error); // This will pass the error to the next middleware.
    });
};
