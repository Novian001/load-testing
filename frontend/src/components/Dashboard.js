import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, Paper, Typography, Button } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { io } from 'socket.io-client';
import TestConfiguration from './dashboard/TestConfiguration';
import TestStatistics from './dashboard/TestStatistics';
import { exportToExcel } from './dashboard/ExportUtils';
import { getChartColor } from './dashboard/PerformanceUtils';

const Dashboard = () => {
  const [testData, setTestData] = useState({});
  const [testConfig, setTestConfig] = useState({
    url: '',
    vus: 1,
    duration: 30
  });
  const [selectedTests, setSelectedTests] = useState({
    smoke: false,
    'average-load': false,
    breakpoint: false,
    stress: true,
    soak: false,
    spike: false
  });

  const handleStartTests = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      const response = await fetch('http://localhost:5001/api/tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...testConfig,
          selectedTests
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Tests started:', data);
      setTestData({}); // Clear previous test data
    } catch (error) {
      console.error('Error starting tests:', error);
      if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
        alert('Test request timed out. Consider reducing the number of virtual users or increasing the server capacity.');
      } else {
        alert('Error starting tests. Please check the console for details.');
      }
    }
  };

  useEffect(() => {
    const socket = io('http://localhost:5001');
    
    socket.on('testUpdate', (data) => {
      console.log('Received test data:', data);
      setTestData(prevData => ({
        ...prevData,
        [data.testType.toLowerCase().replace(' test', '')]: [
          ...(prevData[data.testType.toLowerCase().replace(' test', '')] || []),
          {
            ...data,
            vus: data.vus || testConfig.vus
          }
        ]
      }));
    });

    socket.on('testsComplete', () => {
      console.log('Tests completed');
    });

    return () => socket.disconnect();
  }, [testConfig.vus]);
  console.log('testData after update:', testData);

  console.log('Stress Data:', testData['stress']);


  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>Load Testing Dashboard</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => exportToExcel({testData, testConfig})}
            disabled={Object.keys(testData).length === 0}
          >
            Export All Tests
          </Button>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TestConfiguration 
              testConfig={testConfig}
              setTestConfig={setTestConfig}
              selectedTests={selectedTests}
              setSelectedTests={setSelectedTests}
              onStartTests={handleStartTests}
            />
          </Grid>

          {Object.entries(selectedTests).map(([testType, isSelected]) => (
            isSelected && (
              <Grid item xs={12} md={6} key={testType}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6">
                    {testType.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')} Test Results
                  </Typography>
                  <LineChart 
                    width={500} 
                    height={300} 
                    data={testData[testType] || []}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="timestamp"
                      tickFormatter={(timestamp) => {
                        const date = new Date(timestamp);
                        return `${date.getMinutes()}:${date.getSeconds()}`;
                      }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="responseTime" 
                      stroke={getChartColor(testType)} 
                      dot={false}
                    />
                  </LineChart>
                  <TestStatistics 
                    data={testData[testType]}
                    type={testType}
                    testConfig={testConfig}
                  />
                </Paper>
              </Grid>
            )
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;