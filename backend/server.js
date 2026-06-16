require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const db = require('./db/database');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

app.set('io', io);

app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.use('/api/donations', require('./routes/donations'));
app.use('/api/settings', require('./routes/settings'));

// Overlay pages
app.get('/overlay/alert', (req, res) => res.sendFile(path.join(__dirname, 'overlay-alert.html')));
app.get('/overlay/top', (req, res) => res.sendFile(path.join(__dirname, 'overlay-top.html')));
app.get('/overlay/goal', (req, res) => res.sendFile(path.join(__dirname, 'overlay-goal.html')));

// Socket.io
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-room', async ({ room, token }) => {
    if (room === 'admin') {
      socket.join('admin');
      return;
    }
    try {
      await db.ready;
      const record = await db.get('SELECT token FROM overlay_tokens WHERE type = ?', [room]);
      if (record && record.token === token) {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room: ${room}`);
      } else {
        socket.emit('error', { message: 'Invalid token' });
      }
    } catch (err) {
      console.error(err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Donation server running on http://localhost:${PORT}`);
});