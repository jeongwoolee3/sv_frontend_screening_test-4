'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import BouncingBallCanvas from '@/components/bouncingBall/BouncingBallCanvas';
import ExperimentPanel, {
  GRAVITY_PRESETS,
  ELASTICITY_PRESETS,
  type GravityName,
  type ElasticityName,
} from '@/components/bouncingBall/ExperimentPanel';

const BouncingBallPage = () => {
  const [isDropping, setIsDropping] = useState(false);
  const [gravityName, setGravityName] = useState<GravityName>('지구');
  const [elasticityName, setElasticityName] =
    useState<ElasticityName>('고무공');
  const pressTimestamps = useRef<number[]>([]);

  const gravity = GRAVITY_PRESETS[gravityName];
  const elasticity = ELASTICITY_PRESETS[elasticityName];

  const reset = useCallback(() => {
    setIsDropping(false);
    pressTimestamps.current = [];
  }, []);

  const startDrop = useCallback(() => {
    if (!isDropping) {
      setIsDropping(true);
    }
  }, [isDropping]);

  const stopDrop = useCallback(() => {
    setIsDropping(false);
  }, []);

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
        <BouncingBallCanvas
          gravity={gravity}
          elasticity={elasticity}
          isDropping={isDropping}
          onDrop={startDrop}
          onStop={stopDrop}
        />

        <ExperimentPanel
          gravityName={gravityName}
          elasticityName={elasticityName}
          isDropping={isDropping}
          onGravityChange={setGravityName}
          onElasticityChange={setElasticityName}
        />
      </div>
    </div>
  );
};

export default BouncingBallPage;
