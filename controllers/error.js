exports.get404 = (req, res, next) => {
  res
    .status(404)
    .render("404", {
      pageTitle: "Page Not Found",
      path: "/404",
      isLoggedIn: false,
    });
};

exports.get500 = (req, res, next) => {
  res
    .status(500)
    .render("500", {
      pageTitle: "Error Occurred",
      path: "/500",
      isLoggedIn: req.session.isLoggedIn,
    });
};
