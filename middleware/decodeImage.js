const multer = require("multer");
const path = require("path");   

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    // console.log("File Details: ", file);
    cb(null, new Date().toISOString().replace(/:/g, '-') + "-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const decodeImage = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5 MB
  },
  fileFilter: fileFilter
}).single("image"); // 'image' is the name of the field in the form


module.exports = decodeImage;

// module.exports.decodeImage = (req, res, next) => {
//     if (!req.file) {
//         return res.status(400).send("No file uploaded.");
//     }
//     req.body.imageUrl = path.join("images", req.file.filename);
//     next();
// };
