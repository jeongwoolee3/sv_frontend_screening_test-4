'use client';

import { useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Circle, Rect } from 'react-konva';

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
  MIN_BOUNCE_VELOCITY: 2,
};

interface BouncingBallCanvasProps {
  gravity: number;
  elasticity: number;
  isDropping: boolean;
  onDrop: () => void;
  onStop: () => void;
}

const BouncingBallCanvas: React.FC<BouncingBallCanvasProps> = ({
  gravity,
  elasticity,
  isDropping,
  onDrop,
  onStop,
}) => {
  const [y, setY] = useState(PHYSICS_CONFIG.INITIAL_Y);
  const [velocity, setVelocity] = useState(0);

  // 실험 초기화
  const reset = useCallback(() => {
    setY(PHYSICS_CONFIG.INITIAL_Y);
    setVelocity(0);
  }, []);

  // 외부에서 reset 함수를 호출할 수 있도록 노출
  useEffect(() => {
    if (!isDropping && y !== PHYSICS_CONFIG.INITIAL_Y) {
      reset();
    }
  }, [isDropping, reset, y]);

  // 물리 시뮬레이션
  useEffect(() => {
    if (!isDropping) return;

    const animate = () => {
      setVelocity((currentVelocity) => {
        const newVelocity =
          currentVelocity + gravity * PHYSICS_CONFIG.TIME_SCALE;

        setY((prevY) => {
          const deltaY =
            newVelocity *
            PHYSICS_CONFIG.TIME_SCALE *
            PHYSICS_CONFIG.PIXEL_PER_METER;
          const nextY = prevY + deltaY;
          const floorPosition =
            STAGE_CONFIG.FLOOR_Y - PHYSICS_CONFIG.BALL_RADIUS;

          // 바닥 충돌 검사
          if (nextY >= floorPosition && newVelocity > 0) {
            const bounceVelocity = -newVelocity * elasticity;

            // 최소 속도 이하면 정지
            if (Math.abs(bounceVelocity) < PHYSICS_CONFIG.MIN_BOUNCE_VELOCITY) {
              setVelocity(0);
              onStop();
              return floorPosition;
            }

            setVelocity(bounceVelocity);
            return floorPosition;
          }

          return Math.min(nextY, floorPosition);
        });

        return newVelocity;
      });
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [y, isDropping, gravity, velocity, elasticity, onStop]);

  return (
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
  );
};

export default BouncingBallCanvas;
