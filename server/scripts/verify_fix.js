const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });


async function verifyFix() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API key");
        return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);

    // Simulate history with initial bot message (previously problematic)
    const history = [
        { sender: 'bot', text: "Hello! I'm your Election Assistant. How can I help you today?" }
    ];

    // Clean history (logic copied from chatbot.js)
    let cleanedHistory = history
        .filter(m => m.text && m.sender)
        .map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
        }));

    while (cleanedHistory.length > 0 && cleanedHistory[0].role === 'model') {
        cleanedHistory.shift();
    }

    const systemPrompt = "You are the 'Election Assistant'. Be brief.";

    try {
        console.log("Verifying fix with history starting with shifted 'model' message...");
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: systemPrompt
        });

        const chat = model.startChat({
            history: cleanedHistory,
        });

        const result = await chat.sendMessage("Hi, tell me one thing about voting.");
        const response = await result.response;
        console.log("VERIFICATION SUCCESS:", response.text());
        fs.writeFileSync('verify_out.txt', "Success: " + response.text());
    } catch (error) {
        console.error("VERIFICATION FAILURE:", error.message);
        fs.writeFileSync('verify_out.txt', "Failure: " + error.message);
    }
}

verifyFix();
