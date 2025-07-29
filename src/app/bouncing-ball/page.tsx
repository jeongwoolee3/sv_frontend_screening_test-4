'use client';

import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Circle, Rect, Text } from 'react-konva';

const GRAVITY_PRESETS = {
  지구: 9.8,
  달: 1.6,
  화성: 3.7,
};

const STAGE_WIDTH = 400;
const STAGE_HEIGHT = 500;
const FLOOR_Y = 450;

const BouncingBallPage = () => {
  const [y, setY] = useState(80);
  const [velocity, setVelocity] = useState(0);
  const [isDropping, setIsDropping] = useState(false);
  const [gravityName, setGravityName] =
    useState<keyof typeof GRAVITY_PRESETS>('지구');
  const pressTimestamps = useRef<number[]>([]);

  const gravity = GRAVITY_PRESETS[gravityName];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;

      const now = Date.now();
      pressTimestamps.current.push(now);
      pressTimestamps.current = pressTimestamps.current.filter(
        (t) => now - t < 600
      );
      const count = pressTimestamps.current.length;

      if (count === 2) {
        if (!isDropping && y < FLOOR_Y - 20) {
          setVelocity(0);
          setIsDropping(true);
        }
      } else if (count >= 3) {
        reset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDropping, y]);

  const reset = () => {
    setY(80);
    setVelocity(0);
    setIsDropping(false);
    pressTimestamps.current = [];
  };

  return (
    <div
      style={{
        textAlign: 'center',
        userSelect: 'none',
        background: 'linear-gradient(to bottom, #f0f8ff 0%, #f5f5f5 100%)',
        height: '100vh',
        padding: '40px 20px',
        fontFamily: 'Arial, sans-serif',
        boxSizing: 'border-box',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h1
        style={{
          color: '#333',
          fontSize: '1.8em',
          marginBottom: '40px',
          flexShrink: 0,
        }}
      >
        중력 낙하 실험
      </h1>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: '40px',
          maxWidth: '900px',
          margin: '0 auto',
          flex: 1,
          minHeight: 0,
        }}
      >
        <div
          style={{
            display: 'inline-block',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '2px solid #ddd',
            flexShrink: 0,
          }}
        >
          <Stage
            width={STAGE_WIDTH}
            height={STAGE_HEIGHT}
            style={{
              background:
                'linear-gradient(to bottom, #87CEEB 0%, #98FB98 100%)',
            }}
          >
            <Layer>
              <Rect
                x={0}
                y={0}
                width={STAGE_WIDTH}
                height={FLOOR_Y}
                fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                fillLinearGradientEndPoint={{ x: 0, y: FLOOR_Y }}
                fillLinearGradientColorStops={[0, '#87CEEB', 1, '#98FB98']}
              />

              <Rect
                x={0}
                y={FLOOR_Y}
                width={STAGE_WIDTH}
                height={STAGE_HEIGHT - FLOOR_Y}
                fill="#8B7355"
              />
              <Circle
                x={STAGE_WIDTH / 2}
                y={y}
                radius={20}
                fill="#FF6B6B"
                shadowBlur={8}
                shadowColor="rgba(0,0,0,0.3)"
                stroke="#FF4444"
                strokeWidth={2}
              />
            </Layer>
          </Stage>
        </div>
        <div
          style={{
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            minWidth: '280px',
            maxWidth: '320px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '2px solid #ddd',
            textAlign: 'left',
            height: 'fit-content',
            maxHeight: `${STAGE_HEIGHT}px`,
            overflow: 'auto',
          }}
        >
          <h3
            style={{
              color: '#333',
              fontSize: '1.3em',
              margin: '0 0 20px 0',
              textAlign: 'center',
            }}
          >
            실험 설정
          </h3>

          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                color: '#555',
                fontSize: '1em',
                fontWeight: 'bold',
                marginBottom: '8px',
              }}
            >
              중력 환경 선택
            </label>

            <select
              value={gravityName}
              onChange={(e) =>
                setGravityName(e.target.value as keyof typeof GRAVITY_PRESETS)
              }
              style={{
                width: '100%',
                fontSize: '1em',
                padding: '10px',
                borderRadius: '8px',
                border: '2px solid #ddd',
                background: 'white',
                color: '#333',
                cursor: 'pointer',
              }}
            >
              {Object.entries(GRAVITY_PRESETS).map(([name, g]) => (
                <option key={name} value={name}>
                  {name} (중력: {g} m/s²)
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              background: '#f8f9fa',
              borderRadius: '10px',
              padding: '15px',
              border: '1px solid #e9ecef',
              marginBottom: '15px',
            }}
          >
            <h4
              style={{
                color: '#333',
                margin: '0 0 12px 0',
                fontSize: '1em',
              }}
            >
              조작법
            </h4>

            <div
              style={{
                color: '#666',
                lineHeight: '1.5',
                fontSize: '0.9em',
              }}
            >
              <div style={{ marginBottom: '6px' }}>
                <strong>스페이스바 2번:</strong> 공 떨어뜨리기
              </div>
              <div>
                <strong>스페이스바 3번:</strong> 실험 초기화
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '12px',
              background: isDropping ? '#ffebee' : '#e8f5e8',
              borderRadius: '8px',
              textAlign: 'center',
              color: isDropping ? '#c62828' : '#2e7d32',
              fontWeight: 'bold',
              fontSize: '0.95em',
            }}
          >
            {isDropping ? ' 낙하 중...' : '대기 중'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BouncingBallPage;
