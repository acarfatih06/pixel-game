import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

const CANVAS_SIZE = 100;
const PIXEL_SIZE = 5; // Size of each pixel in pixels
const COLORS = [
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFFF00', // Yellow
  '#FFA500', // Orange
  '#800080', // Purple
  '#000000', // Black
  '#FFFFFF', // White
  '#808080', // Gray
  '#964B00', // Brown
];

function App() {
  const [canvas, setCanvas] = useState(Array(CANVAS_SIZE).fill().map(() => Array(CANVAS_SIZE).fill('#FFFFFF')));
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [cooldown, setCooldown] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const serverUrl = process.env.NODE_ENV === 'production'
      ? window.location.origin
      : 'http://localhost:5000';
    
    const newSocket = io(serverUrl);
    setSocket(newSocket);

    newSocket.on('canvas-update', (newCanvas) => {
      setCanvas(newCanvas);
    });

    newSocket.on('pixel-updated', ({ x, y, color }) => {
      setCanvas(prevCanvas => {
        const newCanvas = [...prevCanvas];
        newCanvas[y] = [...newCanvas[y]];
        newCanvas[y][x] = color;
        return newCanvas;
      });
    });

    newSocket.on('cooldown-start', (cooldownTime) => {
      setCooldown(cooldownTime);
      const interval = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1000) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    });

    newSocket.on('error', ({ message }) => {
      alert(message);
    });

    return () => newSocket.close();
  }, []);

  const handlePixelClick = useCallback((x, y) => {
    if (cooldown > 0 || !socket) return;
    socket.emit('place-pixel', { x, y, color: selectedColor });
  }, [selectedColor, cooldown, socket]);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-4">Pixel Game</h1>
        
        <div className="mb-6">
          <div className="flex flex-col gap-2 mx-auto" style={{ maxWidth: "fit-content" }}>
            <div className="flex justify-center gap-2">
              {COLORS.slice(0, 6).map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 ${selectedColor === color ? 'ring-[2.5px] ring-black shadow-lg' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
            <div className="flex justify-center gap-2">
              {COLORS.slice(6, 12).map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 ${selectedColor === color ? 'ring-[2.5px] ring-black shadow-lg' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>
        </div>

        {cooldown > 0 && (
          <div className="mb-4">
            <p className="text-center text-gray-600">
              Next pixel in: {cooldown / 1000}s
            </p>
          </div>
        )}

        <div 
          className="grid border border-gray-200 bg-white shadow-lg mx-auto"
          style={{
            gridTemplateColumns: `repeat(${CANVAS_SIZE}, ${PIXEL_SIZE}px)`,
            width: `${CANVAS_SIZE * PIXEL_SIZE}px`,
            height: `${CANVAS_SIZE * PIXEL_SIZE}px`,
            backgroundImage: 'linear-gradient(#ddd 1px, transparent 1px), linear-gradient(90deg, #ddd 1px, transparent 1px)',
            backgroundSize: `${PIXEL_SIZE}px ${PIXEL_SIZE}px`
          }}
        >
          {canvas.map((row, y) => 
            row.map((color, x) => (
              <div
                key={`${x}-${y}`}
                className="cursor-pointer hover:opacity-80"
                style={{ backgroundColor: color }}
                onClick={() => handlePixelClick(x, y)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App; 