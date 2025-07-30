'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Stage, Layer, Rect, Line, Text, Group } from 'react-konva';
import {
  Road,
  AnalyzedVehicle,
  VisionStatus,
} from '@/types/road-observer.type';
import { analyzeRoadVision } from '@/utils/vision-analyzer';
import { ROAD_WIDTH, ROAD_LENGTH } from '@/consts/road-observer.const';
import ObserverOverviewPanel from './OverViewPanel';

interface RoadObserverProps {
  road: Road | null;
}

const CANVAS_WIDTH = 880;
const CANVAS_HEIGHT = 80;

const RoadObserver: React.FC<RoadObserverProps> = ({ road }) => {
  const [selectedVehicle, setSelectedVehicle] =
    useState<AnalyzedVehicle | null>(null);
  const [popupPosition, setPopupPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const analysis = useMemo(() => {
    if (!road) return null;
    return analyzeRoadVision(road.vehicles, road.observer, road.length);
  }, [road]);

  const getVehicleColor = useCallback((vehicle: AnalyzedVehicle): string => {
    switch (vehicle.visionStatus) {
      case VisionStatus.FULLY_VISIBLE:
        return '#00FF00';
      case VisionStatus.FULLY_HIDDEN:
        return '#FF0000';
      case VisionStatus.PARTIALLY_VISIBLE:
        return '#0000FF';
      default:
        return '#888888';
    }
  }, []);

  const getVehicleOpacity = useCallback((vehicle: AnalyzedVehicle): number => {
    if (vehicle.visionStatus === VisionStatus.PARTIALLY_VISIBLE) {
      return Math.max(0.3, vehicle.visibilityRatio);
    }
    return 1.0;
  }, []);

  const handleVehicleClick = useCallback(
    (vehicle: AnalyzedVehicle, event: any) => {
      const stage = event.target.getStage();
      const pointerPosition = stage.getPointerPosition();

      if (pointerPosition) {
        setSelectedVehicle(vehicle);
        setPopupPosition({
          x: pointerPosition.x,
          y: pointerPosition.y,
        });
      }
    },
    []
  );

  const handleStageClick = useCallback((event: any) => {
    if (event.target === event.target.getStage()) {
      setSelectedVehicle(null);
      setPopupPosition(null);
    }
  }, []);

  const getVisionStatusText = useCallback((status: VisionStatus): string => {
    switch (status) {
      case VisionStatus.FULLY_VISIBLE:
        return '완전히 보임';
      case VisionStatus.FULLY_HIDDEN:
        return '완전히 숨겨짐';
      case VisionStatus.PARTIALLY_VISIBLE:
        return '부분적으로 보임';
      default:
        return '알 수 없음';
    }
  }, []);

  if (!analysis) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">도로 데이터를 로딩 중...</p>
        </div>
      </div>
    );
  }
  const obs = analysis.observer;
  const x = 50 + (obs.position.y - obs.length / 2);
  const y = (CANVAS_HEIGHT - ROAD_WIDTH) / 2 + (obs.position.x - obs.width / 2);
  const width = obs.length;
  const height = obs.width;

  return (
    <div className="flex flex-col w-full h-full p-6 gap-6">
      <div className="flex justify-center items-center flex-1">
        <div className="relative">
          <Stage
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-2 border-gray-300 rounded-lg shadow-lg bg-white"
            onClick={handleStageClick}
          >
            <Layer>
              <Rect
                x={0}
                y={0}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                fill="#f8f9fa"
              />
              <Rect
                x={50}
                y={(CANVAS_HEIGHT - ROAD_WIDTH) / 2}
                width={ROAD_LENGTH}
                height={ROAD_WIDTH}
                fill="#444444"
                stroke="#333333"
                strokeWidth={2}
              />

              <Line
                points={[
                  50,
                  CANVAS_HEIGHT / 2,
                  50 + ROAD_LENGTH,
                  CANVAS_HEIGHT / 2,
                ]}
                stroke="#FFFFFF"
                strokeWidth={2}
                dash={[15, 8]}
              />
              {analysis.fovLines && (
                <Group>
                  <Line
                    points={[
                      50 + analysis.fovLines.leftBoundary.start.y,
                      (CANVAS_HEIGHT - ROAD_WIDTH) / 2 +
                        analysis.fovLines.leftBoundary.start.x,
                      50 + analysis.fovLines.leftBoundary.end.y,
                      (CANVAS_HEIGHT - ROAD_WIDTH) / 2 +
                        analysis.fovLines.leftBoundary.end.x,
                    ]}
                    stroke="#FF8800"
                    strokeWidth={3}
                    opacity={0.8}
                  />

                  <Line
                    points={[
                      50 + analysis.fovLines.rightBoundary.start.y,
                      (CANVAS_HEIGHT - ROAD_WIDTH) / 2 +
                        analysis.fovLines.rightBoundary.start.x,
                      50 + analysis.fovLines.rightBoundary.end.y,
                      (CANVAS_HEIGHT - ROAD_WIDTH) / 2 +
                        analysis.fovLines.rightBoundary.end.x,
                    ]}
                    stroke="#FF8800"
                    strokeWidth={3}
                    opacity={0.8}
                  />
                </Group>
              )}

              {analysis.vehicles.map((vehicle) => (
                <Rect
                  key={vehicle.id}
                  x={50 + (vehicle.position.y - vehicle.length / 2)}
                  y={
                    (CANVAS_HEIGHT - ROAD_WIDTH) / 2 +
                    (vehicle.position.x - vehicle.width / 2)
                  }
                  width={vehicle.length}
                  height={vehicle.width}
                  fill={getVehicleColor(vehicle)}
                  opacity={getVehicleOpacity(vehicle)}
                  stroke={
                    vehicle.visionStatus === VisionStatus.PARTIALLY_VISIBLE
                      ? '#FFFFFF'
                      : undefined
                  }
                  strokeWidth={
                    vehicle.visionStatus === VisionStatus.PARTIALLY_VISIBLE
                      ? 1
                      : 0
                  }
                  listening={true}
                  onClick={(e) => handleVehicleClick(vehicle, e)}
                  onTap={(e) => handleVehicleClick(vehicle, e)}
                />
              ))}

              <Rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill="#FFD700"
                stroke="#FFA500"
                strokeWidth={2}
              />
              <Text
                x={obs.direction === 1 ? x + width + 4 : x - 20}
                y={y + height / 2 - 8}
                text={obs.direction === 1 ? '➡️' : '⬅️'}
                fontSize={16}
              />
            </Layer>
          </Stage>

          {/* 팝업 */}
          {selectedVehicle && popupPosition && (
            <div
              className="absolute bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10 min-w-[200px]"
              style={{
                left: Math.min(popupPosition.x + 10, CANVAS_WIDTH - 220),
                top: Math.min(popupPosition.y - 10, CANVAS_HEIGHT - 120),
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-gray-800">
                  차량 #{selectedVehicle.id}
                </h3>
                <button
                  onClick={() => {
                    setSelectedVehicle(null);
                    setPopupPosition(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">시야 상태:</span>
                  <span
                    className={`font-medium ${
                      selectedVehicle.visionStatus ===
                      VisionStatus.FULLY_VISIBLE
                        ? 'text-green-600'
                        : selectedVehicle.visionStatus ===
                          VisionStatus.FULLY_HIDDEN
                        ? 'text-red-600'
                        : 'text-blue-600'
                    }`}
                  >
                    {getVisionStatusText(selectedVehicle.visionStatus)}
                  </span>
                </div>

                {selectedVehicle.visionStatus ===
                  VisionStatus.PARTIALLY_VISIBLE && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">가시성 비율:</span>
                    <span className="font-medium text-blue-600">
                      {(selectedVehicle.visibilityRatio * 100).toFixed(1)}%
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">위치:</span>
                  <span className="font-medium">
                    ({selectedVehicle.position.x.toFixed(1)},{' '}
                    {selectedVehicle.position.y.toFixed(1)})
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">크기:</span>
                  <span className="font-medium">
                    {selectedVehicle.width.toFixed(1)} ×{' '}
                    {selectedVehicle.length.toFixed(1)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">속도:</span>
                  <span className="font-medium">
                    {selectedVehicle.speed.toFixed(1)} m/s
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {analysis && <ObserverOverviewPanel analysis={analysis} />}
    </div>
  );
};

export default RoadObserver;
