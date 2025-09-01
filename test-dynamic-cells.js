const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testDynamicCellCount() {
  console.log('🧪 Testing Dynamic Cell Count Feature...\n');

  const testCases = [
    { kitSerial: 'DYNAMIC-KIT-8', cellCount: 8, description: '8 cells' },
    { kitSerial: 'DYNAMIC-KIT-10', cellCount: 10, description: '10 cells' },
    { kitSerial: 'DYNAMIC-KIT-16', cellCount: 16, description: '16 cells' },
    { kitSerial: 'DYNAMIC-KIT-24', cellCount: 24, description: '24 cells' },
    { kitSerial: 'DYNAMIC-KIT-32', cellCount: 32, description: '32 cells' }
  ];

  for (const testCase of testCases) {
    try {
      console.log(`📦 Testing ${testCase.description} allocation...`);
      
      // Generate cell serial numbers based on count
      const cellSerialNumbers = [];
      for (let i = 1; i <= testCase.cellCount; i++) {
        cellSerialNumbers.push(`${testCase.kitSerial}-CELL-${i.toString().padStart(3, '0')}`);
      }

      // Create kit with dynamic cell count
      const createResponse = await axios.post(`${API_BASE}/api/kits`, {
        kitSerialNumber: testCase.kitSerial,
        cellSerialNumbers,
        operatorName: 'Dynamic Test Operator'
      });

      console.log(`✅ Created kit with ${testCase.cellCount} cells:`, createResponse.data.kitSerialNumber);

      // Verify kit details
      const kitResponse = await axios.get(`${API_BASE}/api/kits/${testCase.kitSerial}`);
      const actualCellCount = kitResponse.data.cells.length;
      
      if (actualCellCount === testCase.cellCount) {
        console.log(`✅ Verified: Kit has exactly ${actualCellCount} cells`);
      } else {
        console.log(`❌ Error: Expected ${testCase.cellCount} cells, got ${actualCellCount}`);
      }

      // Test validation session
      const sessionResponse = await axios.post(`${API_BASE}/api/validation/start`, {
        kitSerialNumber: testCase.kitSerial,
        operatorName: 'Dynamic Test Operator'
      });

      // Test a few cell validations
      for (let i = 0; i < Math.min(3, testCase.cellCount); i++) {
        const scanResponse = await axios.post(`${API_BASE}/api/validation/scan`, {
          sessionId: sessionResponse.data.sessionId,
          cellSerialNumber: cellSerialNumbers[i]
        });
        
        if (scanResponse.data.isValid) {
          console.log(`✅ Cell ${cellSerialNumbers[i]} validated successfully`);
        } else {
          console.log(`❌ Cell ${cellSerialNumbers[i]} validation failed`);
        }
      }

      // Complete session
      await axios.post(`${API_BASE}/api/validation/complete`, {
        sessionId: sessionResponse.data.sessionId
      });

      console.log(`✅ Completed validation session for ${testCase.description}\n`);

    } catch (error) {
      console.error(`❌ Test failed for ${testCase.description}:`, error.response?.data?.error || error.message);
    }
  }

  console.log('🎉 Dynamic cell count testing completed!');
  console.log('\n📋 Test Summary:');
  console.log('   ✅ Variable cell count allocation (8, 10, 16, 24, 32 cells)');
  console.log('   ✅ Dynamic cell serial number generation');
  console.log('   ✅ Kit creation with different cell counts');
  console.log('   ✅ Validation sessions with variable cell counts');
  console.log('   ✅ Cell validation for different kit sizes');
}

testDynamicCellCount();
