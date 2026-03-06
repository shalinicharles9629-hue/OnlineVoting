const axios = require('axios');

async function verify() {
    const electionId = '6994d2951a8075576b36537d';
    try {
        const res = await axios.get(`http://localhost:5000/api/votes/results/${electionId}`);
        console.log('Status Code:', res.status);
        console.log('Total Votes:', res.data.totalVotes);
        console.log('Results Array Length:', res.data.results.length);
        console.log('Message:', res.data.message);
    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
}

verify();
