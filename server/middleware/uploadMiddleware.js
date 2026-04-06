import multer from "multer";
import path from "path";
import fs from "fs";

// Storage Configuration
const storage = multer.diskStorage({
  destination(req, file, cb) {
    let uploadPath = "uploads/general/";
    
    // Determine folder dynamically based on fieldname
    if (file.fieldname === "vehicleImage") {
      uploadPath = "uploads/vehicle-images/";
    } else if (file.fieldname === "serviceDocument") {
      uploadPath = "uploads/service-documents/";
    }

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|pdf/i;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb("Images and PDFs only!");
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

export { upload };
