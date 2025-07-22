// const Sequelize = require('sequelize');

// const sequelize = new Sequelize('node-complete', 'root', 'nodecomplete', {
//   dialect: 'mysql',
//   host: 'localhost'
// });

// module.exports = sequelize;

const MongoDB = require("mongodb");
const Mongoose = require("mongoose");
const MongoClient = MongoDB.MongoClient;

const DataBaseName = require("./constants").DataBaseName;

let _db = null;

const mongoConnect = (callBack) => {
  //Connect to MongoDB
  MongoClient.connect(
    `mongodb+srv://RootUser:RootUser%40900@nodecluster.2sll7.mongodb.net/${DataBaseName}?retryWrites=true&w=majority&appName=NodeCluster`
  )
    .then((client) => {
      console.log("Connected!!");
      // console.log(client);
      // console.log("DataBaseName: ", DataBaseName);
      _db = client.db(DataBaseName);
      // console.log("DB is: ", _db);
      callBack(client);
    })
    .catch((err) => {
      console.log("Error While Connecting :(");
      throw err;
    });
};

const mongooseConnect = (callBack) => {
  Mongoose.connect(
    `mongodb+srv://RootUser:RootUser%40900@nodecluster.2sll7.mongodb.net/${DataBaseName}?retryWrites=true&w=majority&appName=NodeCluster`
  ).then((res) => {
    console.log("Connected with Mongoose.");
    // console.log(res);
    callBack(res);
  }).catch(err => {
    console.log("Error While Connecting With Mongoose :( ");
    console.log(err);
  });
};

const getDb = () => {
  if (_db) return _db;
  throw "Database not found";
};

exports.mongoConnect = mongoConnect;
// exports.getDb = getDb;
exports.mongooseConnect = mongooseConnect;
