const fs = require('fs');
const path = require('path');

const generateUsers = (count) => {
  const users = [];
  
  for (let i = 1; i <= count; i++) {
    const paddedNumber = String(i).padStart(4, '0');
    users.push({
      username: `SPS${paddedNumber}`,
      password: `0r4ngt;`,
      loginUrl: '', // Will be filled from frontend
      dashboardUrl: '', // Will be filled from frontend
      token: null // Will store token after login
    });
  }

  const filePath = path.join(__dirname, '../users.json');
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
  console.log(`Generated ${count} users in users.json`);
};

generateUsers(7000);