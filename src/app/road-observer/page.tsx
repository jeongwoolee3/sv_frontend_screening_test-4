'use client';

import React, { useState } from 'react';
import useRoadStream from '@/hooks/useRoadStream.hook';
import RoadObserver from '@/components/RoadObserver';

const RoadObserverPage = () => {
  const [isPaused, setIsPaused] = useState(false);
  const { road } = useRoadStream(isPaused);

  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col">
      <div className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">도로 감시 시스템</h1>
          <p className="text-sm text-gray-600 mt-1">
            178도 시야각 차량 감시 - React Konva 구현
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isPaused
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            {isPaused ? '▶️ 재생' : '⏸️ 일시정지'}
          </button>

          <div className="text-sm text-gray-600">
            차량 수: {road?.vehicles.length || 0}
          </div>
        </div>
      </div>
      <div className="flex-1 p-4 flex justify-center items-center">
        <RoadObserver road={road} />
      </div>
    </div>
  );
};

export default RoadObserverPage;
