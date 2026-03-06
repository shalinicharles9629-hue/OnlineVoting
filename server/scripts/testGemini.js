const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Checking API Key...");
    if (!apiKey) {
        console.error("No GEMINI_API_KEY found in .env at", path.join(__dirname, '../.env'));
        return;
    }
    console.log("API Key found (length):", apiKey.length);

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        console.log("Sending request to Gemini...");
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        console.log("SUCCESS:", response.text());
    } catch (error) {
        console.error("FAILURE:", error.message);
    }
}

testGemini();

