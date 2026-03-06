const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

const MODEL_NAME = "gemini-flash-lite-latest";
const API_KEY = process.env.GEMINI_API_KEY;

async function testGemini() {
    if (!API_KEY) {
        console.error("GEMINI_API_KEY not found in .env");
        return;
    }

    try {
        console.log(`Connecting to Gemini using model: ${MODEL_NAME}...`);
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const result = await model.generateContent("Hello, are you there?");
        const response = result.response.text();
        console.log("Success! Response:", response);
    } catch (error) {
        console.error("Gemini Test Failed:", error.message);
        if (error.message.includes("404")) {
            console.error("Likely cause: Model name is incorrect.");
        } else if (error.message.includes("403")) {
            console.error("Likely cause: API Key is invalid or permissions issue.");
        }
    }
}

testGemini();
