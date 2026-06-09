import express from 'express';
import { 
  initiateBooking, 
  initiateSecureBooking,
  uploadSlip, 
  getPendingBookings, 
  verifyBooking, 
  getMyBookings, 
  cancelBooking,
  getVerifiedHistory,
  getSchedulerView
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkBookingConflict } from '../middleware/conflictMiddleware.js';

const router = express.Router();

// All booking routes require JWT authentication
router.use(protect);

// Swimmer Routes
router.post('/initiate', checkBookingConflict, initiateBooking);
router.post('/secure-initiate', initiateSecureBooking);
router.post('/upload-slip/:bookingId', uploadSlip);
router.get('/my', getMyBookings);
router.get('/scheduler-view/:swimmerProfileId', getSchedulerView);
router.put('/:id/cancel', cancelBooking);

// Coach & Admin Routes (Protected permission checks executed inside controllers)
router.get('/pending', getPendingBookings);
router.get('/history', getVerifiedHistory);
router.put('/verify/:id', verifyBooking);

export default router;
