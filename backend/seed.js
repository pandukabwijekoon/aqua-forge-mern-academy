import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import CoachModel from './models/Coach.js';
import UserModel from './models/User.js';

dotenv.config();

const coaches = [
  {
    name: "Coach Dilshan Tennakoon",
    image: "/coaches/professional.png", // static asset from frontend/public/coaches/professional.png
    description: "Elite A-Squad Swimmer at Kingswood College, Kandy, and Lead Instructor at Stingrays Swimming Academy. Dilshan delivers high-performance personal coaching, specializing in technical stroke refinement and competitive speed endurance at the premium Capital Regency Hotel, Kandy.",
    expertise: ["Efficient stroke mechanics", "Stingrays Elite Instruction", "Personal Performance Prep"],
    experienceYears: 8,
    certificates: ["Kingswood College A-Squad Swimmer", "Stingrays Swimming Academy Instructor", "Capital Regency Hotel Head Personal Coach"],
    rating: 5.0,
    whatsappNumber: "94771014046", // Coach Dilshan's private Sri Lankan WhatsApp contact
    isCoachProfileVerified: true
  }
];

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding process...');
    
    // Connect to database (standard mongoose or local file detection)
    await connectDB();

    // 1. Seed Coach Profiles
    await CoachModel.deleteMany({});
    console.log('🧹 Cleared existing coach records.');

    const seededCoaches = await CoachModel.insertMany(coaches);
    console.log(`✅ Success! Seeded ${seededCoaches.length} Elite Coach Profiles.`);

    // 2. Seed Coach User Login Account (For permission-isolated Coach Control Board access)
    // Delete duplicate if exists
    await UserModel.deleteMany({ email: "dilshan@aquaforge.com" });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("dilshan123", salt);

    const coachUser = await UserModel.create({
      name: "Coach Dilshan Tennakoon", // Name matches Coach profile perfectly for permission isolation
      email: "dilshan@aquaforge.com",
      password: hashedPassword,
      role: "coach" // Sets role to coach to activate portal views
    });

    console.log(`👤 Seeded Coach User Login account: email: ${coachUser.email}, password: dilshan123`);
    console.log('🎉 Seeding successfully completed. Cloud and mock registries are synchronized.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding process encountered a fatal error:', error.message);
    process.exit(1);
  }
};

seedData();
