// const getDb = require("../util/database").getDb;
const MongoDB = require('mongodb')
const Mongoose = require('mongoose');
const { DataBaseName, CollectionNames, getObjectForModelFields } = require('../util/constants');

const ProductSchema = new Mongoose.Schema({
  title: getObjectForModelFields(String),
  price: getObjectForModelFields(Number),
  description: getObjectForModelFields(String),
  imageUrl: getObjectForModelFields(String),
  userId: {
    ...getObjectForModelFields(Mongoose.Schema.Types.ObjectId),
    ref: CollectionNames.User,
  }
});

exports.Product = Mongoose.model(CollectionNames.Products, ProductSchema);

// class Product {
//   constructor(title, price, description, imageUrl, _id, userId) {
//     this.title = title;
//     this.price = price;
//     this.description = description;
//     this.imageUrl = imageUrl;
//     this._id = _id ? new MongoDB.ObjectId(_id) : null;
//     this.userId = userId;
//   }

//   save() {
//     const db = getDb();
//     console.log("Inserting the product with ID: ", this._id);
//     return db.collection("products")
//       .insertOne(this)
//       .then((res) => {
//         console.log("Hii There,Product Inserted :)");
//         console.log(res);
//         // console.log("The result after adding the Object is --------------------------------------- ",res);
//         return res;
//       })
//       .catch((err) => {
//         console.log("Error while inserting the data ---------------------------------------------- ",err);
//       });
//   }

//   update() {
//     const db = getDb();
//     return db.collection("products").updateOne({_id: this._id}, {$set: this}).then(res => {
//       console.log("The Products is updated and the result is ------>>>>>>>>>>>>>>>>>>>> ");
//       console.log(res);
//       return res;
//     }).catch(err => {
//       console.log("ERROR While Updating Product : ", err);
//     })
//   }

//   static fecthAll(){
//     const db = getDb();
//     /*
//       db.collection('products').find() -> This line returns a reference to all the object, than you have to convert it to array
//       For thousands of collections don't convert all of them to array in that case implement pagination.
//     */
//     return db.collection('products').find().toArray().then(res => {
//       // console.log("The Products are fetched --------------------------------------------------------------- ");
//       // console.log(res);
//       return res;
//     }).catch(err => {
//       console.log("Error While Fetching Data :( ", err);
//     })
//   }

//   static findById(prodId) {
//     const db = getDb();
//     return db.collection('products').find({
//       _id: new MongoDB.ObjectId(prodId)
//     }).next().then(res => {
//       console.log("The response of Id is: ", res);
//       return res;
//     }).catch(err => {
//       console.log("ERR : ", err);
//     })
//   }

//   static delete(prodId) {
//     const db = getDb();
//     return db.collection('products').deleteOne({ _id: new MongoDB.ObjectId(prodId) }).then(res => {
//       console.log("Product Deleted : ", res);
//       return res;
//     }).catch(err => {
//       console.log("ERROR : ", err);
//     })
//   }
// }

// module.exports = Product;
