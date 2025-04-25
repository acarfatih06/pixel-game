# Reddit Place Clone

A real-time collaborative pixel art canvas where users can place colored pixels with a cooldown period.

## Features

- 100x100 pixel canvas
- Real-time updates using Socket.IO
- Color palette selection
- 5-second cooldown between pixel placements
- Responsive design with Tailwind CSS

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd reddit-place
```

2. Install all dependencies:
```bash
npm run install-all
```

## Running the Application

To start both the server and client simultaneously:
```bash
npm start
```

This will:
- Start the server on http://localhost:5000
- Start the client on http://localhost:3000
- Open your default browser to http://localhost:3000

## Manual Start (Alternative)

If you prefer to start the server and client separately:

1. Start the server (in one terminal):
```bash
cd server
npm start
```

2. Start the client (in another terminal):
```bash
cd client
npm start
```

## Usage

1. Open http://localhost:3000 in your browser
2. Select a color from the palette
3. Click on any pixel to change its color
4. Wait 5 seconds before placing another pixel
5. Watch as other users' changes appear in real-time

## Technologies Used

- Frontend: React, Tailwind CSS, Socket.IO Client
- Backend: Node.js, Express, Socket.IO 