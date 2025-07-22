exports.DataBaseName = "Shop";

exports.CollectionNames = {
    Products: "products",
    User: "users",
    Orders: "orders",
    Session: "sessions",
}

exports.getObjectForModelFields = (type, required = true) => {
  return {
    type: type,
    required: required,
  }
}
