const MongoDB = require("mongodb");
const Mongoose = require("mongoose");
const { getObjectForModelFields } = require("../util/constants");
const { Order } = require("./order");

// const getDb = require("../util/database").getDb;
const CollectionNames = require("../util/constants").CollectionNames;

const UserSchema = new Mongoose.Schema({
  email: getObjectForModelFields(String),
  password: getObjectForModelFields(String),
  resetToken: String,
  resetTokenExpirationDate: Date,
  cart: {
    items: [
      {
        productId: {
          ...getObjectForModelFields(Mongoose.Schema.Types.ObjectId),
          ref: CollectionNames.Products,
        },
        quantity: getObjectForModelFields(Number),
      },
    ],
  },
});

UserSchema.methods.addToCart = function (productId) {
  let productIndex = -1;
  if (this.cart?.items?.length > 0) {
    productIndex = this.cart.items.findIndex(
      (item) => item.productId.toString() == productId.toString()
    );
  }
  let qty = 1;
  // console.log("Product Index is :=> ", productIndex);
  if (productIndex != -1) {
    qty = this.cart.items[productIndex].quantity + 1;
    this.cart.items[productIndex].quantity = qty;
  } else {
    this.cart.items.push({ productId: productId, quantity: qty });
  }

  return this.save();
};

UserSchema.methods.getCart = function () {
  return this.populate("cart.items.productId")
    .then((user) => {
      console.log("The resultis -->>> ");
      console.log(user.cart.items);
      return user.cart.items.map((item) => ({
        _id: item.productId._id,
        title: item.productId.title,
        price: item.productId.price,
        imageUrl: item.productId.imageUrl,
        description: item.productId.description,
        quantity: item.quantity,
      }));
    })
    .catch((err) => {
      console.log("ERR : ", err);
    });
};

UserSchema.methods.deleteFromCart = function (productId) {
  console.log("Product Id : ", productId);
  this.cart.items = this.cart.items.filter(
    (item) => item.productId.toString() != productId.toString()
  );
  return this.save();
};

UserSchema.methods.createOrder = function () {
  return this.getCart().then((products) => {
    const order = new Order({
      products: products,
      user: {
        userId: this._id,
        // name: this.name,
        email: this.email,
      },
    });

    this.cart.items = [];
    return this.save().then((res) => {
      console.log("Order is created -------->>>>>>>>>>>>>>>>>>>>>>>> ", res);
      return order.save();
    });
  });
};

UserSchema.methods.getOrders = function () {
  return Order.find({ "user.userId": this._id }).then(res => {
    console.log("Orders are fetched ->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ", res);
    return res;
  }).catch(err => {
    console.log("Error while fetching Orders: ", err);
  });
};

exports.User = Mongoose.model(CollectionNames.User, UserSchema);

// class User {
//   constructor(userName, email, cart, _id) {
//     this.name = userName;
//     this.email = email;
//     this.cart = cart ? cart : { items: [] }; //{items: [Pid, Quantity]}
//     this._id = _id;
//   }

//   save() {
//     const db = getDb();
//     return db
//       .collection(CollectionNames.User)
//       .insertOne(this)
//       .then((res) => {
//         console.log("User Inserted :) ", res);
//         return res;
//       })
//       .catch((err) => {
//         console.log("ERR : ", err);
//       });
//   }

//   addToCart(productId) {
//     productId = new MongoDB.ObjectId(productId);
//     let productIndex = -1;
//     if (this.cart?.items?.length > 0) {
//       productIndex = this.cart.items.findIndex(
//         (item) => item.productId.toString() == productId.toString()
//       );
//     }
//     let qty = 1;
//     // console.log("Product Index is :=> ", productIndex);
//     if (productIndex != -1) {
//       qty = this.cart.items[productIndex].quantity + 1;
//       this.cart.items[productIndex].quantity = qty;
//     } else {
//       this.cart.items.push({ productId: productId, quantity: qty });
//     }

//     const db = getDb();
//     return db
//       .collection(CollectionNames.User)
//       .updateOne({ _id: this._id }, { $set: { cart: this.cart } })
//       .then((res) => {
//         console.log(
//           "The User Collection was updated ------------------------------------------------- ",
//           res
//         );
//         return res;
//       })
//       .catch((err) => {
//         console.log("Error While updating inside user modeles : ", err);
//       });
//   }

//   getCart() {
//     const qtyCount = {};
//     const productIndexes = this.cart.items.map((item) => {
//       qtyCount[`${item.productId.toString()}`] = item.quantity;
//       return item.productId;
//     });

//     const db = getDb();
//     /**
//      * There Can be times when Cart has some products and the products that you have fetched below may mismatched in
//      * length, so that you can run worker threads on your server. Although it is already handled in below code.
//      * Another Work around can be that the moment you found that there is a difference between there lengths, than
//      * reset your cart.
//      */
//     return db
//       .collection(CollectionNames.Products)
//       .find({ _id: { $in: productIndexes } })
//       .toArray()
//       .then((products) => {
//         return products.map((item) => {
//           return {
//             ...item,
//             quantity: qtyCount[item._id.toString()],
//           };
//         });
//       })
//       .catch((err) => {
//         console.log("ERR: ", err);
//       });
//   }

//   deleteFromCart(productId) {
//     productId = new MongoDB.ObjectId(productId);
//     this.cart.items = this.cart.items.filter(
//       (item) => item.productId.toString() != productId.toString()
//     );
//     const db = getDb();

//     return db
//       .collection(CollectionNames.User)
//       .updateOne({ _id: this._id }, { $set: { cart: this.cart } })
//       .then((res) => {
//         console.log(
//           "The Cart was updated ---------------------------------------- ",
//           res
//         );
//         return res;
//       })
//       .catch((err) => {
//         console.log("ERROR while updating cart : ", err);
//       });
//   }

//   createOrder() {
//     const db = getDb();
//     return this.getCart().then((products) => {
//       const order = {
//         products: products,
//         user: {
//           _id: this._id,
//           name: this.name,
//           email: this.email,
//         },
//       };
//       return db
//         .collection(CollectionNames.User)
//         .updateOne({ _id: this._id }, { $set: { cart: { items: [] } } })
//         .then((res) => {
//           console.log("User Cart has also been updated :) ");
//           return db
//             .collection(CollectionNames.Orders)
//             .insertOne(order)
//             .then((res) => {
//               console.log("Order is created : ", res);
//               return res;
//             });
//         })
//         .catch((err) => {
//           console.log("ERR : ", err);
//         });
//     });
//   }

//   getOrders() {
//     const db = getDb();
//     return db
//       .collection(CollectionNames.Orders)
//       .find()
//       .toArray()
//       .then((orders) => {
//         console.log("Orders Fetched : ", orders);
//         return orders;
//       })
//       .catch((err) => {
//         console.log("ERR : ", err);
//       });
//   }

//   static findById(userId) {
//     const db = getDb();
//     return db
//       .collection(CollectionNames.User)
//       .findOne({
//         _id: new MongoDB.ObjectId(userId),
//       })
//       .then((res) => {
//         console.log(
//           "The response received is : ------------------------------->>>> ",
//           res
//         );
//         return res;
//       })
//       .catch((err) => {
//         console.log("ERR : ", err);
//       });
//   }
// }

// module.exports = User;
