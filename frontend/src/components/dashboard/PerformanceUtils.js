export const calculatePerformance = (avgResponseTime, errorRate = 0) => {
  if (avgResponseTime < 200 && errorRate < 1) return { rating: 'Very Good', color: 'success.main' };
  if (avgResponseTime < 500 && errorRate < 5) return { rating: 'Good', color: 'info.main' };
  if (avgResponseTime < 1000 && errorRate < 10) return { rating: 'Neutral', color: 'warning.light' };
  if (avgResponseTime < 2000 && errorRate < 20) return { rating: 'Bad', color: 'warning.main' };
  return { rating: 'Very Bad', color: 'error.main' };
};

export const getChartColor = (testType) => {
  const colors = {
    smoke: '#808080',
    'average-load': '#4CAF50',
    stress: '#9C27B0',
    soak: '#2196F3',
    breakpoint: '#FF5722',
    spike: '#FFC107'
  };
  return colors[testType] || '#000000';
};