

// server.js
const express = require('express');
const { google } = require('googleapis');
const { validateEnv } = require('./config/env');
const cors = require("cors");

// Routes
const authRoutes = require('./Router/auth');

///// Curing //////////
const Fullkitting = require('./All_PMS_APIs/Curing/Fullkitting')
///// casting
const FullkittingCasting = require('./All_PMS_APIs/Casting/fullkittingCasting')

//// waterProffing 
const waterProffing = require('./All_PMS_APIs/WaterProofing/Fullkitting') 

///// BrickWork 

const BrickWork = require('./All_PMS_APIs/BrickWork/Brickwork')
////// electrical

const Electrical = require('./All_PMS_APIs/Electrical/FullKitting')

/////  labour

const Labour = require('./Labour/Attendance')

const app = express();
// 1. CORS (Pehle daalo)
app.use(cors({
  origin: process.env.CLIENT_URL || '*', // Ya 'http://localhost:3000'
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 2. Body Parsing (Sirf Ek Baar + 10MB Limit)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Handle OPTIONS Preflight (Safe & Working)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }
  next();
});

// 4. Validate Environment
validateEnv();


app.use('/api', authRoutes);

/////// Curing ///// 
app.use('/api',Fullkitting)

////// casting ///

app.use('/api',FullkittingCasting)

///// WaterProffing

app.use('/api/water',waterProffing)

///// Brick work 

app.use('/api/Bricks',BrickWork)

/////// Electrical

app.use('/api/electrical',Electrical)

/////// labour api 

app.use('/api',Labour)

// 7. Health Check
app.get('/', (req, res) => {
  res.json({ message: 'FMS Backend Running!', time: new Date().toISOString() });
});

// 8. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`CORS enabled for: ${process.env.CLIENT_URL || 'all origins'}`);
});

