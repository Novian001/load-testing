import React from 'react';
import { Paper, Typography, Table, TableContainer, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

const LagAnalysis = ({ lagData }) => {
  if (!lagData || lagData.length === 0) {
    return null;
  }

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Lag Analysis
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Response Time (ms)</TableCell>
              <TableCell>Virtual Users</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Threshold (ms)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lagData.map((lag, index) => (
              <TableRow key={index} sx={{ 
                backgroundColor: lag.responseTime > lag.threshold * 1.5 ? '#ffebee' : 'inherit'
              }}>
                <TableCell>
                  {new Date(lag.timestamp).toLocaleTimeString()}
                </TableCell>
                <TableCell>
                  {lag.responseTime.toFixed(2)}
                </TableCell>
                <TableCell>
                  {lag.activeVUs}
                </TableCell>
                <TableCell>
                  {lag.status}
                </TableCell>
                <TableCell>
                  {lag.threshold.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
        * Rows in red indicate severe lag (150% of threshold)
      </Typography>
    </Paper>
  );
};

export default LagAnalysis;