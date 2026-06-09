import mongoose from 'mongoose';
import { getDbMode } from '../config/db.js';
import { MockBooking } from '../config/mockDb.js';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  coach: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coach',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  timeSlot: {
    type: String,
    required: true,
  },
  lane: {
    type: Number,
    min: 1,
    max: 6,
    required: true,
  },
  priceLKR: {
    type: Number,
    required: true, // Must be recorded exclusively in LKR
  },
  status: {
    type: String,
    enum: ['Pending_Approval', 'Confirmed', 'Rejected'],
    default: 'Pending_Approval',
  },
  slipImageUrl: {
    type: String,
    default: '',
  },
  validationFlag: {
    type: String,
    enum: ['Validated', 'Flagged_Amount_Mismatch', 'Pending_OCR', 'None'],
    default: 'None',
  },
  qrCodeString: {
    type: String,
    default: null,
  },
  uploadedAt: {
    type: Date,
  },
  reviewedByCoachId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coach',
  },
  swimmerProfileId: {
    type: String,
    required: false,
  },
  swimmerName: {
    type: String,
    required: false,
  },
  swimmerType: {
    type: String,
    enum: ['Adult', 'Child'],
    required: false,
  },
  swimmerSkill: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Elite'],
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Production-Grade TTL Concurrency Lock Index: Automatically expires pending locks after 30 minutes
bookingSchema.index(
  { createdAt: 1 },
  { 
    expireAfterSeconds: 1800, 
    partialFilterExpression: { status: 'Pending_Approval' } 
  }
);

const RealBooking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

export const BookingModel = {
  find: (...args) => (getDbMode() ? MockBooking.find(...args) : RealBooking.find(...args)),
  findOne: (...args) => (getDbMode() ? MockBooking.findOne(...args) : RealBooking.findOne(...args)),
  findById: (...args) => (getDbMode() ? MockBooking.findById(...args) : RealBooking.findById(...args)),
  create: (...args) => (getDbMode() ? MockBooking.create(...args) : RealBooking.create(...args)),
  findByIdAndUpdate: (...args) => (getDbMode() ? MockBooking.findByIdAndUpdate(...args) : RealBooking.findByIdAndUpdate(...args)),
};

export default BookingModel;
