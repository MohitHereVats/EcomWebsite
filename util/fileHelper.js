const fs = require("fs");

exports.deleteFile = (filePath) => {
  console.log("Deleting file:", filePath);  
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
      throw err;
    } else {
      console.log("File deleted successfully:", filePath);
    }
  });
};
