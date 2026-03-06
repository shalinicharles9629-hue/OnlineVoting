const https = require('https');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        const fs = require('fs');
        fs.writeFileSync('api_models.json', data);
        console.log('Status Code:', res.statusCode);
    });
}).on('error', (err) => {
    console.error('Error:', err.message);
});
