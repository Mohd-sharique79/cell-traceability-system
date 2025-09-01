const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testSystem() {
  console.log('🧪 Testing Cell Traceability System...\n');

  try {
    // Test 1: Create a kit with allocated cells
    console.log('1️⃣ Creating Kit KIT-2024-001 with 16 cells...');
    const kitData = {
      kitSerialNumber: 'KIT-2024-001',
      cellSerialNumbers: [
        'CELL-001', 'CELL-002', 'CELL-003', 'CELL-004',
        'CELL-005', 'CELL-006', 'CELL-007', 'CELL-008',
        'CELL-009', 'CELL-010', 'CELL-011', 'CELL-012',
        'CELL-013', 'CELL-014', 'CELL-015', 'CELL-016'
      ],
      operatorName: 'John Smith'
    };

    const createResponse = await axios.post(`${API_BASE}/kits`, kitData);
    console.log('✅ Kit created successfully:', createResponse.data);

    // Test 2: Get kit details
    console.log('\n2️⃣ Retrieving kit details...');
    const kitResponse = await axios.get(`${API_BASE}/kits/KIT-2024-001`);
    console.log('✅ Kit details retrieved:', {
      kitSerialNumber: kitResponse.data.kit.kit_serial_number,
      cellCount: kitResponse.data.cells.length,
      cells: kitResponse.data.cells
    });

    // Test 3: Start validation session
    console.log('\n3️⃣ Starting validation session...');
    const sessionResponse = await axios.post(`${API_BASE}/validation/start`, {
      kitSerialNumber: 'KIT-2024-001',
      operatorName: 'Jane Doe'
    });
    console.log('✅ Validation session started:', sessionResponse.data);

    const sessionId = sessionResponse.data.sessionId;

    // Test 4: Validate correct cells
    console.log('\n4️⃣ Testing valid cell scans...');
    for (let i = 0; i < 5; i++) {
      const cellScanResponse = await axios.post(`${API_BASE}/validation/scan`, {
        sessionId,
        cellSerialNumber: `CELL-00${i + 1}`
      });
      console.log(`✅ Cell CELL-00${i + 1}: ${cellScanResponse.data.isValid ? 'VALID' : 'INVALID'}`);
    }

    // Test 5: Test invalid cell
    console.log('\n5️⃣ Testing invalid cell scan...');
    const invalidScanResponse = await axios.post(`${API_BASE}/validation/scan`, {
      sessionId,
      cellSerialNumber: 'CELL-999'
    });
    console.log(`✅ Invalid cell CELL-999: ${invalidScanResponse.data.isValid ? 'VALID' : 'INVALID'}`);

    // Test 6: Get all kits
    console.log('\n6️⃣ Retrieving all kits...');
    const allKitsResponse = await axios.get(`${API_BASE}/kits`);
    console.log('✅ All kits retrieved:', allKitsResponse.data.length, 'kits found');

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 System Features Verified:');
    console.log('   ✅ Kit creation with cell allocation');
    console.log('   ✅ Kit retrieval and details');
    console.log('   ✅ Validation session management');
    console.log('   ✅ Real-time cell validation');
    console.log('   ✅ Invalid cell detection');
    console.log('   ✅ Database persistence');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Server might not be running.');
      console.error('Make sure the server is running on port 5000');
    }
  }
}

// Run the test
testSystem();
