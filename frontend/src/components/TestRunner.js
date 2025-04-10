socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

socket.on('testError', (error) => {
  console.error('Test error:', error);
});