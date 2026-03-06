const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log('Server: Starting initialization...');
app.use(cors());
console.log('Server: CORS initialized');
app.use(express.json());
console.log('Server: JSON parser initialized');
app.use('/uploads', express.static('uploads')); // Serve uploaded files
console.log('Server: Static routes initialized');

// MongoDB Connection
// Note: Options like useNewUrlParser are no longer needed in Mongoose 6+
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/voting-app')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

app.get('/', (req, res) => {
    res.send('Voting App API is running...');
});

// Import Routes
console.log('Server: Importing routes...');
const authRoutes = require('./routes/auth');
const candidateRoutes = require('./routes/candidate');
const electionRoutes = require('./routes/election');
const voteRoutes = require('./routes/vote');
const adminRoutes = require('./routes/admin');
const chatbotRoutes = require('./routes/chatbot');
console.log('Server: Routes imported successfully');

app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', chatbotRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
