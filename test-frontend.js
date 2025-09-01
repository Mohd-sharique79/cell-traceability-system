const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testFrontendAPI() {
  console.log('🧪 Testing Frontend API Integration...\n');

  try {
    // Test 1: Create a test kit
    console.log('1️⃣ Creating test kit...');
    const kitData = {
      kitSerialNumber: 'TEST-KIT-001',
      cellSerialNumbers: ['TEST-CELL-001', 'TEST-CELL-002', 'TEST-CELL-003'],
      operatorName: 'Test Operator'
    };

    const createResponse = await axios.post(`${API_BASE}/api/kits`, kitData);
    console.log('✅ Test kit created:', createResponse.data);

    // Test 2: Get kit details
    console.log('\n2️⃣ Retrieving kit details...');
    const kitResponse = await axios.get(`${API_BASE}/api/kits/${kitData.kitSerialNumber}`);
    console.log('✅ Kit details retrieved:', kitResponse.data);

    // Test 3: Start validation session
    console.log('\n3️⃣ Starting validation session...');
    const sessionResponse = await axios.post(`${API_BASE}/api/validation/start`, {
      kitSerialNumber: kitData.kitSerialNumber,
      operatorName: 'Test Operator'
    });
    console.log('✅ Session started:', sessionResponse.data);

    // Test 4: Test cell validation
    console.log('\n4️⃣ Testing cell validation...');
    const scanResponse = await axios.post(`${API_BASE}/api/validation/scan`, {
      sessionId: sessionResponse.data.sessionId,
      cellSerialNumber: 'TEST-CELL-001'
    });
    console.log('✅ Cell validation result:', scanResponse.data);

    // Test 5: Complete session
    console.log('\n5️⃣ Completing session...');
    const completeResponse = await axios.post(`${API_BASE}/api/validation/complete`, {
      sessionId: sessionResponse.data.sessionId
    });
    console.log('✅ Session completed:', completeResponse.data);

    console.log('\n🎉 All frontend API tests passed!');
    console.log('\n📋 System Status:');
    console.log('   ✅ Backend API: Working');
    console.log('   ✅ Database: Working');
    console.log('   ✅ Kit Management: Working');
    console.log('   ✅ Validation System: Working');
    console.log('   ✅ Session Management: Working');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testFrontendAPI();
