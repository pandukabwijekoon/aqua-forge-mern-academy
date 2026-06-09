import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getDbMode } from './config/db.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import coachRoutes from './routes/coachRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import profileRoutes from './routes/profileRoutes.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*', // Allow all origins for seamless development proxying
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Statically Serve bank transaction receipts uploader folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Bind API Routes
app.use('/api/auth', authRoutes);
app.use('/api/coaches', coachRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/profiles', profileRoutes);

// Base Route for Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    system: 'Aqua Forge Backend Server',
    dbMode: getDbMode() ? 'Local Mock (High-Reliability File Fallback)' : 'MongoDB Atlas / Standalone',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  res.status(500).json({
    success: false,
    message: 'An internal server error occurred in the Aqua Forge cluster.',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Initialize Database & Start Server
const startServer = async () => {
  const dbStatus = await connectDB();
  
  app.listen(PORT, () => {
    console.log('\n======================================================');
    console.log(`⚡ AQUA FORGE BACKEND SERVER IS ONLINE & OPERATIONAL`);
    console.log(`📡 Port Triggered: http://localhost:${PORT}`);
    console.log(`🗃️ Database Layer: ${dbStatus.useMockDb ? 'LOCAL FILE BACKUP (aquaforge_db.json)' : 'LIVE MONGODB CONNECTION'}`);
    console.log('======================================================\n');
  });
};

startServer();
