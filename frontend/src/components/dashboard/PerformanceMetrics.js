import React from 'react';
import { Box, Grid, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { calculatePerformance } from './PerformanceUtils';

const PerformanceMetrics = ({ data }) => {
  if (!data || data.length === 0) {
    return null;
  }

  const calculateMetrics = () => {
    const responseTimesMs = data.map(item => item.responseTime);
    const errorCount = data.filter(item => item.status >= 400).length;
    
    return {
      avgResponseTime: responseTimesMs.reduce((a, b) => a + b, 0) / responseTimesMs.length,
      minResponseTime: Math.min(...responseTimesMs),
      maxResponseTime: Math.max(...responseTimesMs),
      p95ResponseTime: responseTimesMs.sort((a, b) => a - b)[Math.floor(responseTimesMs.length * 0.95)],
      errorRate: (errorCount / data.length) * 100,
      totalRequests: data.length,
      successfulRequests: data.length - errorCount,
      throughput: data.length / (data[data.length - 1].timestamp - data[0].timestamp) * 1000
    };
  };

  const metrics = calculateMetrics();
  const performance = calculatePerformance(metrics.avgResponseTime, metrics.errorRate);

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Performance Metrics
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Metric</TableCell>
                  <TableCell align="right">Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Average Response Time</TableCell>
                  <TableCell align="right">{metrics.avgResponseTime.toFixed(2)} ms</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Min Response Time</TableCell>
                  <TableCell align="right">{metrics.minResponseTime.toFixed(2)} ms</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Max Response Time</TableCell>
                  <TableCell align="right">{metrics.maxResponseTime.toFixed(2)} ms</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>95th Percentile</TableCell>
                  <TableCell align="right">{metrics.p95ResponseTime.toFixed(2)} ms</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Error Rate</TableCell>
                  <TableCell align="right">{metrics.errorRate.toFixed(2)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Total Requests</TableCell>
                  <TableCell align="right">{metrics.totalRequests}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Successful Requests</TableCell>
                  <TableCell align="right">{metrics.successfulRequests}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Throughput</TableCell>
                  <TableCell align="right">{metrics.throughput.toFixed(2)} req/s</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Performance Rating</TableCell>
                  <TableCell 
                    align="right"
                    sx={{ 
                      color: performance.color,
                      fontWeight: 'bold'
                    }}
                  >
                    {performance.rating}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PerformanceMetrics;