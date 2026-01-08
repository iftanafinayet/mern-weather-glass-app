const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://fincaanaya:Basketismylife123@cluster0.1cad5ok.mongodb.net/weatherforecast?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ⭐ MODEL DEFINITION - SEBELUM ROUTE ⭐
const weatherSchema = new mongoose.Schema({
  city: { type: String, required: true },
  country: String,
  temperature: Number,
  description: String,
  icon: String,
  createdAt: { type: Date, default: Date.now }
});

const WeatherData = mongoose.model('WeatherData', weatherSchema);

// ⭐ ROUTE - SETELAH MODEL ⭐
app.post('/api/weather', async (req, res) => {
  try {
    const { city, country, temperature, description, icon } = req.body;
    
    const weatherData = new WeatherData({
      city,
      country,
      temperature,
      description,
      icon
    });
    
    await weatherData.save();
    
    res.json({ 
      message: 'Weather data saved successfully',
      data: weatherData 
    });
  } catch (error) {
    console.error('Error saving weather data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
