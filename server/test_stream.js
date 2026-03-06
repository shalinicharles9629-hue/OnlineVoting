const http = require('http');

async function testStream() {
    console.log("Testing Chatbot Stream...");

    http.get('http://localhost:5000/api/chatbot/stream?text=How%20to%20vote?', (res) => {
        let fullText = "";
        res.on('data', (chunk) => {
            const str = chunk.toString();
            console.log("Chunk received:", str.substring(0, 50) + "...");
            const lines = str.split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const dataStr = line.slice(6).trim();
                    if (dataStr === '[DONE]') {
                        console.log("\n[Stream Finished]");
                        console.log("Full response length:", fullText.length);
                        process.exit(0);
                    }
                    try {
                        const data = JSON.parse(dataStr);
                        if (data.text) fullText += data.text;
                    } catch (e) { }
                }
            }
        });

        res.on('end', () => {
            console.log("Response stream closed.");
        });
    }).on('error', (err) => {
        console.error("Error:", err.message);
        process.exit(1);
    });
}

testStream();
