import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Arahkan ke frontend/public/img/mitra
const uploadDirMitra = path.join(__dirname, '../../frontend/public/img/mitra');
const uploadDirAvatar = path.join(__dirname, '../../frontend/public/img/avatars');

// Ensure directories exist
if (!fs.existsSync(uploadDirMitra)) {
  fs.mkdirSync(uploadDirMitra, { recursive: true });
}
if (!fs.existsSync(uploadDirAvatar)) {
  fs.mkdirSync(uploadDirAvatar, { recursive: true });
}

const mitraStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirMitra);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'mitra-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirAvatar);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diizinkan!'), false);
  }
};

export const uploadMitraPhoto = multer({ 
  storage: mitraStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

export const uploadAvatar = multer({ 
  storage: avatarStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit for avatars
  }
});

