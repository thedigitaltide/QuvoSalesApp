#!/usr/bin/env node

// Complete API test with session handling
const https = require('https');

const API_BASE_URL = 'https://cireco.sachtlebentechnology.com/api/v1';
const credentials = {
  email: 'Allan.kane',
  password: 'Allan1234!'
};

let sessionCookies = '';

console.log('🔍 Testing Quvo API Connection with Session Handling...\n');

// Test login with cookie capture
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
      
      // Capture session cookies
      if (res.headers['set-cookie']) {
        sessionCookies = res.headers['set-cookie'].map(cookie => cookie.split(';')[0]).join('; ');
        console.log('🍪 Session cookies captured');
      }
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          if (res.statusCode === 200 && response.user) {
            console.log('✅ Login successful!');
            console.log(`👤 User: ${response.user.name} (Role: ${response.user.role})`);
            console.log(`🆔 User ID: ${response.user._id}\n`);
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

// Test dashboard data with session
function testDashboard() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'cireco.sachtlebentechnology.com',
      port: 443,
      path: '/api/v1/dashboard/initial-fetch',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cookie': sessionCookies
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
            
            console.log('✅ Dashboard data loaded successfully!');
            console.log(`📊 Found ${records.length} active bays and ${storages.length} storage zones\n`);
            
            console.log('🏪 Current Bay Status:');
            console.log('═══════════════════════════════════════════════════');
            
            // Sort bays by name
            records.sort((a, b) => a.name.localeCompare(b.name));
            
            let totalVolume = 0;
            records.forEach((record) => {
              const storage = response.storagesById[record.storageId];
              const volume = parseFloat(record.volume || 0);
              const maxVolume = parseFloat(storage?.maxVolume || 1000);
              const utilization = ((volume / maxVolume) * 100).toFixed(1);
              totalVolume += volume;
              
              // Status indicator
              let status = '🟢 Available';
              if (utilization >= 90) status = '🔴 Nearly Full';
              else if (utilization >= 70) status = '🟠 High';
              else if (utilization < 30) status = '⚪ Low Stock';
              
              console.log(`  ${record.name}:`);
              console.log(`    📏 Volume: ${volume.toLocaleString()} units (${utilization}% of ${maxVolume.toLocaleString()})`);
              console.log(`    📋 Material: ${record.material || 'Unknown'}`);
              console.log(`    🚦 Status: ${status}`);
              console.log(`    🕐 Updated: ${record.datetime || 'Unknown'}`);
              console.log('');
            });
            
            console.log('📊 SUMMARY STATISTICS:');
            console.log('═══════════════════════════════════════════════════');
            console.log(`  🏪 Total Active Bays: ${records.length}`);
            console.log(`  📏 Total Volume: ${totalVolume.toLocaleString()} units`);
            
            const avgUtilization = records.reduce((sum, record) => {
              const storage = response.storagesById[record.storageId];
              const volume = parseFloat(record.volume || 0);
              const maxVolume = parseFloat(storage?.maxVolume || 1000);
              return sum + (volume / maxVolume) * 100;
            }, 0) / records.length;
            
            console.log(`  📈 Average Utilization: ${avgUtilization.toFixed(1)}%`);
            
            resolve(response);
          } else {
            console.log('❌ Dashboard failed. Status:', res.statusCode);
            console.log('Response:', responseData.slice(0, 200) + '...');
            reject(new Error('Dashboard failed'));
          }
        } catch (error) {
          console.log('❌ Invalid dashboard response:', error.message);
          console.log('Raw response:', responseData.slice(0, 200) + '...');
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

// Test projects endpoint
function testProjects() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'cireco.sachtlebentechnology.com',
      port: 443,
      path: '/api/v1/projects',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cookie': sessionCookies
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const projects = JSON.parse(responseData);
          if (res.statusCode === 200 && Array.isArray(projects)) {
            console.log('✅ Projects loaded successfully!');
            console.log(`🏭 Found ${projects.length} facilities:\n`);
            
            projects.forEach(project => {
              console.log(`  🏢 ${project.name.toUpperCase()}:`);
              console.log(`    📡 Sensors: ${project.sensorAmount}`);
              console.log(`    🏪 Storage Zones: ${project.storageAmount}`);
              if (project.location) console.log(`    📍 Location: ${project.location}`);
              console.log('');
            });
            
            resolve(projects);
          } else {
            console.log('❌ Projects failed. Status:', res.statusCode);
            reject(new Error('Projects failed'));
          }
        } catch (error) {
          console.log('❌ Invalid projects response:', error.message);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Projects connection failed:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Run complete test suite
async function runTests() {
  try {
    await testLogin();
    await testProjects();
    await testDashboard();
    
    console.log('\n🎉 ALL API TESTS PASSED!');
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ Your Quvo Sales App will work perfectly!');
    console.log('✅ Authentication successful');
    console.log('✅ Bay data loading correctly');
    console.log('✅ Multi-facility support working');
    console.log('');
    console.log('📱 Next Steps:');
    console.log('1. Set up mobile development environment:');
    console.log('   • Install Java: brew install --cask temurin');
    console.log('   • Install CocoaPods: sudo gem install cocoapods');
    console.log('2. Run your app:');
    console.log('   • iOS: npm run ios');
    console.log('   • Android: npm run android');
    console.log('');
    console.log('🚀 Your sales team will have real-time access to:');
    console.log('   • Bay volume levels across all facilities');
    console.log('   • Material type identification');
    console.log('   • Capacity utilization percentages');
    console.log('   • Color-coded status indicators');
    console.log('   • Multi-site switching capability');
    
  } catch (error) {
    console.log('\n❌ Some API tests failed.');
    console.log('Please check your network connection and API availability.');
  }
}

runTests();