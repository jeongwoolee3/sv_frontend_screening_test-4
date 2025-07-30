import React from 'react';
import { AnalyzedVehicle, VisionStatus } from '@/types/road-observer.type';

interface VehiclePopupProps {
  vehicle: AnalyzedVehicle;
  position: { x: number; y: number };
  onClose: () => void;
  canvasWidth: number;
  canvasHeight: number;
}

const VehiclePopup: React.FC<VehiclePopupProps> = ({
  vehicle,
  position,
  onClose,
  canvasWidth,
  canvasHeight,
}) => {
  const getVisionStatusText = (status: VisionStatus): string => {
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
  };

  return (
    <div
      className="absolute bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10 min-w-[200px]"
      style={{
        left: Math.min(position.x + 10, canvasWidth - 220),
        top: Math.min(position.y - 10, canvasHeight - 120),
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-lg text-gray-800">차량 #{vehicle.id}</h3>
        <button
          onClick={onClose}
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
              vehicle.visionStatus === VisionStatus.FULLY_VISIBLE
                ? 'text-green-600'
                : vehicle.visionStatus === VisionStatus.FULLY_HIDDEN
                ? 'text-red-600'
                : 'text-blue-600'
            }`}
          >
            {getVisionStatusText(vehicle.visionStatus)}
          </span>
        </div>

        {vehicle.visionStatus === VisionStatus.PARTIALLY_VISIBLE && (
          <div className="flex justify-between">
            <span className="text-gray-600">가시성 비율:</span>
            <span className="font-medium text-blue-600">
              {vehicle.visibilityRatio * 100}%
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-gray-600">위치:</span>
          <span className="font-medium">
            ({vehicle.position.x.toFixed(1)}, {vehicle.position.y.toFixed(1)})
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">크기:</span>
          <span className="font-medium">
            {vehicle.width.toFixed(1)} × {vehicle.length.toFixed(1)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">속도:</span>
          <span className="font-medium">{vehicle.speed.toFixed(1)} m/s</span>
        </div>
      </div>
    </div>
  );
};

export default VehiclePopup;
