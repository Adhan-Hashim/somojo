async function testLogin() {
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'kdevapriya75@gmail.co',
                password: 'somepassword'
            })
        });
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Data:", JSON.stringify(data, null, 2));
    } catch (err) {
        console.log("Fetch Error:", err.message);
    }
}

testLogin();
