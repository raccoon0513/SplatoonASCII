import { useEffect, useRef, useState } from 'react';
import './App.css';

//////////////////////////////////////////////////////
//TODO : css 되돌리기
//TODO : 안나오는거 고치지
//////////////////////////////////////////////////////


const ASCII_CHARS = '@#S%?*+;:,._ ';
const widthFontCount = 100;
const heightFontCount = 50;
const BALL_COUNT = 5;

function App() {
  const canvasRef = useRef(null);
  const [asciiText, setAsciiText] = useState('');
  const [metaballs, setMetaballs] = useState([]);
  

  
  //글자 크기 구해서 canvas 사이즈 구하기
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = '10px Courier New'; // CSS와 동일한 폰트 설정 적용
  const metrics = ctx.measureText('M'); // 예시로 'M' 문자의 크기를 측정
  const [width, setWidth] = useState(metrics.width * (widthFontCount+1));
  const [height, setHeight] = useState((metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent)*(heightFontCount+1))

  useEffect(() => {
    // 초기 메타볼 생성
    const initialMetaballs = [];
    for (let i = 0; i < BALL_COUNT; i++) {
      initialMetaballs.push({
        x: Math.random() * widthFontCount,
        y: Math.random() * heightFontCount,
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
    canvas.width = width;
    canvas.height = height;
    
    let animationFrameId;

    const drawMetaballs = () => {
      ctx.clearRect(0, 0, widthFontCount, heightFontCount);
      
      const buffer = new Uint8ClampedArray(widthFontCount * heightFontCount * 4); // RGBA
      for (let y = 0; y < heightFontCount; y++) {
        for (let x = 0; x < widthFontCount; x++) {
          let sum = 0;
          for (const ball of metaballs) {
            const dx = x - ball.x;
            const dy = y - ball.y;
            sum += (ball.r * ball.r) / (dx * dx + dy * dy);
          }
          const colorValue = sum > 1 ? 255 : 0;
          const i = (y * widthFontCount + x) * 4;
          buffer[i] = colorValue;
          buffer[i + 1] = colorValue;
          buffer[i + 2] = colorValue;
          buffer[i + 3] = 255;
        }
      }
      
      const imageData = new ImageData(buffer, widthFontCount, heightFontCount);
      ctx.putImageData(imageData, 0, 0);
    };

    const convertToAscii = (imageData) => {
      let ascii = '';
      const data = imageData.data;
      for (let y = 0; y < heightFontCount; y++) {
        for (let x = 0; x < widthFontCount; x++) {
          const i = (y * widthFontCount + x) * 4;
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

        if (newBall.x < newBall.r || newBall.x > widthFontCount - newBall.r) newBall.vx *= -1;
        if (newBall.y < newBall.r || newBall.y > heightFontCount - newBall.r) newBall.vy *= -1;

        return newBall;
      }));

      drawMetaballs();

      const imageData = ctx.getImageData(0, 0, widthFontCount, heightFontCount);
      const newAsciiText = convertToAscii(imageData);
      setAsciiText(newAsciiText);
      
      
      animationFrameId = requestAnimationFrame(tick);
    };

    //TODO : tick 다시 시작하려면 주석 해제할 것(디버깅용)
    //animationFrameId = requestAnimationFrame(tick);

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