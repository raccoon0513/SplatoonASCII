import { useEffect, useRef, useState } from 'react';
import './App.css';

const ASCII_CHARS = '@#S%?*+;:,._ ';
const WIDTH = 100;
const HEIGHT = 50;
const BALL_COUNT = 5;

function App() {
  const canvasRef = useRef(null);
  const [asciiText, setAsciiText] = useState('');
  const [metaballs, setMetaballs] = useState([]);

  useEffect(() => {
    // 초기 메타볼 생성
    const initialMetaballs = [];
    for (let i = 0; i < BALL_COUNT; i++) {
      initialMetaballs.push({
        x: Math.random() * WIDTH,
        y: Math.random() * HEIGHT,
        r: 5 + Math.random() * 5,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      });
    }
    setMetaballs(initialMetaballs);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || metaballs.length === 0) return;

    const ctx = canvas.getContext('2d');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    
    let animationFrameId;

    const drawMetaballs = () => {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      
      const buffer = new Uint8ClampedArray(WIDTH * HEIGHT * 4); // RGBA
      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          let sum = 0;
          for (const ball of metaballs) {
            const dx = x - ball.x;
            const dy = y - ball.y;
            sum += (ball.r * ball.r) / (dx * dx + dy * dy);
          }
          const colorValue = sum > 1 ? 255 : 0;
          const i = (y * WIDTH + x) * 4;
          buffer[i] = colorValue;
          buffer[i + 1] = colorValue;
          buffer[i + 2] = colorValue;
          buffer[i + 3] = 255;
        }
      }
      
      const imageData = new ImageData(buffer, WIDTH, HEIGHT);
      ctx.putImageData(imageData, 0, 0);
    };

    const convertToAscii = (imageData) => {
      let ascii = '';
      const data = imageData.data;
      for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
          const i = (y * WIDTH + x) * 4;
          // 명도 계산
          const luminance = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
          const charIndex = Math.floor(luminance * (ASCII_CHARS.length - 1));
          ascii += ASCII_CHARS[charIndex];
        }
        ascii += '\n';
      }
      return ascii;
    };
    
    const tick = () => {
      // 메타볼 위치 업데이트 및 경계 충돌 처리
      setMetaballs(prevMetaballs => prevMetaballs.map(ball => {
        const newBall = { ...ball };
        newBall.x += newBall.vx;
        newBall.y += newBall.vy;

        if (newBall.x < newBall.r || newBall.x > WIDTH - newBall.r) newBall.vx *= -1;
        if (newBall.y < newBall.r || newBall.y > HEIGHT - newBall.r) newBall.vy *= -1;

        return newBall;
      }));

      drawMetaballs();

      const imageData = ctx.getImageData(0, 0, WIDTH, HEIGHT);
      const newAsciiText = convertToAscii(imageData);
      setAsciiText(newAsciiText);
      
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [metaballs]);

  return (
    <div className="App">
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
      <pre>{asciiText}</pre>
    </div>
  );
}

export default App;