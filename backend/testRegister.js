const axios = require('axios');

async function testReg() {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'testuser',
            email: 'testuser_' + Date.now() + '@example.com',
            password: 'password123',
            role: 'job-seeker',
            contact: '1234567890',
            location: 'Test City'
        });
        console.log(res.status, res.data);
    } catch (err) {
        console.error(err.response ? err.response.data : err.message);
    }
}
testReg();
