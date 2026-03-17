const express = require('express');
const mongoose = require('mongoose');
const serverless = require('serverless-http');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Sinkronkan koneksi MongoDB (Optimasi Serverless)
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI);
    isConnected = db.connections[0].readyState;
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Error:', err);
  }
};

// Model Definition
const weatherSchema = new mongoose.Schema({
  city: { type: String, required: true },
  country: String,
  temperature: Number,
  description: String,
  icon: String,
  createdAt: { type: Date, default: Date.now }
});

const WeatherData = mongoose.model('WeatherData', weatherSchema);

// Route API
app.post('/api/weather', async (req, res) => {
  await connectDB(); // Pastikan koneksi DB nyala sebelum query
  try {
    const { city, country, temperature, description, icon } = req.body;
    const weatherData = new WeatherData({ city, country, temperature, description, icon });
    await weatherData.save();

    res.json({
      message: 'Weather data saved successfully',
      data: weatherData
    });
  } catch (error) {
    console.error('Error saving:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Netlify tidak butuh app.listen, tapi kita biarkan kondisional untuk local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = 5000;
  app.listen(PORT, () => console.log(`🚀 Local server on port ${PORT}`));
}

// Export handler untuk Netlify
module.exports = app;
module.exports.handler = serverless(app);