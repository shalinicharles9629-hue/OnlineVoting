const express = require('express');
const router = express.Router();
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const User = require('../models/User');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Gemini Instance
let genAI = null;
let geminiModel = null;
const MODEL_NAME = "gemini-flash-lite-latest";

if (process.env.GEMINI_API_KEY) {
    console.log(`Chatbot: GEMINI_API_KEY found, initializing ${MODEL_NAME}...`);
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: MODEL_NAME });
} else {
    console.warn("Chatbot: GEMINI_API_KEY NOT found. Running in fallback mode.");
}

// Helper: timeout wrapper
const withTimeout = (promise, ms = 30000) => {
    const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out after ' + ms + 'ms')), ms)
    );
    return Promise.race([promise, timeout]);
};

const getBotResponse = async (text, providedIdentifier = null, history = []) => {
    const query = text.toLowerCase().trim();
    let identifier = providedIdentifier;

    console.log(`Chatbot: Query received: "${text}"`);

    // --- 1. Extract Identifier from message ---
    const emailMatch = query.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i);
    // Matches 10 digits, possibly preceded by +91 or 91
    const phoneMatch = query.match(/(?:\+91|91)?\s?(\d{10})\b/);

    if (emailMatch) identifier = emailMatch[0];
    else if (phoneMatch) identifier = phoneMatch[1]; // Use the captured 10 digits

    // --- 2. Fetch Personal Vote Status ---
    let personalStatus = "No user identifier provided.";
    if (identifier) {
        try {
            // First, find the user to get their canonical identifier (as stored in DB)
            let user = null;
            if (identifier.includes('@')) {
                user = await User.findOne({ email: identifier });
            } else {
                // For phone numbers, be flexible with formatting (spaces, etc)
                // regex built from digits of identifier: e.g. "12345" -> /1\s*2\s*3\s*4\s*5/
                const phoneRegex = new RegExp(identifier.split('').join('\\s*'));
                user = await User.findOne({ phone: phoneRegex });
            }

            if (user) {
                // Use the exact strings from DB to look for votes
                const dbIdentifier = user.email || user.phone;
                const votes = await Vote.find({ voterIdentifier: dbIdentifier }).populate('electionId');

                if (votes && votes.length > 0) {
                    const votedElections = votes.map(v => v.electionId?.title || 'Unknown Election');
                    personalStatus = `The user "${user.name}" (${dbIdentifier}) HAS VOTED in: ${votedElections.map(e => `"${e}"`).join(", ")}.`;
                } else {
                    personalStatus = `User "${user.name}" (${dbIdentifier}) is registered but HAS NOT cast a vote in any election yet.`;
                }
            } else {
                personalStatus = `No registered voter found for identifier: "${identifier}". They may need to register first.`;
            }
        } catch (dbErr) {
            console.error("Chatbot: DB Lookup Error:", dbErr.message);
            personalStatus = "Could not fetch user status due to a database error.";
        }
    }

    // --- 3. Fetch Real-time Election Context ---
    let electionContext = "No election data available.";
    try {
        const activeElections = await Election.find({ status: 'ongoing' });
        const upcomingElections = await Election.find({ status: 'upcoming' });
        const completedElections = await Election.find({ status: 'ended' });
        const candidates = await Candidate.find({ isApproved: true }).populate('electionId');

        electionContext = `
LIVE SYSTEM DATA (fetched in real-time):
- Active/Ongoing Elections: ${activeElections.length > 0 ? activeElections.map(e => `"${e.title}"`).join(", ") : "None currently"}
- Upcoming Elections: ${upcomingElections.length > 0 ? upcomingElections.map(e => `"${e.title}"`).join(", ") : "None scheduled"}
- Recently Completed Elections: ${completedElections.slice(-3).map(e => `"${e.title}"`).join(", ") || "None"}
- Approved Candidates: ${candidates.length > 0 ? candidates.map(c => `${c.name} (${c.party || 'Independent'}) contesting in "${c.electionId?.title || 'Unknown'}"`).join("; ") : "None listed"}
- Voter Status: ${personalStatus}
        `.trim();
        console.log("Chatbot: Context built successfully.");
    } catch (ctxErr) {
        console.error("Chatbot: Context building failed:", ctxErr.message);
    }

    // --- 4. Build Conversation History String ---
    // Use last 8 exchanges (16 messages) to avoid huge prompts
    const recentHistory = history.slice(-16);
    const conversationStr = recentHistory
        .filter(m => m.text && m.sender)
        .map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
        .join('\n');

    // --- 5. Build Full Prompt (single generateContent call - most reliable approach) ---
    const fullPrompt = `
You are "Election Assistant", the official AI for the DigiVote Online Voting Portal of India.

SYSTEM INSTRUCTIONS:
- Be helpful, professional, and conversational.
- Always answer based on the LIVE SYSTEM DATA provided below. Do not make up elections or candidates.
- Use Markdown for formatting (bold, lists, etc.) to make your responses readable and organized.
- If asked about security, mention AES-256 encryption, OTP-based 2FA, and Biometric Face Matching.
- Voting process: 1) Login with email/phone, 2) Request OTP, 3) Complete Face Matching, 4) Cast vote.
- If you don't know something not in the data, say so honestly and suggest the user contact the Election Commission.
- Keep responses concise but comprehensive.

${electionContext}

${conversationStr ? `CONVERSATION HISTORY:\n${conversationStr}\n` : ''}
User: ${text}
Assistant:`.trim();

    // --- 6. Call Gemini ---
    if (geminiModel) {
        try {
            console.log("Chatbot: Calling Gemini API...");
            const result = await withTimeout(
                geminiModel.generateContent(fullPrompt),
                30000
            );
            const responseText = result.response.text().trim();
            if (responseText) {
                console.log("Chatbot: Gemini responded successfully.");
                return responseText;
            } else {
                console.warn("Chatbot: Gemini returned empty response.");
            }
        } catch (geminiErr) {
            console.error("Chatbot: Gemini Error:", geminiErr.message);
            if (geminiErr.message.includes("SAFETY")) {
                return "I cannot answer this query due to safety restrictions. Please ask another election-related question.";
            }
            // Fall through to smart fallback
        }
    } else {
        console.warn("Chatbot: Gemini model not initialized.");
    }

    // --- 7. Smart Fallback (when Gemini unavailable or fails) ---
    console.log("Chatbot: Using smart fallback...");
    const matches = (keywords) => keywords.some(k => query.includes(k));

    if (identifier) {
        return personalStatus;
    }

    if (matches(['security', 'safe', 'aes', 'hack', 'protect', 'encrypt', 'private', 'secure', 'biometric'])) {
        return "DigiVote uses AES-256 encryption for all ballots, OTP-based 2-Factor Authentication, and Biometric Face Matching to ensure your vote is 100% private and tamper-proof.";
    }

    if (matches(['ongoing', 'active', 'live', 'running', 'current election', 'happening'])) {
        try {
            const active = await Election.find({ status: 'ongoing' });
            if (active.length > 0) return `Active elections right now: ${active.map(e => e.title).join(", ")}. Head to your Dashboard to vote!`;
            return "There are no live elections at the moment. Check back soon or see the Upcoming Elections section.";
        } catch { /* ignore */ }
    }

    if (matches(['upcoming', 'scheduled', 'next election', 'future'])) {
        try {
            const upcoming = await Election.find({ status: 'upcoming' });
            if (upcoming.length > 0) return `Upcoming elections: ${upcoming.map(e => e.title).join(", ")}.`;
            return "No upcoming elections are scheduled at the moment.";
        } catch { /* ignore */ }
    }

    if (matches(['how to vote', 'how do i vote', 'voting process', 'cast vote', 'steps'])) {
        return "To vote: 1) Go to Dashboard and select an election. 2) Enter your email/phone. 3) Verify with OTP. 4) Complete Face Matching. 5) Select your candidate and cast your vote.";
    }

    if (matches(['candidate', 'who is running', 'party', 'contestant'])) {
        try {
            const candidates = await Candidate.find({ isApproved: true }).populate('electionId');
            if (candidates.length > 0) return `Approved candidates: ${candidates.map(c => `${c.name} (${c.party || 'Independent'})`).join(", ")}.`;
            return "No approved candidates are listed yet.";
        } catch { /* ignore */ }
    }

    if (matches(['hi', 'hello', 'hey', 'good morning', 'good evening', 'greet'])) {
        return "Hello! I'm your Election Assistant. You can ask me about live elections, your voting status, candidates, or how to vote. How can I help?";
    }

    return "I'm your Election Assistant! Ask me about live elections, your voting status (share your email), candidates, the voting process, or portal security.";
};

router.post('/query', async (req, res) => {
    try {
        const { text, identifier, history } = req.body;
        if (!text || !text.trim()) {
            return res.status(400).json({ response: "Please type a message first." });
        }

        const response = await getBotResponse(text.trim(), identifier || null, history || []);
        res.json({ response });
    } catch (error) {
        console.error("Chatbot Route Error:", error);
        res.status(500).json({ response: "Sorry, I'm having trouble right now. Please try again in a moment." });
    }
});

router.get('/stream', async (req, res) => {
    const { text, identifier, history } = req.query;
    let chatHistory = [];
    try {
        chatHistory = history ? JSON.parse(history) : [];
    } catch (e) {
        console.error("Chatbot: Error parsing history:", e.message);
    }

    if (!text) {
        return res.status(400).send('Text is required');
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        const query = text.toLowerCase().trim();
        let userIdentifier = identifier;

        // --- 1. Extract Identifier ---
        const emailMatch = query.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/i);
        const phoneMatch = query.match(/(?:\+91|91)?\s?(\d{10})\b/);
        if (emailMatch) userIdentifier = emailMatch[0];
        else if (phoneMatch) userIdentifier = phoneMatch[1];

        // --- 2. Fetch Personal Vote Status ---
        let personalStatus = "No user identifier provided.";
        if (userIdentifier) {
            try {
                // Find user with flexible matching
                let user = null;
                if (userIdentifier.includes('@')) {
                    user = await User.findOne({ email: userIdentifier });
                } else {
                    const phoneRegex = new RegExp(userIdentifier.split('').join('\\s*'));
                    user = await User.findOne({ phone: phoneRegex });
                }

                if (user) {
                    const dbId = user.email || user.phone;
                    const votes = await Vote.find({ voterIdentifier: dbId }).populate('electionId');

                    if (votes && votes.length > 0) {
                        const votedElections = votes.map(v => v.electionId?.title || 'Unknown Election');
                        personalStatus = `The user "${user.name}" (${dbId}) HAS VOTED in: ${votedElections.map(e => `"${e}"`).join(", ")}.`;
                    } else {
                        personalStatus = `User "${user.name}" (${dbId}) is registered but HAS NOT voted yet.`;
                    }
                } else {
                    personalStatus = `No registered voter found for identifier: "${userIdentifier}".`;
                }
            } catch (dbErr) {
                personalStatus = "Could not fetch user status due to a database error.";
            }
        }

        // --- 3. Fetch Real-time Election Context ---
        let electionContext = "No election data available.";
        try {
            const activeElections = await Election.find({ status: 'ongoing' });
            const upcomingElections = await Election.find({ status: 'upcoming' });
            const completedElections = await Election.find({ status: 'ended' });
            const candidates = await Candidate.find({ isApproved: true }).populate('electionId');

            electionContext = `
LIVE SYSTEM DATA:
    - Active Elections: ${activeElections.length > 0 ? activeElections.map(e => `"${e.title}"`).join(", ") : "None"}
    - Upcoming Elections: ${upcomingElections.length > 0 ? upcomingElections.map(e => `"${e.title}"`).join(", ") : "None"}
    - Completed Elections: ${completedElections.slice(-3).map(e => `"${e.title}"`).join(", ") || "None"}
    - Candidates: ${candidates.length > 0 ? candidates.map(c => `${c.name} (${c.party || 'Independent'}) in "${c.electionId?.title || 'Unknown'}"`).join("; ") : "None"}
    - Voter Status: ${personalStatus}
    `.trim();
            console.log("Chatbot Stream: Context built.");
        } catch (ctxErr) {
            console.error("Chatbot Stream: Context error:", ctxErr.message);
        }

        // --- 4. History ---
        const formattedHistory = chatHistory
            .filter(m => m.text && m.sender)
            .map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text} `)
            .join('\n');

        const fullPrompt = `
You are "Election Assistant", the official AI for the DigiVote Portal of India.
        SYSTEM:
    - Be helpful, professional, and conversational.
- Use Markdown for formatting(bold, lists, etc.) to make responses readable.
- If asked about security, mention AES - 256, OTP, and Biometrics.
- Use LIVE SYSTEM DATA context provided below.

        CONTEXT:
${electionContext}

${formattedHistory ? `HISTORY:\n${formattedHistory}\n` : ''}
    User: ${text}
    Assistant: `.trim();

        if (geminiModel) {
            console.log("Chatbot Stream: Calling Gemini (Unary fallback for stability)...");
            // Using generateContent instead of generateContentStream for better stability in Node v24
            const result = await geminiModel.generateContent(fullPrompt);
            const responseText = result.response.text();

            if (responseText) {
                // Simulate streaming for UI compatibility
                const chunks = responseText.split(' ');
                for (let i = 0; i < chunks.length; i++) {
                    const chunk = chunks[i] + (i === chunks.length - 1 ? '' : ' ');
                    res.write(`data: ${JSON.stringify({ text: chunk })} \n\n`);
                    // Small delay to simulate stream
                    if (i % 5 === 0) await new Promise(r => setTimeout(r, 10));
                }
            }

            res.write('data: [DONE]\n\n');
            res.end();
        } else {
            // Fallback for no API key
            const fallbackResponse = "I'm currently running in limited mode. Please ask about elections or security.";
            res.write(`data: ${JSON.stringify({ text: fallbackResponse })} \n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
        }
    } catch (error) {
        console.error("Streaming Error:", error);
        res.write(`data: ${JSON.stringify({ error: "Something went wrong" })} \n\n`);
        res.end();
    }
});

module.exports = router;
