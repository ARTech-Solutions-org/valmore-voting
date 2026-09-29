const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

// ─── State ─────────────────────────────────────────────────────────────────
const options = [
  'Passion', 'Commitment', 'Positivity', 'Energy', 'Ambition',
  'Determination', 'Teamwork', 'Trust', 'Loyalty', 'Innovation',
  'Experience', 'Creativity', 'Growth', 'Progress', 'Optimism',
  'Achievement', 'Happiness', 'New Ideas', 'Collaboration', 'Alignment',
  'Engagement', 'Ownership', 'Safety'
];

let votes = {};
options.forEach(o => votes[o] = 0);

let votedDevices = new Set(); // track device IDs that already voted
let totalVoters = 0;

app.use(express.json());

// ─── Routes ────────────────────────────────────────────────────────────────

// Check if device has voted
app.post('/api/check-device', (req, res) => {
  const { deviceId } = req.body;
  res.json({ hasVoted: votedDevices.has(deviceId) });
});

// Submit vote
app.post('/api/vote', (req, res) => {
  const { deviceId, choice } = req.body;

  if (!deviceId || !choice) {
    return res.status(400).json({ success: false, message: 'Missing deviceId or choice' });
  }

  if (votedDevices.has(deviceId)) {
    return res.status(403).json({ success: false, message: 'Already voted' });
  }

  if (!votes.hasOwnProperty(choice)) {
    return res.status(400).json({ success: false, message: 'Invalid choice' });
  }

  votes[choice]++;
  votedDevices.add(deviceId);
  totalVoters++;

  res.json({ success: true });
});

// Reset votes (admin)
app.post('/api/reset', (req, res) => {
  options.forEach(o => votes[o] = 0);
  votedDevices.clear();
  totalVoters = 0;

  res.json({ success: true });
});

// Get current state
app.get('/api/state', (req, res) => {
  res.json({ votes, totalVoters, options });
});

// ─── Export for Vercel ─────────────────────────────────────────────────────
module.exports = app;
