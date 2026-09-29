const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { Redis } = require('@upstash/redis');

let redis = null;
if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  try {
    redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
    console.log("✅ Upstash Redis is configured.");
  } catch (e) {
    console.log("⚠️ Upstash Redis connection failed.", e);
  }
} else {
  console.log("⚠️ Upstash Redis env variables missing. Using temporary memory state.");
}

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

// ─── Static files ──────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// ─── Routes ────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/vote', (req, res) => {
  res.sendFile(path.join(__dirname, 'vote.html'));
});

// ─── API Routes ────────────────────────────────────────────────────────────

app.post('/api/check-device', async (req, res) => {
  const { deviceId } = req.body;
  if (!deviceId) return res.json({ hasVoted: false });
  
  if (redis) {
    const hasVoted = await redis.sismember('votedDevices', deviceId);
    return res.json({ hasVoted: !!hasVoted });
  }
  res.json({ hasVoted: votedDevices.has(deviceId) });
});

app.post('/api/vote', async (req, res) => {
  const { deviceId, choice } = req.body;
  if (!deviceId || !choice) return res.status(400).json({ success: false, message: 'Missing deviceId or choice' });
  if (!options.includes(choice)) return res.status(400).json({ success: false, message: 'Invalid choice' });

  if (redis) {
    const isMember = await redis.sismember('votedDevices', deviceId);
    if (isMember) return res.status(403).json({ success: false, message: 'Already voted' });
    
    await redis.hincrby('votes', choice, 1);
    await redis.sadd('votedDevices', deviceId);
    return res.json({ success: true });
  }

  if (votedDevices.has(deviceId)) return res.status(403).json({ success: false, message: 'Already voted' });
  votes[choice]++;
  votedDevices.add(deviceId);
  totalVoters++;
  res.json({ success: true });
});

app.post('/api/reset', async (req, res) => {
  if (redis) {
    await redis.del('votes');
    await redis.del('votedDevices');
  } else {
    options.forEach(o => votes[o] = 0);
    votedDevices.clear();
    totalVoters = 0;
  }
  res.json({ success: true });
});

app.get('/api/state', async (req, res) => {
  if (redis) {
    const redisVotes = await redis.hgetall('votes') || {};
    const count = await redis.scard('votedDevices') || 0;
    
    // Ensure all options exist in the returned object
    let currentVotes = {};
    options.forEach(o => {
      currentVotes[o] = parseInt(redisVotes[o] || 0, 10);
    });
    return res.json({ votes: currentVotes, totalVoters: count, options });
  }
  res.json({ votes, totalVoters, options });
});

// ─── Export for Vercel ─────────────────────────────────────────────────────
module.exports = app;
