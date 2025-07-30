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

export function getVehicleCorners(
  vehicle: Vehicle
): { x: number; y: number }[] {
  const { x, y } = vehicle.position;
  const { width, length } = vehicle;

  return [
    { x: x - width / 2, y: y - length / 2 }, // 왼쪽 위
    { x: x + width / 2, y: y - length / 2 }, // 오른쪽 위
    { x: x + width / 2, y: y + length / 2 }, // 오른쪽 아래
    { x: x - width / 2, y: y + length / 2 }, // 왼쪽 아래
  ];
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

  // 차량의 각 꼭짓점이 시야각 내에 있는지 확인
  const corners = getVehicleCorners(vehicle);
  let visibleCorners = 0;

  for (const corner of corners) {
    // 관찰자에서 해당 점까지의 각도 계산
    const angleToCorner = calculateAngle(fovOrigin, corner);

    // 전방 방향과의 각도 차이 계산
    const angleDiff = Math.abs(angleDifference(angleToCorner, forwardAngle));

    // 시야각 내에 있는지 확인
    if (angleDiff <= halfFov) {
      visibleCorners++;
    }
  }

  const ratio = visibleCorners / corners.length;

  if (ratio === 0) {
    return { status: VisionStatus.FULLY_HIDDEN, ratio: 0 };
  } else if (ratio === 1) {
    return { status: VisionStatus.FULLY_VISIBLE, ratio: 1 };
  } else {
    return { status: VisionStatus.PARTIALLY_VISIBLE, ratio };
  }
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
