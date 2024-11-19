# Weather API

This project builds a weather API that fetches and returns weather data from a 3rd-party API instead of relying on custom data.
https://roadmap.sh/projects/weather-api-wrapper-service

## Technologies Used

- Back-end: Nodejs and Express.
- Cache: Redis and express-rate-limit for rate limiting.

## Installation 

1. Clone the repository, navigate to the project directory, and install dependencies:
```bash
git clone https://github.com/your-username/personal-blog-admin.git
cd personal-blog
npm install
```

2. Run the application:
```bash
npm start // By default, the application runs on localhost:3000
```

## Usage

- To get weather data for a specific city, open your browser and go to /weather/{city-name}. For example:
```bash
localhost:3000/weather/newyork
```
The API returns the weather data in JSON format.
