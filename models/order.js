const Mongoose = require('mongoose');
const { CollectionNames, getObjectForModelFields } = require('../util/constants');


const OrderSchema = new Mongoose.Schema({
  user: {
    // name: getObjectForModelFields(String),
    email: getObjectForModelFields(String),
    userId: {
      ...getObjectForModelFields(Mongoose.Schema.Types.ObjectId),
      ref: CollectionNames.User,
    }
  },
  products: [getObjectForModelFields(Object)]
});

exports.Order = new Mongoose.model(CollectionNames.Orders, OrderSchema);


