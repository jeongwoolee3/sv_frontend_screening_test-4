import {
  Vehicle,
  Observer,
  VisionStatus,
  AnalyzedVehicle,
  VisionAnalysis,
} from '@/types/road-observer.type';

export function calculateDistance(
  p1: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function calculateAngle(
  from: { x: number; y: number },
  to: { x: number; y: number }
): number {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

export function angleDifference(a: number, b: number): number {
  let diff = a - b;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  return diff;
}

export function calculateFovBoundaries(observer: Observer, roadLength: number) {
  const { x, y } = observer.position;
  const { fov, direction } = observer;

  // 관찰자가 바라보는 방향의 기준 각도
  const forwardAngle = direction === 1 ? Math.PI / 2 : -Math.PI / 2; // direction 1 = 아래쪽(y+), -1 = 위쪽(y-)

  // 시야각의 절반
  const halfFov = degreesToRadians(fov / 2);

  // 왼쪽과 오른쪽 경계선의 각도
  const leftAngle = forwardAngle - halfFov;
  const rightAngle = forwardAngle + halfFov;

  // 시야각 시작점 (관찰자 차량의 중심)
  const fovOrigin = { x, y };

  // 경계선의 끝점 계산
  const rayLength = 500;

  const leftBoundary = {
    start: fovOrigin,
    end: {
      x: fovOrigin.x + Math.cos(leftAngle) * rayLength,
      y: fovOrigin.y + Math.sin(leftAngle) * rayLength,
    },
  };

  const rightBoundary = {
    start: fovOrigin,
    end: {
      x: fovOrigin.x + Math.cos(rightAngle) * rayLength,
      y: fovOrigin.y + Math.sin(rightAngle) * rayLength,
    },
  };

  return { leftBoundary, rightBoundary, fovOrigin, forwardAngle, halfFov };
}

// 점이 시야각 내에 있는지 확인하는 함수
function isPointInFov(
  point: { x: number; y: number },
  fovOrigin: { x: number; y: number },
  forwardAngle: number,
  halfFov: number
): boolean {
  const angleToPoint = calculateAngle(fovOrigin, point);
  const angleDiff = Math.abs(angleDifference(angleToPoint, forwardAngle));
  return angleDiff <= halfFov;
}

export function analyzeVehicleVisibility(
  vehicle: Vehicle,
  observer: Observer,
  fovBoundaries: ReturnType<typeof calculateFovBoundaries>
): { status: VisionStatus; ratio: number } {
  const { fovOrigin, forwardAngle, halfFov } = fovBoundaries;

  // 관찰자 뒤쪽에 있는 차량은 보이지 않음
  const vehicleRelativeY = vehicle.position.y - fovOrigin.y;
  const observerDirection = observer.direction;

  if (
    (observerDirection === 1 && vehicleRelativeY <= 0) ||
    (observerDirection === -1 && vehicleRelativeY >= 0)
  ) {
    return { status: VisionStatus.FULLY_HIDDEN, ratio: 0 };
  }

  // 차량의 사각형 꼭짓점들
  const { x, y } = vehicle.position;
  const { width, length } = vehicle;

  const vehicleCorners = [
    { x: x - width / 2, y: y - length / 2 }, // 왼쪽 위
    { x: x + width / 2, y: y - length / 2 }, // 오른쪽 위
    { x: x + width / 2, y: y + length / 2 }, // 오른쪽 아래
    { x: x - width / 2, y: y + length / 2 }, // 왼쪽 아래
  ];

  // 차량 꼭짓점들이 시야각 내에 있는지 확인
  let visibleCorners = 0;
  for (const corner of vehicleCorners) {
    if (isPointInFov(corner, fovOrigin, forwardAngle, halfFov)) {
      visibleCorners++;
    }
  }

  // 모든 모서리가 시야각 안에 있으면 완전히 보임
  if (visibleCorners === 4) {
    return { status: VisionStatus.FULLY_VISIBLE, ratio: 1 };
  }

  // 모든 모서리가 시야각 밖에 있으면 완전히 숨겨짐
  if (visibleCorners === 0) {
    return { status: VisionStatus.FULLY_HIDDEN, ratio: 0 };
  }

  // 일부 모서리만 시야각 안에 있으면 부분적으로 보임

  const ratio = calculatePartialVisibilityRatio(vehicle, fovBoundaries);
  return { status: VisionStatus.PARTIALLY_VISIBLE, ratio };
}

// 부분적으로 보이는 차량의 정확한 가시성 비율 계산
function calculatePartialVisibilityRatio(
  vehicle: Vehicle,
  fovBoundaries: ReturnType<typeof calculateFovBoundaries>
): number {
  const { fovOrigin, forwardAngle, halfFov } = fovBoundaries;
  const { x, y } = vehicle.position;
  const { width, length } = vehicle;

  // 격자 기반 샘플링으로 가시성 계산
  const gridSize = 10; // 10x10
  let visiblePoints = 0;
  let totalPoints = 0;

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      // 차량 내부의 점 계산
      const pointX = x - width / 2 + (width * i) / (gridSize - 1);
      const pointY = y - length / 2 + (length * j) / (gridSize - 1);

      totalPoints++;

      // 점이 시야각 내에 있는지 확인
      if (
        isPointInFov({ x: pointX, y: pointY }, fovOrigin, forwardAngle, halfFov)
      ) {
        visiblePoints++;
      }
    }
  }

  // 시야각 내부에 있는 비율 (실제 가시성 비율)
  const ratio = visiblePoints / totalPoints;

  return Math.min(1, Math.max(0, ratio));
}

export function analyzeRoadVision(
  vehicles: Vehicle[],
  observer: Observer,
  roadLength: number
): VisionAnalysis {
  const fovBoundaries = calculateFovBoundaries(observer, roadLength);

  const analyzedVehicles: AnalyzedVehicle[] = vehicles.map((vehicle, index) => {
    const { status, ratio } = analyzeVehicleVisibility(
      vehicle,
      observer,
      fovBoundaries
    );
    const distance = calculateDistance(vehicle.position, observer.position);

    return {
      ...vehicle,
      id: `vehicle-${index}`,
      visionStatus: status,
      visibilityRatio: ratio,
      distanceToObserver: distance,
    };
  });

  const statusCounts = {
    [VisionStatus.FULLY_VISIBLE]: 0,
    [VisionStatus.PARTIALLY_VISIBLE]: 0,
    [VisionStatus.FULLY_HIDDEN]: 0,
  };

  analyzedVehicles.forEach((vehicle) => {
    statusCounts[vehicle.visionStatus]++;
  });

  return {
    vehicles: analyzedVehicles,
    observer,
    fovLines: {
      leftBoundary: fovBoundaries.leftBoundary,
      rightBoundary: fovBoundaries.rightBoundary,
    },
  };
}
