/* ============================================================
   FlatMatch — authRoutes.js (DEPLOYMENT-PROOF avatar upload)
   ------------------------------------------------------------
   WHY this version:
     `req.protocol://req.get('host')` BREAKS in production
     (behind nginx / load balancer / Render / Railway) because
     it returns http + internal host instead of the real domain.

   THIS version uses an explicit BACKEND_URL env var first,
     and only falls back to req.protocol/host in local dev.
   ============================================================ */

const express = require('express');
const fs = require('fs');
const path = require('path');
const { register, login, logout, getMe, updateMe,} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const User = require('../models/User');

const router = express.Router();

/* 🔑 Helper — always returns the CORRECT backend base URL.
   - Production: set BACKEND_URL in .env  (e.g. https://flatmatch-api.onrender.com)
   - Local dev : falls back to req.protocol://req.get('host) automatically          */
function backendBaseUrl(req) {
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL.replace(/\/$/, ''); // trim trailing slash
  return `${req.protocol}://${req.get('host')}`;
}

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);

/* PUT /api/auth/me/avatar — profile photo upload (deployment-safe) */
router.put('/me/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Folder where avatars live (created if missing)
    const avatarsDir = path.join(__dirname, '..', 'public', 'avatars');
    if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });

    // Build a unique filename
    const ext = (req.file.originalname.split('.').pop() || 'jpg').toLowerCase();
    const filename = `avatar-${req.user._id}-${Date.now()}.${ext}`;
    const filePath = path.join(avatarsDir, filename);

    // memoryStorage → req.file.buffer; write it to disk
    fs.writeFileSync(filePath, req.file.buffer);

    // 🔑 Deployment-proof full URL
    const avatarUrl = `${backendBaseUrl(req)}/avatars/${filename}`;

    // Save URL on the user + delete the OLD avatar file (if it was ours)
    const user = await User.findById(req.user._id);
    if (user.avatar && user.avatar.includes('/avatars/')) {
      const oldFile = user.avatar.split('/avatars/').pop();
      const oldPath = path.join(avatarsDir, oldFile);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    user.avatar = avatarUrl;
    await user.save();

    return res.json({ user });
  } catch (err) {
    console.error('Avatar upload error:', err);
    return res.status(500).json({ message: err.message || 'Avatar upload failed' });
  }
});

module.exports = router;
