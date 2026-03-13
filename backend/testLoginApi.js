const axios = require('axios');

async function testLogin() {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'kdevapriya75@gmail.co',
            password: 'somepassword'
        });
        console.log("Success:", res.data);
    } catch (err) {
        if (err.response) {
            console.log("Response Error Data:", err.response.data);
            console.log("Response Status:", err.response.status);
        } else {
            console.log("Error:", err.message);
        }
    }
}

testLogin();
