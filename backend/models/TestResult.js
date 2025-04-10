const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  responseTime: { type: Number, required: true },
  status: { type: Number, required: true },
  activeVUs: { type: Number, required: true },
  testType: { type: String, required: true },
  url: { type: String, required: true },
  error: String,
  throughput: Number,
  loadFactor: Number,
  errorRate: Number,
  memoryUsage: Number,
  breakpointFound: Boolean,
  breakpointVUs: Number,
  vus: { type: Number, required: true },
  duration: { type: Number, required: true },
  iteration: Number,
  testConfig: {
    url: String,
    vus: Number,
    duration: Number
  },
  ttfb: Number,
  connectTime: Number,
  dnsTime: Number
}, { 
    timestamps: true ,
    collection: 'testResults' 
});

module.exports = mongoose.model('TestResult', testResultSchema);