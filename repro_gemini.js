const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });

const fs = require('fs');

async function testHistory() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        fs.writeFileSync('repro_out.txt', "No API key");
        return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // This simulates the history sent from Chatbot.jsx (initial greeting from bot)
    const history = [
        { sender: 'bot', text: "Hello! I'm your Election Assistant. How can I help you today?" }
    ];

    try {
        console.log("Starting chat with history starting with 'model'...");
        const chat = model.startChat({
            history: history.map(m => ({
                role: m.sender === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
            })),
        });

        const result = await chat.sendMessage("Hi, can you tell me about the elections?");
        const response = await result.response;
        fs.writeFileSync('repro_out.txt', "Success: " + response.text());
    } catch (error) {
        fs.writeFileSync('repro_out.txt', "Caught error: " + error.message);
        process.exit(1);
    }
}


testHistory();
