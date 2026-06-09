import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { registerProfile, getProfiles, updateProfile } from '../controllers/profileController.js';

const router = express.Router();

// All sub-profile operations require a logged-in User Account session
router.use(protect);

router.post('/register', registerProfile);
router.get('/', getProfiles);
router.put('/update/:profileId', updateProfile);

export default router;

