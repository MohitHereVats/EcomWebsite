const Routes = require("../util/Routes");
const User = require("../models/user").User;
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const sgTransport = require("nodemailer-sendgrid-transport");

const transporter = nodemailer.createTransport(
  sgTransport({
    auth: {
      api_key:
        process.env.sendGrid_API_Key,
    },
  })
);

exports.getLogin = (req, res, next) => {
  // const isLoggedIn = req.get('Cookie')?.split('=')[1] === 'true';
  // console.log(req.get('Cookie'));
  let message = req.flash("error");
  res.render("auth/login", {
    pageTitle: "Login",
    path: Routes.LOGIN,
    isLoggedIn: req.session.isLoggedIn,
    errorMessage: message.length > 0 ? message[0] : null,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  //Note: Whenever a redirection happens a new request is generated and this request is independent of previous one.
  /**
   * Cookie should not be use to store sensitive information, as they can be modified.
   * res.setHeader('Set-Cookie', 'isLoggedIn=true; Expires="Date In Http Format" Max-Age="Time in seconds"
   * Domain="Domain to which the cookie should be snet"
   * Secure // Without any equal sign which means the cookie will be sent over to an HTTPS Request only.
   * HttpOnly // It means no one can modify this cookie value, Client Side Cannot access Cookie value');
   * res.setHeader('Set-Cookie', 'isLoggedIn=true');
   */
  //req.session.addAnyKeyYouWant;
  // req.session.isLoggedIn = true; // This is a way to store session locally in memory.
  //Its bad idea to store session in memory, due to security reasons and also due If there are many users the Production server
  // memory will get full.

  const email = req.body.email;
  const password = req.body.password;

  const user = req.user; // This user is fetched from the session middleware, which fetches user from MongoDB.
  console.log("User from Session Middleware: ", user);
  bcrypt
    .compare(password, user.password)
    .then((match) => {
      if (!match) {
        return res.render("auth/login", {
          pageTitle: "Login",
          path: Routes.LOGIN,
          isLoggedIn: false, //req.session.isLoggedIn,
          errorMessage: "Invalid Password",
          oldInput: {
            email: email,
            password: password,
          },
          validationErrors: [{ path: "password", msg: "Invalid Password" }],
        });
      }
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save((err) => {
        if (err) {
          console.log(err);
        }
        console.log("Reachable till here --->>>>>>>>>>> ");
        // Redirect happens fast so let session data be saved (by session store) than do the redirect.
        res.redirect(Routes.MAIN_INDEX);
      });
    })
    .catch((err) => {
      console.log("Error While Comparing Passwords : ", err);
      res.redirect(Routes.LOGIN);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("ERROR : ", err);
    }
    res.redirect(Routes.MAIN_INDEX);
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  res.render("auth/signup", {
    pageTitle: "SignUp",
    path: Routes.SIGNUP,
    isLoggedIn: req.session.isLoggedIn,
    errorMessage: message.length > 0 ? message[0] : null,
    oldInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationErrors: [],
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email.toLowerCase().trim(); // Normalize email manually
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  bcrypt
    .hash(password, 12)
    .then((hashPwd) => {
      const user = new User({
        email: email,
        password: hashPwd,
        cart: { items: [] },
      });
      return user.save();
    })
    .then((result) => {
      res.redirect(Routes.MAIN_INDEX);
      // transporter.sendMail({
      //   to: email,
      //   from: "mohitverma228@gmail.com",
      //   subject: "Signup Succeded!",
      //   html: "<h1>You Successfully signed up!</h1>",
      // });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500; // You can set custom error code here.
      next(error); // This will pass the error to the next middleware.
    });
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  res.render("auth/reset", {
    pageTitle: "Reset Password",
    path: Routes.RESET,
    isLoggedIn: false,
    errorMessage: message.length > 0 ? message[0] : null,
  });
};

exports.postReset = (req, res, next) => {
  const email = req.body.email;
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log("Error in Crypto Random Bytes :( ");
      return res.redirect(Routes.RESET);
    }

    //Have somedoubts
    //This token should corresponds to every single user that wants to generate a new password;
    const token = buffer.toString("hex");

    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          req.flash("error", "Email does not exists");
          return res.redirect(Routes.RESET);
        }

        user.resetToken = token;
        user.resetTokenExpirationDate = Date.now() + 3600000;
        return user.save();
      })
      .then((response) => {
        // transporter.sendMail({
        //   to: email,
        //   from: "mohitverma228@gmail.com",
        //   subject: "Reset Password Here!",
        //   html: `
        // <p>You requested a password reset</p>
        // <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password<p>
        // `,
        // });
        res.redirect(Routes.LOGIN);
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500; // You can set custom error code here.
        next(error); // This will pass the error to the next middleware.
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  let message = req.flash("error");
  const token = req.params.token;

  User.findOne({
    resetToken: token,
    resetTokenExpirationDate: { $gt: Date.now() },
  })
    .then((user) => {
      if (!user) {
        req.flash(
          "error",
          "Passowrd reset link has been expired, please intiate a new one."
        );
        return res.redirect(Routes.LOGIN);
      }
      res.render("auth/new-password", {
        pageTitle: "Update Password",
        path: Routes.NEWPASSWORD,
        isLoggedIn: false,
        errorMessage: message.length > 0 ? message[0] : null,
        userId: user._id.toString(),
        token: user.resetToken,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500; // You can set custom error code here.
      next(error); // This will pass the error to the next middleware.
    });
};

exports.postNewPassword = (req, res, next) => {
  const password1 = req.body.password;
  const password2 = req.body.confirmPassword;
  const userId = req.body.userId;
  const token = req.body.token;
  let resetUser = null;

  if (password1 !== password2) {
    return res.render("auth/new-password", {
      pageTitle: "Update Password",
      path: Routes.NEWPASSWORD,
      isLoggedIn: false,
      errorMessage: "Both the entered passwords are not matching", //message.length > 0 ? message[0] : null,
      userId: userId.toString(),
      token: token,
    });
  }

  User.findOne({
    _id: userId,
    resetToken: token,
    resetTokenExpirationDate: { $gt: Date.now() },
  })
    .then((user) => {
      resetUser = user;
      const hashPwd = bcrypt.hashSync(password1, 12);
      // resetUser.resetToken = undefined;
      // resetUser.resetTokenExpirationDate = undefined;
      resetUser.password = hashPwd;
      return resetUser.save();
    })
    .then((response) => {
      return res.redirect(Routes.LOGIN);
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500; // You can set custom error code here.
      next(error); // This will pass the error to the next middleware.
    });
};
