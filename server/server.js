const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://pixel-game-app.onrender.com', 'http://pixel-game-app.onrender.com'] 
      : "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Canvas configuration
const CANVAS_SIZE = 100;
const PIXEL_COOLDOWN = 5000; // 5 seconds in milliseconds

// Store canvas state
let canvas = Array(CANVAS_SIZE).fill().map(() => Array(CANVAS_SIZE).fill('#FFFFFF'));
// Store user cooldowns
const userCooldowns = new Map();

// Initialize canvas with white background
function initializeCanvas() {
  canvas = Array(CANVAS_SIZE).fill().map(() => Array(CANVAS_SIZE).fill('#FFFFFF'));
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  // Send current canvas state to new client
  socket.emit('canvas-update', canvas);

  // Handle pixel placement
  socket.on('place-pixel', ({ x, y, color }) => {
    const userId = socket.id;
    const now = Date.now();
    const lastPlacement = userCooldowns.get(userId) || 0;

    if (now - lastPlacement < PIXEL_COOLDOWN) {
      socket.emit('error', { message: 'Please wait before placing another pixel' });
      return;
    }

    if (x >= 0 && x < CANVAS_SIZE && y >= 0 && y < CANVAS_SIZE) {
      canvas[y][x] = color;
      userCooldowns.set(userId, now);
      
      // Broadcast the update to all clients
      io.emit('pixel-updated', { x, y, color });
      socket.emit('cooldown-start', PIXEL_COOLDOWN);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// API endpoint to get canvas state
app.get('/api/canvas', (req, res) => {
  res.json(canvas);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 