const path = require("path");
const PDFDocument = require("pdfkit");
const fs = require("fs");

const { Order } = require("../models/order");

const Product = require("../models/product").Product;

const ItemsPerPage = 20;

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1; // Default to page 1 if not provided
  const skipItems = (page - 1) * ItemsPerPage;
  let totalItems = 0;

  Product.countDocuments()
    .then((count) => {
      totalItems = count;
      return Product.find().skip(skipItems).limit(ItemsPerPage);
    })
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        isLoggedIn: req.session.isLoggedIn,
        // csrfToken: req.csrfToken(),
        currentPage: page,
        nextPage: totalItems > page*ItemsPerPage ?  page + 1 : -1,
        previousPage: page - 1,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500; // You can set custom error code here.
      next(error); // This will pass the error to the next middleware.
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
        isLoggedIn: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500; // You can set custom error code here.
      next(error); // This will pass the error to the next middleware.
    });
};

exports.getIndex = async (req, res, next) => {
  const page = +req.query.page || 1; // Default to page 1 if not provided
  const skipItems = (page - 1) * ItemsPerPage;
  let totalItems = 0;

  Product.countDocuments()
    .then((count) => {
      totalItems = count;
      return Product.find().skip(skipItems).limit(ItemsPerPage);
    })
    .then((products) => {
      // console.log("Products on this page: ", products);
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        isLoggedIn: req.session.isLoggedIn,
        csrfToken: req.csrfToken(),
        currentPage: page,
        nextPage: totalItems > page*ItemsPerPage ?  page + 1 : -1,
        previousPage: page - 1,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500; // You can set custom error code here.
      next(error); // This will pass the error to the next middleware.
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((products) => {
      console.log("Products in Cart: ", products);
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
        isLoggedIn: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500; // You can set custom error code here.
      next(error); // This will pass the error to the next middleware.
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  // console.log("The Product Id received is -------------------->>>>> ", prodId);
  // console.log(typeof prodId);
  req.user
    .addToCart(prodId)
    .then((result) => {
      console.log("Cart is updated ----->>>>>>>>>>>>>>>>>>>>>>>>>>>> :) ");
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500; // You can set custom error code here.
      next(error); // This will pass the error to the next middleware.
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .deleteFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500; // You can set custom error code here.
      next(error); // This will pass the error to the next middleware.
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .createOrder()
    .then((result) => {
      // res.redirect("/orders");
      res.redirect("/");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500; // You can set custom error code here.
      next(error); // This will pass the error to the next middleware.
    });
};

exports.getOrders = (req, res, next) => {
  req.user
    .getOrders()
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
        isLoggedIn: req.session.isLoggedIn,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500; // You can set custom error code here.
      next(error); // This will pass the error to the next middleware.
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found."));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized access to this order."));
      }
      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);
      const pdfDoc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);
      pdfDoc.fontSize(26).text("Invoice", {
        underline: true,
      });
      pdfDoc.text("-------------------------");
      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice += prod.quantity * prod.price;
        pdfDoc
          .fontSize(14)
          .text(
            prod.title +
              " - " +
              prod.quantity + " x $" + prod.price.toFixed(2)
          );
      });
      pdfDoc.text("-------------------------");
      pdfDoc.fontSize(20).text("Total Price: $" + totalPrice.toFixed(2));
      pdfDoc.end();
      //If you want to read the file and send it as response, you can use fs.readFile.
      // Note this is for a file that is already created and saved.
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }
      //   res.setHeader('Content-Type', 'application/pdf');
      //   res.setHeader(
      //     'Content-Disposition',
      //     'inline; filename="' + invoiceName + '"'
      //   );
      //   res.send(data);
      // });
      // const file = fs.createReadStream(invoicePath);

      // file.pipe(res);
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500; // You can set custom error code here.
      next(error); // This will pass the error to the next middleware.
    }
  );
};

exports.getCheckout = (req, res, next) => {
  let totalSum = 0;
  req.user
    .getCart()
    .then((products) => {
      console.log("Products in Cart for Checkout: ", products);
      products.forEach((p) => {
        totalSum += p.quantity * p.price;
      });
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products: products,
        isLoggedIn: req.session.isLoggedIn,
        totalSum: totalSum,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500; // You can set custom error code here.
      next(error); // This will pass the error to the next middleware.
    });
};

