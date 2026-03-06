const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function test() {
    const key = process.env.GEMINI_API_KEY;
    const models = ['gemini-2.0-flash-lite', 'gemini-flash-lite-latest', 'gemini-2.0-flash-lite-preview-09-2025'];

    for (const modelName of models) {
        console.log(`--- Testing model: ${modelName} ---`);
        try {
            const genAI = new GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Say hello.');
            console.log(`SUCCESS [${modelName}] - Response:`, result.response.text());
        } catch (e) {
            console.log(`FAILED [${modelName}] - Error:`, e.message);
        }
    }
}

test();
