export const getChartColor = (testType) => {
  const colors = {
    smoke: '#808080',
    averageLoad: '#4CAF50',
    stress: '#9C27B0',
    soak: '#2196F3',
    breakpoint: '#FF5722',
    spike: '#FFC107',
  };
  return colors[testType] || '#000000';
};