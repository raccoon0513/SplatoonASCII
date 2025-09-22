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
  // 이 변환 과정은 각 픽셀의 밝기(명도)를 계산한 후, 해당 밝기에 맞는 아스키 문자를 매핑하는 원리로 작동합니다.
  const convertToAscii = (imageData) => {
    let ascii = ''; // 최종 아스키 아트 문자열을 저장할 변수
    const data = imageData.data; // 캔버스의 모든 픽셀 데이터(1차원 RGBA 배열)
    
    // 캔버스의 모든 픽셀을 순회합니다.
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        // 현재 픽셀(x, y)의 RGBA 데이터 시작 인덱스를 계산합니다.
        // 각 픽셀은 4개의 값(R, G, B, A)을 가집니다.
        const i = (y * WIDTH + x) * 4;
        
        // 명도(Luminance)를 계산합니다.
        // 인간의 눈은 각 색상(R, G, B)을 다르게 인식하므로,
        // 이를 반영한 가중치 공식을 사용해 흑백 밝기 값을 얻습니다.
        // L = 0.299R + 0.587G + 0.114B
        const luminance = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
        
        // 계산된 명도 값(0~1)을 아스키 문자 배열의 인덱스로 변환합니다.
        // 명도가 낮을수록(어두울수록) 문자열의 앞쪽 문자(어두운 글자)를,
        // 명도가 높을수록(밝을수록) 문자열의 뒤쪽 문자(밝은 글자)를 선택합니다.
        const charIndex = Math.floor(luminance * (ASCII_CHARS.length - 1));
        
        // 변환된 문자를 아스키 아트 문자열에 추가합니다.
        ascii += ASCII_CHARS[charIndex];
      }
      // 한 줄의 픽셀 순회가 끝나면 줄 바꿈 문자를 추가합니다.
      ascii += '\n';
    }
    // 완성된 아스키 아트 문자열을 반환합니다.
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