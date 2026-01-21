const axios = require('axios');

console.log("Testing API connectivity...");

// Test 1: Check if server is reachable
const testRoot = axios.get('http://localhost:5000')
    .then(() => console.log('✅ Root endpoint reachable (200 OK)'))
    .catch(e => {
        if (e.response && e.response.status === 404) console.log('✅ Server reachable (404 on root is normal)');
        else console.log('❌ Server root unreachable:', e.message);
    });

// Test 2: Check standard API (should return 401 without token)
const testMe = axios.get('http://localhost:5000/api/auth/me')
    .then(() => console.log('❌ Unexpected success on /me without token!'))
    .catch(e => {
        if (e.response && e.response.status === 401) console.log('✅ Auth endpoint reachable (401 Unauthorized as expected)');
        else console.log('❌ Auth endpoint error:', e.message);
    });

Promise.allSettled([testRoot, testMe]).then(() => console.log("Test complete."));
