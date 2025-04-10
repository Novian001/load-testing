const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  vus: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  rampUpTime: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  results: {
    responseTime: [Number],
    errorRate: Number,
    throughput: Number,
    status: String,
    performanceMetrics: {
      avgResponseTime: Number,
      maxResponseTime: Number,
      minResponseTime: Number,
      lagThreshold: {
        responseTime: { type: Number, default: 1000 }, // ms threshold for lag
        concurrentUsers: Number, // number of users when lag occurred
        timestamp: Date
      },
      userBreakpoints: [{
        users: Number,
        avgResponseTime: Number,
        timestamp: Date,
        status: {
          type: String,
          enum: ['normal', 'warning', 'critical'],
          default: 'normal'
        }
      }]
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Test', testSchema);