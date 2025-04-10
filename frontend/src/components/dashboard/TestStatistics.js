import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import PerformanceMetrics from './PerformanceMetrics'; // Changed from named import
import LagAnalysis from './LagAnalysis'; // Changed from named import
import { calculatePerformance } from './PerformanceUtils';
import { exportToExcel } from './ExportUtils';

const TestStatistics = ({ data, type, testConfig }) => {
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="body1" color="text.secondary">
          No data available
        </Typography>
      </Paper>
    );
  }

  const avgResponseTime = data.reduce((acc, curr) => acc + curr.responseTime, 0) / data.length;
  const lagThresholdMs = avgResponseTime * 2;
  const lagData = data
    .filter(item => item.responseTime > lagThresholdMs)
    .map(item => ({
      ...item,
      threshold: lagThresholdMs
    }));

  const performance = calculatePerformance(avgResponseTime);

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="div">
          Test Statistics
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => exportToExcel({
            testData: { [type]: data },
            testConfig
          })}
        >
          Export Results
        </Button>
      </Box>

      <PerformanceMetrics data={data} />
      
      {lagData.length > 0 && (
        <LagAnalysis lagData={lagData} />
      )}

      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Performance Rating: 
          <Box component="span" sx={{ 
            color: performance.color,
            fontWeight: 'bold',
            ml: 1
          }}>
            {performance.rating}
          </Box>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Total Samples: {data.length}
        </Typography>
      </Paper>
    </Box>
  );
};

export default TestStatistics;