const axios = require('axios');

async function testAPI() {
    try {
        console.log("Testing /api/elections...");
        const electionRes = await axios.get('http://localhost:5000/api/elections');
        console.log("Elections Status:", electionRes.status);
        console.log("Elections Data:", JSON.stringify(electionRes.data, null, 2));

        if (electionRes.data.length > 0) {
            const electionId = electionRes.data[0]._id;
            console.log(`\nTesting /api/votes/results/${electionId}...`);
            const resultsRes = await axios.get(`http://localhost:5000/api/votes/results/${electionId}`);
            console.log("Results Status:", resultsRes.status);
            console.log("Results Data:", JSON.stringify(resultsRes.data, null, 2));
        }
    } catch (error) {
        console.error("API Test Failed:", error.message);
        if (error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
        }
    }
}

testAPI();
