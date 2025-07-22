const Routes = require("../util/Routes");

const isAuthenticatedMiddleware = (req, res, next) => {
    if(!req.session.isLoggedIn) {
       return res.redirect(Routes.LOGIN); 
    }
    next();
};

module.exports = isAuthenticatedMiddleware;