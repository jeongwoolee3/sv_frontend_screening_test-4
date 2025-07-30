'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Stage, Layer, Circle, Rect } from 'react-konva';

const GRAVITY_PRESETS = {
  지구: 9.8,
  달: 1.6,
  화성: 3.7,
} as const;

const STAGE_CONFIG = {
  WIDTH: 400,
  HEIGHT: 500,
  FLOOR_Y: 450,
} as const;

const PHYSICS_CONFIG = {
  TIME_SCALE: 0.05,
  PIXEL_PER_METER: 50,
  BALL_RADIUS: 20,
  INITIAL_Y: 80,
};

type GravityName = keyof typeof GRAVITY_PRESETS;

const BouncingBallPage = () => {
  const [y, setY] = useState(PHYSICS_CONFIG.INITIAL_Y);
  const [velocity, setVelocity] = useState(0);
  const [isDropping, setIsDropping] = useState(false);
  const [gravityName, setGravityName] = useState<GravityName>('지구');
  const pressTimestamps = useRef<number[]>([]);

  const gravity = GRAVITY_PRESETS[gravityName];

  const reset = useCallback(() => {
    setY(PHYSICS_CONFIG.INITIAL_Y);
    setVelocity(0);
    setIsDropping(false);
    pressTimestamps.current = [];
  }, []);

  const startDrop = useCallback(() => {
    if (!isDropping && y < STAGE_CONFIG.FLOOR_Y - PHYSICS_CONFIG.BALL_RADIUS) {
      setVelocity(0);
      setIsDropping(true);
    }
  }, [isDropping, y]);

  // 물리 시뮬레이션
  useEffect(() => {
    if (!isDropping) return;

    const animate = () => {
      setVelocity((v) => v + gravity * PHYSICS_CONFIG.TIME_SCALE);
      setY((prevY) => {
        const deltaY =
          velocity * PHYSICS_CONFIG.TIME_SCALE * PHYSICS_CONFIG.PIXEL_PER_METER;
        const nextY = prevY + deltaY;
        const floorPosition = STAGE_CONFIG.FLOOR_Y - PHYSICS_CONFIG.BALL_RADIUS;

        if (nextY >= floorPosition) {
          setIsDropping(false);
          return floorPosition;
        }
        return nextY;
      });
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [y, isDropping, gravity, velocity]);

  // 키보드 이벤트 핸들링
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;

      const now = Date.now();
      pressTimestamps.current.push(now);
      pressTimestamps.current = pressTimestamps.current.filter(
        (t) => now - t < 600
      );

      const pressCount = pressTimestamps.current.length;

      if (pressCount === 2) {
        startDrop();
      } else if (pressCount >= 3) {
        reset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startDrop, reset]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 p-10 font-sans flex flex-col">
      <h1 className="text-3xl font-bold text-gray-800 mb-10 text-center flex-shrink-0">
        중력 낙하 실험
      </h1>

      <div className="flex justify-center items-start gap-10 max-w-5xl mx-auto flex-1 min-h-0">
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-300 overflow-hidden flex-shrink-0">
          <Stage width={STAGE_CONFIG.WIDTH} height={STAGE_CONFIG.HEIGHT}>
            <Layer>
              <Rect
                x={0}
                y={0}
                width={STAGE_CONFIG.WIDTH}
                height={STAGE_CONFIG.FLOOR_Y}
                fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                fillLinearGradientEndPoint={{ x: 0, y: STAGE_CONFIG.FLOOR_Y }}
                fillLinearGradientColorStops={[0, '#87CEEB', 1, '#98FB98']}
              />
              <Rect
                x={0}
                y={STAGE_CONFIG.FLOOR_Y}
                width={STAGE_CONFIG.WIDTH}
                height={STAGE_CONFIG.HEIGHT - STAGE_CONFIG.FLOOR_Y}
                fill="#8B7355"
              />
              <Circle
                x={STAGE_CONFIG.WIDTH / 2}
                y={y}
                radius={PHYSICS_CONFIG.BALL_RADIUS}
                fill="#FF6B6B"
                shadowBlur={8}
                shadowColor="rgba(0,0,0,0.3)"
                stroke="#FF4444"
                strokeWidth={2}
              />
            </Layer>
          </Stage>
        </div>
        <div className="bg-white rounded-2xl p-6 min-w-80 max-w-80 shadow-lg border-2 border-gray-300 h-fit">
          <h3 className="text-xl font-semibold text-gray-800 mb-5 text-center">
            실험 설정
          </h3>

          <div className="mb-5">
            <label className="block text-gray-700 font-semibold mb-2">
              중력 환경 선택
            </label>
            <select
              value={gravityName}
              onChange={(e) => setGravityName(e.target.value as GravityName)}
              className="w-full p-3 text-gray-800 bg-white border-2 border-gray-300 rounded-lg cursor-pointer focus:border-blue-500 focus:outline-none transition-colors"
            >
              {Object.entries(GRAVITY_PRESETS).map(([name, g]) => (
                <option key={name} value={name}>
                  {name} (중력: {g} m/s²)
                </option>
              ))}
            </select>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
            <h4 className="font-semibold text-gray-800 mb-3">조작법</h4>
            <div className="text-gray-600 text-sm leading-relaxed space-y-1">
              <div>
                <span className="font-medium">스페이스바 2번:</span> 공
                떨어뜨리기
              </div>
              <div>
                <span className="font-medium">스페이스바 3번:</span> 실험 초기화
              </div>
            </div>
          </div>
          <div
            className={`p-3 rounded-lg text-center font-semibold transition-colors ${
              isDropping
                ? 'bg-red-50 text-red-800'
                : 'bg-green-50 text-green-800'
            }`}
          >
            {isDropping ? '🔴 낙하 중...' : '⚪ 대기 중'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BouncingBallPage;
