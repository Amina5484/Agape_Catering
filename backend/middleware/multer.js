import multer from "multer";
import path from "path";
import crypto from "crypto"; 

// Set storage for uploaded images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Ensure this directory exists
    },
    filename: (req, file, cb) => {
        // Generate a unique filename
        const uniqueSuffix = Date.now() + "-" + crypto.randomBytes(4).toString("hex");
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

// Filter file types (allow only images)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only images are allowed"), false);
    }
};

export const upload = multer({ storage, fileFilter });
