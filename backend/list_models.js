const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log("Fetching available models...");

https.get(url, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        try {
            const data = JSON.parse(body);
            if (data.models) {
                const names = data.models.map(m => m.name);
                fs.writeFileSync('available_models.txt', names.join('\n'));
                console.log("Wrote " + names.length + " models to available_models.txt");
            } else {
                console.log("NO_MODELS_ERROR:" + JSON.stringify(data));
            }
        } catch (err) {
            console.log("PARSE_ERROR:" + err.message);
        }
    });
}).on('error', (e) => {
    console.log("CONN_ERROR:" + e.message);
});
