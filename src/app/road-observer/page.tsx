'use client';

import React, { useState } from 'react';
import useRoadStream from '@/hooks/useRoadStream.hook';
import RoadObserver from '@/components/roadObserver/RoadObserver';

const RoadObserverPage = () => {
  const [isPaused, setIsPaused] = useState(false);
  const { road, isConnected, error, resetConnection } = useRoadStream(isPaused);

  const handleReconnect = () => {
    resetConnection();
    window.location.reload();
  };

  return (
    <div className="w-full h-screen bg-gray-100 flex flex-col">
      <div className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">도로 감시 시스템</h1>
          <p className="text-sm text-gray-600 mt-1">178도 시야각 차량 감시</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-xs text-gray-600">
              {isConnected ? '연결됨' : '연결 끊김'}
            </span>
          </div>

          <button
            onClick={() => setIsPaused(!isPaused)}
            disabled={!isConnected}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isPaused
                ? 'bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-400'
                : 'bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-400'
            } disabled:cursor-not-allowed`}
          >
            {isPaused ? '▶ 재생' : '⏸일시정지'}
          </button>

          {error && (
            <button
              onClick={handleReconnect}
              className="px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              재연결
            </button>
          )}

          <div className="text-sm text-gray-600">
            차량 수: {road?.vehicles.length || 0}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4 rounded">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 p-4 flex justify-center items-center">
        {isConnected || road ? (
          <RoadObserver road={road} />
        ) : (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">서버에 연결 중...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadObserverPage;
