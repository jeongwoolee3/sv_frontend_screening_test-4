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

  return {
    leftBoundary,
    rightBoundary,
    fovOrigin,
    forwardAngle,
    halfFov,
    leftAngle,
    rightAngle,
  };
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

// 두 선분의 교점 계산
function getLineIntersection(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  p4: { x: number; y: number }
): { x: number; y: number } | null {
  const denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x);
  if (Math.abs(denom) < 1e-10) return null;

  const t =
    ((p1.x - p3.x) * (p3.y - p4.y) - (p1.y - p3.y) * (p3.x - p4.x)) / denom;
  const u =
    -((p1.x - p2.x) * (p1.y - p3.y) - (p1.y - p2.y) * (p1.x - p3.x)) / denom;

  // 교점이 두 선분 위에 있는지 확인
  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: p1.x + t * (p2.x - p1.x),
      y: p1.y + t * (p2.y - p1.y),
    };
  }

  return null;
}

// 다각형의 면적 계산 (Shoelace formula)
function calculatePolygonArea(points: { x: number; y: number }[]): number {
  if (points.length < 3) return 0;

  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
}

// 부분적으로 보이는 차량의 정확한 교차 면적 계산
function calculatePartialVisibilityRatio(
  vehicle: Vehicle,
  fovBoundaries: ReturnType<typeof calculateFovBoundaries>
): number {
  const { fovOrigin, leftAngle, rightAngle } = fovBoundaries;
  const { x, y } = vehicle.position;
  const { width, length } = vehicle;

  // 차량의 사각형 꼭짓점들
  const vehicleCorners = [
    { x: x - width / 2, y: y - length / 2 }, // 왼쪽 위
    { x: x + width / 2, y: y - length / 2 }, // 오른쪽 위
    { x: x + width / 2, y: y + length / 2 }, // 오른쪽 아래
    { x: x - width / 2, y: y + length / 2 }, // 왼쪽 아래
  ];

  // 시야각 경계선들
  const leftBoundaryEnd = {
    x: fovOrigin.x + Math.cos(leftAngle) * 1000,
    y: fovOrigin.y + Math.sin(leftAngle) * 1000,
  };
  const rightBoundaryEnd = {
    x: fovOrigin.x + Math.cos(rightAngle) * 1000,
    y: fovOrigin.y + Math.sin(rightAngle) * 1000,
  };

  // 시야각 내부에 있는 차량 꼭짓점들
  const insidePoints: { x: number; y: number }[] = [];
  for (const corner of vehicleCorners) {
    if (
      isPointInFov(
        corner,
        fovOrigin,
        (leftAngle + rightAngle) / 2,
        Math.abs(rightAngle - leftAngle) / 2
      )
    ) {
      insidePoints.push(corner);
    }
  }

  // 차량의 각 변과 시야각 경계선의 교점들
  const intersectionPoints: { x: number; y: number }[] = [];

  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4;
    const edgeStart = vehicleCorners[i];
    const edgeEnd = vehicleCorners[j];

    // 왼쪽 경계선과의 교점
    const leftIntersection = getLineIntersection(
      fovOrigin,
      leftBoundaryEnd,
      edgeStart,
      edgeEnd
    );
    if (leftIntersection) {
      intersectionPoints.push(leftIntersection);
    }

    // 오른쪽 경계선과의 교점
    const rightIntersection = getLineIntersection(
      fovOrigin,
      rightBoundaryEnd,
      edgeStart,
      edgeEnd
    );
    if (rightIntersection) {
      intersectionPoints.push(rightIntersection);
    }
  }

  // 교차 영역의 모든 점들
  const allPoints = [...insidePoints, ...intersectionPoints];

  if (allPoints.length < 3) {
    return 0;
  }

  // 관찰자 중심으로 각도 정렬
  allPoints.sort((a, b) => {
    const angleA = Math.atan2(a.y - fovOrigin.y, a.x - fovOrigin.x);
    const angleB = Math.atan2(b.y - fovOrigin.y, b.x - fovOrigin.x);
    return angleA - angleB;
  });

  // 중복 제거
  const uniquePoints = allPoints.filter((point, index, arr) => {
    if (index === 0) return true;
    const prev = arr[index - 1];
    const dist = Math.sqrt(
      Math.pow(point.x - prev.x, 2) + Math.pow(point.y - prev.y, 2)
    );
    return dist > 1e-6;
  });

  const visibleArea = calculatePolygonArea(uniquePoints);
  const totalArea = width * length;

  return Math.min(1, Math.max(0, visibleArea / totalArea));
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
  // 이 경우에만 정확한 면적 비율 계산
  const accurateRatio = calculatePartialVisibilityRatio(vehicle, fovBoundaries);
  return { status: VisionStatus.PARTIALLY_VISIBLE, ratio: accurateRatio };
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
