require('dotenv').config();

const express = require('express')
const axios = require('axios')
const redis = require('redis');
const rateLimit = require('express-rate-limit');

const app = express()

const redisClient = redis.createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
})

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false
})

redisClient.on('connect', () => {
  console.log('Connected a Redis')
})

redisClient.on('error', (err) => {
  console.error('Error en Redis:', err)
})

app.use(limiter)

app.get('/weather/:city', async (req, res) => {
  const city = req.params.city.toLowerCase()

  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }

    const data = await redisClient.get(city)
    if(data) {
      return res.json({ source: 'cache', data: JSON.parse(data) })
    }
    
    const apikey = process.env.API_KEY

    try {
      const response = await axios.get(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=us&key=${apikey}`)
      
      const weatherData = response.data

      redisClient.setEx(city, 43200, JSON.stringify(weatherData))

      return res.json({ source: 'api', data: weatherData})
    } catch(apiError) {

      if(apiError.response) {
        // Error responses from the API (e.g., 404 Not Found)
        const statusCode = apiError.response.status
        const errorMessage = apiError.response.data?.message || 'Error fetching weather data'
        return res
          .status(statusCode)
          .json({ error: `API error: ${errorMessage}` })
      } else {
        // Network or other unexpected errors
        return res.status(500).json({ error: 'Failed to fetch weather data' })
      }
    }
  } catch(error) {
    // General error handling for Redis or other issues
    res.status(500).json({error: error.message})
  }
})

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Weather API running on port ${PORT}`)
})