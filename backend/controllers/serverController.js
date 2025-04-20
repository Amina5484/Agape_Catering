import express from 'express';
import os from 'os';

const serverHealth = express.Router();

// Initialize payment
serverHealth.get('/',  async (req, res) => {
    const healthStatus = {
        status: "UP",
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        cpuLoad: os.loadavg(),
        freeMemory: os.freemem(),
        totalMemory: os.totalmem(),
        timestamp: new Date(),
    };
    
    res.status(200).json(healthStatus);
  });


export default serverHealth;