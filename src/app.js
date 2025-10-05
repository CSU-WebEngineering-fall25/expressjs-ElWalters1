const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const comicsRouter = require('./routes/comics');
const loggingMiddleware = require('./middleware/logging');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// TODO: Implement stats tracking object
let stats = {
  totalRequests: 0,
  endpointStats: {},
  startTime: Date.now()
};

// Security and parsing middleware
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later' }
});
app.use('/api', limiter);

// Custom middleware
app.use(loggingMiddleware);

const statsMiddleware = (req, res, next) => {
  stats.totalRequests += 1;
  if (!stats.endpointStats[req.path]) {
    stats.endpointStats[req.path] = 0;      
  } 
  stats.endpointStats[req.path] ++;
  next();
};
app.use(statsMiddleware);


app.use('/api/comics', comicsRouter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// TODO: Implement /api/stats endpoint
app.get('/api/stats', (req, res) => {
  const uptime = Math.floor((new Date() - stats.startTime) / 1000);
  res.status(200).json({
    totalRequests: totalRequests,
    uptime: uptime,
    endpointStats: endpointStats
  });   
});


// 404 handler for API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;