const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

const MODEL_NAME = "gemini-flash-lite-latest";
const API_KEY = process.env.GEMINI_API_KEY;

async function testStreaming() {
    try {
        console.log(`Connecting to Gemini using model: ${MODEL_NAME} (STREAMING)...`);
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const result = await model.generateContentStream("Tell me a short joke.");
        for await (const chunk of result.stream) {
            process.stdout.write(chunk.text());
        }
        console.log("\nSuccess!");
    } catch (error) {
        console.error("\nStreaming Test Failed:", error.message);
        console.error(error.stack);
    }
}

testStreaming();
