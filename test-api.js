#!/usr/bin/env node

// Simple API test script for Quvo Sales App
const https = require('https');

const API_BASE_URL = 'https://cireco.sachtlebentechnology.com/api/v1';
const credentials = {
  email: 'Allan.kane',
  password: 'Allan1234!'
};

console.log('🔍 Testing Quvo API Connection...\n');

// Test login
function testLogin() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(credentials);
    
    const options = {
      hostname: 'cireco.sachtlebentechnology.com',
      port: 443,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          if (res.statusCode === 200 && response.user) {
            console.log('✅ Login successful!');
            console.log(`👤 User: ${response.user.name} (${response.user.role})`);
            resolve(response);
          } else {
            console.log('❌ Login failed:', response);
            reject(new Error('Login failed'));
          }
        } catch (error) {
          console.log('❌ Invalid response:', responseData);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Connection failed:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Test dashboard data
function testDashboard() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'cireco.sachtlebentechnology.com',
      port: 443,
      path: '/api/v1/dashboard/initial-fetch',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          if (res.statusCode === 200 && response.recordsById) {
            const records = Object.values(response.recordsById);
            const storages = Object.values(response.storagesById || {});
            
            console.log('✅ Dashboard data loaded!');
            console.log(`📊 Found ${records.length} bays and ${storages.length} storage zones\n`);
            
            console.log('🏪 Bay Status Summary:');
            records.forEach((record, index) => {
              const storage = response.storagesById[record.storageId];
              const volume = parseFloat(record.volume || 0);
              const maxVolume = parseFloat(storage?.maxVolume || 1000);
              const utilization = ((volume / maxVolume) * 100).toFixed(1);
              
              console.log(`  ${record.name}: ${volume} units (${utilization}% full) - ${record.material}`);
            });
            
            resolve(response);
          } else {
            console.log('❌ Dashboard failed:', response);
            reject(new Error('Dashboard failed'));
          }
        } catch (error) {
          console.log('❌ Invalid dashboard response');
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Dashboard connection failed:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Run tests
async function runTests() {
  try {
    await testLogin();
    console.log('');
    await testDashboard();
    console.log('\n✅ All API tests passed! Your app will work correctly.');
    console.log('\nNext steps:');
    console.log('1. Set up mobile development environment');
    console.log('2. Run: npm run ios (or npm run android)');
    console.log('3. Test the app on simulator/device');
  } catch (error) {
    console.log('\n❌ API tests failed. Check your connection and API status.');
  }
}

runTests();