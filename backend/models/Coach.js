import mongoose from 'mongoose';
import { getDbMode } from '../config/db.js';
import { MockCoach } from '../config/mockDb.js';

const coachSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Coach name is required'],
    trim: true,
  },
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  expertise: {
    type: [String],
    default: [],
  },
  experienceYears: {
    type: Number,
    required: true,
  },
  certificates: {
    type: [String],
    default: [],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5,
  },
  whatsappNumber: {
    type: String,
    default: '',
  },
  isCoachProfileVerified: {
    type: Boolean,
    default: false,
  },
});

const RealCoach = mongoose.models.Coach || mongoose.model('Coach', coachSchema);

export const CoachModel = {
  find: (...args) => (getDbMode() ? MockCoach.find(...args) : RealCoach.find(...args)),
  findOne: (...args) => (getDbMode() ? MockCoach.findOne(...args) : RealCoach.findOne(...args)),
  findById: (...args) => (getDbMode() ? MockCoach.findById(...args) : RealCoach.findById(...args)),
  create: (...args) => (getDbMode() ? MockCoach.create(...args) : RealCoach.create(...args)),
  insertMany: (...args) => (getDbMode() ? MockCoach.insertMany(...args) : RealCoach.insertMany(...args)),
  deleteMany: (...args) => (getDbMode() ? MockCoach.deleteMany(...args) : RealCoach.deleteMany(...args)),
};

export default CoachModel;
