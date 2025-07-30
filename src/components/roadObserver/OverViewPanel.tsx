import React from 'react';
import { VisionAnalysis, VisionStatus } from '@/types/road-observer.type';
import { ROAD_WIDTH, ROAD_LENGTH } from '@/consts/road-observer.const';
import OverviewSection from './overviewPanel/OverViewSection';
import OverviewItem from './overviewPanel/OverviewItem';
import OverviewBulletItem from './overviewPanel/OverviewBulletItem';

interface ObserverOverviewPanelProps {
  analysis: VisionAnalysis;
}

const ObserverOverviewPanel: React.FC<ObserverOverviewPanelProps> = ({
  analysis,
}) => {
  const counts: Record<VisionStatus, number> = {
    [VisionStatus.FULLY_VISIBLE]: 0,
    [VisionStatus.FULLY_HIDDEN]: 0,
    [VisionStatus.PARTIALLY_VISIBLE]: 0,
  };

  analysis.vehicles.forEach((v) => {
    counts[v.visionStatus]++;
  });

  return (
    <div className="flex gap-6">
      <OverviewSection title="차량 상태">
        <div className="grid grid-cols-2 gap-3">
          <OverviewItem
            color="#22c55e"
            bgColor="bg-green-50"
            label="완전히 시야각 내"
            count={counts[VisionStatus.FULLY_VISIBLE]}
          />
          <OverviewItem
            color="#ef4444"
            bgColor="bg-red-50"
            label="완전히 시야각 외"
            count={counts[VisionStatus.FULLY_HIDDEN]}
          />
          <OverviewItem
            color="#3b82f6"
            bgColor="bg-blue-50"
            label="부분적으로 시야각 내"
            count={counts[VisionStatus.PARTIALLY_VISIBLE]}
          />
          <OverviewItem
            color="#eab308"
            bgColor="bg-yellow-50"
            label="감시 차량"
            count={1}
          />
        </div>
      </OverviewSection>

      <OverviewSection title="도로 정보">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">도로 크기:</span>
            <span className="font-medium">
              {ROAD_WIDTH} × {ROAD_LENGTH} px
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">관찰자 위치:</span>
            <span className="font-medium">
              ({analysis.observer.position.x.toFixed(1)},{' '}
              {analysis.observer.position.y.toFixed(1)})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">시야각:</span>
            <span className="font-medium">{analysis.observer.fov}°</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">총 차량 수:</span>
            <span className="font-medium text-gray-600">
              {analysis.vehicles.length}대
            </span>
          </div>
        </div>
      </OverviewSection>

      <OverviewSection title="조작법">
        <ul className="text-sm text-gray-600 space-y-1">
          <OverviewBulletItem>
            일시정지 버튼으로 시뮬레이션 제어
          </OverviewBulletItem>
          <OverviewBulletItem>주황색 선은 178도 시야각 범위</OverviewBulletItem>
        </ul>
      </OverviewSection>
    </div>
  );
};

export default ObserverOverviewPanel;
