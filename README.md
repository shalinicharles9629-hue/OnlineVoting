# Online Voting Application

A complete MERN Stack (MongoDB, Express, React, Node.js) online voting system.

## Features
- **Authentication**: Secure Login/Register with JWT (Voter, Candidate, Admin).
- **Dashboard**: Role-based dashboards.
- **Voting**: Secure voting mechanism (one vote per user per election).
- **Results**: Live election results with visual bars.
- **Candidate Application**: Candidates can apply and upload their manifesto/photo.
- **Admin**: Create elections (via API/Postman currently or Admin Dashboard if enabled).

## Prerequisites
- Node.js installed.
- MongoDB installed and running locally on default port `27017` OR update `MONGO_URI` in `server/.env`.

## Installation

### 1. Backend Setup
```bash
cd server
npm install
# Create .env file if not exists (see .env.example or below)
# PORT=5000
# MONGO_URI=mongodb://127.0.0.1:27017/voting-app
# JWT_SECRET=your_jwt_secret
npm start
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```

## Usage
1. Open `http://localhost:5173` (or port shown by Vite).
2. Register a user (default role is 'voter').
3. To create an admin, you can manually update the user role in MongoDB to `admin`, or register via API with `role: 'admin'` (if endpoint allows).
4. As Admin, call API `/api/elections/create` (via Postman) to create an election.
5. As Candidate, register and apply for an election.
6. As Voter, log in and cast your vote.
