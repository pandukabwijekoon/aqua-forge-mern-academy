import mongoose from 'mongoose';
import { getDbMode } from '../config/db.js';
import { MockUser } from '../config/mockDb.js';

const swimmerProfileSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  swimmerType: {
    type: String,
    enum: ['Adult', 'Child'],
    required: [true, 'Swimmer type is required'],
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
  },
  skillLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Elite'],
    required: [true, 'Skill level is required'],
  },
  medicalDeclarations: {
    type: String,
    default: '',
  },
  guardianName: String,
  guardianContact: String,
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please fill a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
  },
  role: {
    type: String,
    enum: ['swimmer', 'coach', 'admin'],
    default: 'swimmer',
  },
  profiles: [swimmerProfileSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const RealUser = mongoose.models.User || mongoose.model('User', userSchema);

// Dynamic proxy class to choose between Real Mongoose and File Mock
export const UserModel = {
  find: (...args) => (getDbMode() ? MockUser.find(...args) : RealUser.find(...args)),
  findOne: (...args) => (getDbMode() ? MockUser.findOne(...args) : RealUser.findOne(...args)),
  findById: (...args) => (getDbMode() ? MockUser.findById(...args) : RealUser.findById(...args)),
  create: (...args) => (getDbMode() ? MockUser.create(...args) : RealUser.create(...args)),
  deleteMany: (...args) => (getDbMode() ? MockUser.deleteMany(...args) : RealUser.deleteMany(...args)),
  findByIdAndUpdate: (...args) => (getDbMode() ? MockUser.findByIdAndUpdate(...args) : RealUser.findByIdAndUpdate(...args)),
};

export default UserModel;
