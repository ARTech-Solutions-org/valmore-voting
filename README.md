# Valmore Holding — Live Voting System

## 🖥️ Local Development

```bash
npm install
node server.js
```

Then open:
- **Display Screen**: http://localhost:3000/
- **Vote Page**: http://localhost:3000/vote

---

## 🚀 Vercel Deployment Notes

> ⚠️ **Important**: Vercel Serverless Functions don't support persistent WebSocket connections.  
> For production on Vercel, you need to replace WebSocket with **polling** or use a service like:
> - [Ably](https://ably.com/) — Realtime messaging
> - [Pusher](https://pusher.com/) — WebSockets as a service  
> - [Railway](https://railway.app/) — Deploy the Node.js server directly (recommended)
> - [Render](https://render.com/) — Free tier persistent servers

### Recommended: Deploy on Railway (supports WebSockets natively)
1. Push code to GitHub
2. Connect Railway to your repo
3. Railway will auto-detect Node.js and deploy
4. Your WebSocket connections will work perfectly

---

## 📁 Project Structure

```
valmore-voting/
├── server.js        # Express + WebSocket backend
├── display.html     # 1152×768 Live Results Screen (QR + Progress bars)
├── vote.html        # Mobile Voting Page (23 options)
├── BGG.jpg          # Background image
├── logo.png         # Valmore Holding logo
├── package.json
└── vercel.json
```

## ✨ Features

- **Real-time** vote updates via WebSocket
- **One vote per device** (tracked by localStorage device ID)
- **Live progress bars** with smooth CSS animations
- **Rank highlighting**: Gold 🥇, Silver 🥈, Bronze 🥉
- **QR Code** auto-generated from server URL
- **Reset button** with confirmation modal
- **Responsive** — works on all screen sizes
