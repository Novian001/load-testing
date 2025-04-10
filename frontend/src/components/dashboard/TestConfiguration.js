import React from 'react';
import { Box, Paper, Typography, TextField, Grid, Button, FormControlLabel, Checkbox } from '@mui/material';

const TestConfiguration = ({ 
  testConfig, 
  setTestConfig, 
  selectedTests, 
  setSelectedTests, 
  onStartTests 
}) => {
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Test Configuration</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Target URL"
          value={testConfig.url}
          onChange={(e) => setTestConfig({...testConfig, url: e.target.value})}
          error={testConfig.url !== '' && !isValidUrl(testConfig.url)}
          helperText={testConfig.url !== '' && !isValidUrl(testConfig.url) ? 'Invalid URL format' : ''}
          fullWidth
        />
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Virtual Users"
              type="number"
              value={testConfig.vus}
              onChange={(e) => setTestConfig({...testConfig, vus: parseInt(e.target.value) || 1})}
              inputProps={{ min: 1 }}
              error={testConfig.vus < 1}
              helperText={testConfig.vus < 1 ? 'Minimum 1 user required' : ''}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Duration (s)"
              type="number"
              value={testConfig.duration}
              onChange={(e) => setTestConfig({...testConfig, duration: parseInt(e.target.value) || 30})}
              inputProps={{ min: 1 }}
              error={testConfig.duration < 1}
              helperText={testConfig.duration < 1 ? 'Minimum 1 second required' : ''}
              fullWidth
            />
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {Object.keys(selectedTests).map((test) => (
            <FormControlLabel
              key={test}
              control={
                <Checkbox
                  checked={selectedTests[test]}
                  onChange={(e) => setSelectedTests({
                    ...selectedTests,
                    [test]: e.target.checked
                  })}
                />
              }
              label={test.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            />
          ))}
        </Box>

        <Button 
          variant="contained" 
          onClick={onStartTests}
          disabled={
            !Object.values(selectedTests).some(v => v) || 
            !isValidUrl(testConfig.url) ||
            testConfig.vus < 1 ||
            testConfig.duration < 1
          }
        >
          Start Selected Tests
        </Button>
      </Box>
    </Paper>
  );
};

export default TestConfiguration;