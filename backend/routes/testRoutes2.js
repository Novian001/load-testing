const express = require('express');
const router = express.Router();
const TestResult = require('../models/TestResult');
const fs = require('fs');
const path = require('path');
// Load real users data
const users = JSON.parse(fs.readFileSync(path.join(__dirname, '../users.json')));

const VALID_TEST_TYPES = [
  'smoke',
  'average-load',
  'breakpoint',
  'stress',
  'soak',
  'spike'
];

router.post('/', async (req, res) => {
  try {
    const { url, vus, duration, selectedTests } = req.body;

    // Add test type validation
    const invalidTestTypes = Object.keys(selectedTests).filter(
      type => selectedTests[type] && !VALID_TEST_TYPES.includes(type)
    );

    if (invalidTestTypes.length > 0) {
      return res.status(400).json({ 
        message: `Invalid test types: ${invalidTestTypes.join(', ')}` 
      });
    }

    // Validate required fields
    if (!url || !vus || !duration || !selectedTests) {
      return res.status(400).json({ 
        message: 'Missing required fields: url, vus, duration, and selectedTests are required' 
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid URL format' });
    }

    // Validate numeric values
    if (typeof vus !== 'number' || vus < 1) {
      return res.status(400).json({ message: 'Virtual users (vus) must be a positive number' });
    }

    if (typeof duration !== 'number' || duration < 1) {
      return res.status(400).json({ message: 'Duration must be a positive number' });
    }

    // Validate that at least one test is selected
    if (!Object.values(selectedTests).some(value => value === true)) {
      return res.status(400).json({ message: 'No tests selected' });
    }

    const intervals = {};
    const io = req.app.get('io');
    
    // Add connection check
    if (!io) {
      throw new Error('Socket.IO instance not found');
    }

    // Modified test execution
    const startTests = async () => {
      for (const [testType, isSelected] of Object.entries(selectedTests)) {
        if (isSelected) {
          try {
            const testInterval = await startTest(testType, url, vus, duration, io);
            intervals[testType] = testInterval;
          } catch (error) {
            console.error(`Error starting ${testType} test:`, error);
            io.emit('testError', {
              testType,
              error: error.message
            });
          }
        }
      }
    };

    // Start tests and handle completion
    startTests();

    // Modified test completion handler
    const stopTests = () => {
      Object.entries(intervals).forEach(([testType, interval]) => {
        clearInterval(interval);
        io.emit('testComplete', {
          testType,
          message: `${testType} test completed`
        });
      });

      io.emit('testsComplete', {
        message: 'All tests completed',
        duration,
        selectedTests
      });
    };

    // Use Promise.race to handle timeout
    const testTimeout = new Promise((_, reject) => {
      setTimeout(() => {
        stopTests();
        reject(new Error('Test execution timeout'));
      }, duration * 1000 + 5000); // Add 5 seconds buffer
    });

    // Send immediate response
    res.json({
      message: 'Tests started successfully',
      selectedTests,
      configuration: { url, vus, duration }
    });

  } catch (error) {
    console.error('Test execution error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Dalam fungsi startTest, update emit untuk menyimpan data:
async function startTest(testType, url, vus, duration, io) {
  let interval;
  let currentVUs = 0;
  const maxVUs = vus;

  switch (testType) {
    case 'smoke':
      interval = setInterval(async () => {
        const baseLatency = 50;
        const randomVariation = Math.random() * 50;
        
        const testData = {
          timestamp: new Date().toISOString(),
          responseTime: baseLatency + randomVariation,
          status: 200,
          activeVUs: Math.min(5, maxVUs),
          testType: 'Smoke Test',
          throughput: Math.floor(Math.random() * 10) + 1,
          url: url,
          vus: maxVUs,
          duration: duration
        };
    
        try {
          const testResult = new TestResult(testData);
          const savedResult = await testResult.save();
          console.log('Smoke test data saved:', savedResult._id);
          io.emit('testUpdate', testData);
        } catch (error) {
          console.error('Error in smoke test:', error);
        }
      }, 1000);
      return interval;

    case 'average-load':
      interval = setInterval(async () => {
        const timeOfDay = (Date.now() % 86400000) / 3600000;
        const peakHours = Math.sin((timeOfDay - 12) * Math.PI / 12) + 1;
        const currentLoad = Math.floor(maxVUs * (0.4 + (0.6 * peakHours)));
        
        const testData = {
          timestamp: new Date().toISOString(),
          responseTime: 100 + (currentLoad * 0.5) + (Math.random() * 100),
          status: currentLoad > maxVUs * 0.8 ? (Math.random() > 0.95 ? 503 : 200) : 200,
          activeVUs: currentLoad,
          testType: 'average-load', // Changed from 'Average Load Test' to match VALID_TEST_TYPES
          loadFactor: (currentLoad / maxVUs * 100).toFixed(1),
          url: url,
          vus: maxVUs,
          duration: duration
        };
    
        try {
          const testResult = new TestResult(testData);
          const savedResult = await testResult.save();
          console.log('Average load test data saved:', savedResult._id);
          io.emit('testUpdate', testData);
        } catch (error) {
          console.error('Error in average load test:', error);
        }
      }, 1000);
      return interval;

    case 'breakpoint':
      let breakpointFound = false;
      let consecutiveErrors = 0;
      interval = setInterval(async () => {
        if (!breakpointFound) {
          currentVUs += Math.ceil(maxVUs * 0.05);
        }
        
        const responseTime = 100 + (currentVUs * 3);
        const isError = responseTime > 2000 || currentVUs > maxVUs * 1.5;
        
        if (isError) {
          consecutiveErrors++;
          if (consecutiveErrors >= 5 && !breakpointFound) {
            breakpointFound = true;
            console.log(`Breakpoint found at ${currentVUs} VUs`);
          }
        } else {
          consecutiveErrors = 0;
        }
        
        const testData = {
          timestamp: new Date().toISOString(),
          responseTime: responseTime,
          status: isError ? 503 : 200,
          activeVUs: currentVUs,
          testType: 'Breakpoint Test', // Ubah kembali ke format yang sesuai dengan frontend
          breakpointFound: breakpointFound,
          breakpointVUs: breakpointFound ? currentVUs : null,
          url: url,
          vus: maxVUs,
          duration: duration
        };
    
        try {
          const testResult = new TestResult(testData);
          await testResult.save();
          io.emit('testUpdate', testData); // Pastikan data dikirim ke frontend
          console.log('Breakpoint test data emitted:', testData.activeVUs); // Tambah logging
        } catch (error) {
          console.error('Error in breakpoint test:', error);
        }
      }, 1000);
      return interval;

    case 'stress':
      interval = setInterval(async () => {
        try {
          currentVUs = Math.min(currentVUs + Math.ceil(maxVUs * 0.1), maxVUs);
          
          // Get subset of real users based on current VUs
          const activeUsers = users.slice(0, currentVUs);
          
          const startTime = Date.now();
          const requests = activeUsers.map(async (user) => {
            try {
              // Login with real user
              const loginResponse = await fetch(url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  username: user.username,
                  password: user.password
                })
              });

              if (!loginResponse.ok) {
                return { error: 'Login failed' };
              }

              const { token } = await loginResponse.json();

              // Access the target URL with auth token
              return fetch(url, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'User-Agent': `Load-Test-${user.username}`
                }
              });
            } catch (error) {
              return { error };
            }
          });
          
          const responses = await Promise.all(requests);
          const endTime = Date.now();
          
          const errors = responses.filter(r => r.error || (r.status && r.status >= 400)).length;
          const avgResponseTime = endTime - startTime;
          
          const testData = {
            timestamp: new Date().toISOString(),
            responseTime: avgResponseTime,
            status: errors > (currentVUs / 2) ? 503 : 200,
            activeVUs: currentVUs,
            testType: 'stress',
            errorRate: (errors / currentVUs) * 100,
            url: url,
            vus: maxVUs,
            duration: duration,
            realUsers: true
          };

          const testResult = new TestResult(testData);
          await testResult.save();
          io.emit('testUpdate', testData);
          
        } catch (error) {
          console.error('Stress test error:', error);
        }
      }, 1000);
      return interval;
        
    case 'soak':
      const startTime = Date.now(); // Move this declaration to the top
      interval = setInterval(async () => {
        const timeElapsed = (Date.now() - startTime) / 1000;
        const baseLatency = 150;
        const userImpact = (maxVUs * 0.7) * 0.5;
        const degradation = Math.pow(timeElapsed / duration, 1.5) * 100;
        
        const testData = {
          timestamp: new Date().toISOString(),
          responseTime: baseLatency + userImpact + degradation,
          status: degradation > 500 ? 503 : 200,
          activeVUs: Math.floor(maxVUs * 0.7),
          memoryUsage: (timeElapsed / duration) * maxVUs * 0.5,
          testType: 'soak', // Changed to match VALID_TEST_TYPES
          url: url,
          vus: maxVUs,
          duration: duration
        };
    
        try {
          const testResult = new TestResult(testData);
          await testResult.save();
          io.emit('testUpdate', testData);
        } catch (error) {
          console.error('Error in soak test:', error);
        }
      }, 1000);
      return interval;

    case 'spike':
      let isSpike = false;
      let spikeCounter = 0;
      interval = setInterval(async () => {
        isSpike = (spikeCounter % 10) < 3;
        currentVUs = isSpike ? maxVUs : Math.ceil(maxVUs * 0.2);
        
        const baseLatency = 100;
        const spikeImpact = isSpike ? (currentVUs * 1.5) : (currentVUs * 0.3);
        const jitter = Math.random() * 100;
        
        const testData = {
          timestamp: new Date().toISOString(),
          responseTime: baseLatency + spikeImpact + jitter,
          status: isSpike && spikeImpact > 1000 ? 503 : 200,
          activeVUs: currentVUs,
          testType: 'spike', // Changed to match VALID_TEST_TYPES
          url: url,
          vus: maxVUs,
          duration: duration
        };
    
        try {
          const testResult = new TestResult(testData);
          await testResult.save();
          io.emit('testUpdate', testData);
        } catch (error) {
          console.error('Error in spike test:', error);
        }
        spikeCounter++;
      }, 1000);
      return interval;
    
      default:
      throw new Error(`Invalid test type: ${testType}`);
  }
}

// Add API endpoints for test results
router.get('/results', async (req, res) => {
  try {
    const results = await TestResult.find().sort({ timestamp: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching test results', error: error.message });
  }
});

router.get('/results/:testType', async (req, res) => {
  try {
    const results = await TestResult.find({ 
      testType: new RegExp(req.params.testType, 'i') 
    }).sort({ timestamp: -1 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching test results', error: error.message });
  }
});

module.exports = router;