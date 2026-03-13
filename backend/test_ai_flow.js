const axios = require('axios');

async function testAIFlow() {
    try {
        console.log("1. Registering Test Employer...");
        const empRes = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Volt Retail',
            email: `employer_${Date.now()}@test.com`,
            password: 'password123',
            role: 'employer'
        });
        const empToken = empRes.data.token;

        console.log("2. Employer posting a Job...");
        const jobRes = await axios.post('http://localhost:5000/api/jobs', {
            title: 'Senior React Developer',
            company: 'Volt Retail Tech',
            location: 'Remote',
            type: 'Full-time',
            category: 'Tech',
            pay: '$120k/yr',
            description: 'Looking for a Senior React Dev to build awesome UIs.',
            requirements: ['5+ years React', 'Tailwind CSS', 'Node.js']
        }, { headers: { 'x-auth-token': empToken } });
        const jobId = jobRes.data._id;
        console.log("Job posted: ", jobId);

        console.log("3. Registering Test Job Seeker...");
        const jsRes = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Alice Dev',
            email: `seeker_${Date.now()}@test.com`,
            password: 'password123',
            role: 'job-seeker'
        });
        const jsToken = jsRes.data.token;

        console.log("4. Job Seeker creating Profile...");
        await axios.post('http://localhost:5000/api/profile', {
            headline: 'Senior Frontend Engineer',
            bio: 'I love building web apps with React and Tailwind.',
            skills: ['React', 'JavaScript', 'Tailwind', 'Node.js'],
            experience: [{ title: 'Frontend Dev', company: 'WebCorp' }]
        }, { headers: { 'x-auth-token': jsToken } });

        console.log("5. Testing /api/jobs/recommended...");
        const recRes = await axios.get('http://localhost:5000/api/jobs/recommended', { headers: { 'x-auth-token': jsToken } });
        console.log("Recommended Jobs returned (Count):", recRes.data.length);
        if (recRes.data.length > 0) {
            console.log("Top Job Score:", recRes.data[0].aiMatchScore);
        }

        console.log("6. Job Seeker applying to Job (Triggers AI Match)...");
        const appRes = await axios.post(`http://localhost:5000/api/applications/${jobId}`, {}, { headers: { 'x-auth-token': jsToken } });
        console.log("Application response:", appRes.data.message);

        console.log("Waiting 5 seconds for Gemini AI background task to complete...");
        await new Promise(r => setTimeout(r, 5000));

        console.log("7. Employer checking Candidate list...");
        const appsRes = await axios.get(`http://localhost:5000/api/applications/job/${jobId}`, { headers: { 'x-auth-token': empToken } });
        console.log("Employer sees applications:");
        console.log(JSON.stringify(appsRes.data, null, 2));

        console.log("✅ TEST SUCCESSFUL");
    } catch (err) {
        console.error("❌ TEST FAILED", err.response ? err.response.data : err.message);
    }
}

testAIFlow();
