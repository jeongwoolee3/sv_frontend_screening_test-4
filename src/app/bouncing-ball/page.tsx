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
  const [isDropping, setIsDropping] = useState(false);
  const [gravityName, setGravityName] =
    useState<keyof typeof GRAVITY_PRESETS>('지구');

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
        {/* 왼쪽: Stage */}
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
            <Layer></Layer>
          </Stage>
        </div>

        {/* 오른쪽: 컨트롤 패널 */}
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
        </div>
      </div>
    </div>
  );
};

export default BouncingBallPage;
