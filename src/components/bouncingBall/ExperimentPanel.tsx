'use client';

import React from 'react';

const GRAVITY_PRESETS = {
  지구: 9.8,
  달: 1.6,
  화성: 3.7,
} as const;

const ELASTICITY_PRESETS = {
  고무공: 0.9,
  테니스공: 0.7,
  농구공: 0.8,
  탁구공: 0.85,
  점토: 0.1,
} as const;

type GravityName = keyof typeof GRAVITY_PRESETS;
type ElasticityName = keyof typeof ELASTICITY_PRESETS;

interface ExperimentPanelProps {
  gravityName: GravityName;
  elasticityName: ElasticityName;
  isDropping: boolean;
  onGravityChange: (gravity: GravityName) => void;
  onElasticityChange: (elasticity: ElasticityName) => void;
}

const ExperimentPanel: React.FC<ExperimentPanelProps> = ({
  gravityName,
  elasticityName,
  isDropping,
  onGravityChange,
  onElasticityChange,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 min-w-80 max-w-80 shadow-lg border-2 border-gray-300 h-fit">
      <h3 className="text-xl font-semibold text-gray-800 mb-5 text-center">
        실험 설정
      </h3>

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">
          중력 환경 선택
        </label>
        <select
          value={gravityName}
          onChange={(e) => onGravityChange(e.target.value as GravityName)}
          className="w-full p-3 text-gray-800 bg-white border-2 border-gray-300 rounded-lg cursor-pointer focus:border-blue-500 focus:outline-none transition-colors"
        >
          {Object.entries(GRAVITY_PRESETS).map(([name, g]) => (
            <option key={name} value={name}>
              {name} (중력: {g} m/s²)
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5">
        <label className="block text-gray-700 font-semibold mb-2">
          공의 재질 선택
        </label>
        <select
          value={elasticityName}
          onChange={(e) => onElasticityChange(e.target.value as ElasticityName)}
          className="w-full p-3 text-gray-800 bg-white border-2 border-gray-300 rounded-lg cursor-pointer focus:border-blue-500 focus:outline-none transition-colors"
        >
          {Object.entries(ELASTICITY_PRESETS).map(([name, coeff]) => (
            <option key={name} value={name}>
              {name} (탄성: {coeff})
            </option>
          ))}
        </select>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
        <h4 className="font-semibold text-gray-800 mb-3">조작법</h4>
        <div className="text-gray-600 text-sm leading-relaxed space-y-1">
          <div>
            <span className="font-medium">스페이스바 2번:</span> 공 떨어뜨리기
          </div>
          <div>
            <span className="font-medium">스페이스바 3번:</span> 실험 초기화
          </div>
        </div>
      </div>

      <div
        className={`p-3 rounded-lg text-center font-semibold transition-colors ${
          isDropping ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
        }`}
      >
        {isDropping ? '🔴 낙하 중...' : '⚪ 대기 중'}
      </div>
    </div>
  );
};

export { GRAVITY_PRESETS, ELASTICITY_PRESETS };
export type { GravityName, ElasticityName };
export default ExperimentPanel;
