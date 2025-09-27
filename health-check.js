/**
 * Health Check Script
 * This script checks if all required services are running correctly
 */

import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

// Function to check if a service is running by making an HTTP request
async function checkHttpService(url, serviceName) {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    console.log(`✅ ${serviceName} is running (Status: ${response.status})`);
    return true;
  } catch (error) {
    console.log(`❌ ${serviceName} is not accessible: ${error.message}`);
    return false;
  }
}

// Function to check if a process is running
async function checkProcess(processName) {
  try {
    const command = process.platform === 'win32' 
      ? `tasklist /FI "IMAGENAME eq ${processName}"` 
      : `pgrep ${processName}`;
    
    const { stdout } = await execPromise(command);
    
    if (stdout.includes(processName) || stdout.trim() !== '') {
      console.log(`✅ ${processName} process is running`);
      return true;
    } else {
      console.log(`❌ ${processName} process is not running`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error checking ${processName} process: ${error.message}`);
    return false;
  }
}

// Main health check function
async function performHealthCheck() {
  console.log('🔍 Performing health check for File Social Platform...\n');
  
  let allChecksPassed = true;
  
  // Check MongoDB (if running as a process)
  try {
    await checkProcess('mongod.exe');
  } catch (error) {
    console.log('⚠️  Could not check MongoDB process status');
  }
  
  // Check Redis (if running as a process)
  try {
    await checkProcess('redis-server.exe');
  } catch (error) {
    console.log('⚠️  Could not check Redis process status');
  }
  
  // Check backend API
  const backendCheck = await checkHttpService('http://localhost:5000/api/health', 'Backend API');
  if (!backendCheck) allChecksPassed = false;
  
  // Check frontend
  const frontendCheck = await checkHttpService('http://localhost:3000', 'Frontend');
  if (!frontendCheck) allChecksPassed = false;
  
  console.log('\n📋 Health check summary:');
  if (allChecksPassed) {
    console.log('🎉 All services are running correctly!');
    console.log('\n📱 You can now access the application:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Backend API: http://localhost:5000/api');
    console.log('   Admin Panel: http://localhost:3000/admin');
  } else {
    console.log('⚠️  Some services are not running. Please check the output above.');
    console.log('\n🔧 Troubleshooting tips:');
    console.log('   1. Make sure MongoDB and Redis are running');
    console.log('   2. Check if the backend server is running on port 5000');
    console.log('   3. Check if the frontend server is running on port 3000');
  }
}

// Run the health check
performHealthCheck().catch(error => {
  console.error('Error during health check:', error);
});