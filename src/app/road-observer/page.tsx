'use client';
import useRoadStream from '@/hooks/useRoadStream.hook';
import { Stage, Layer, Rect, Circle, Text } from 'react-konva';

const RoadObserverPage = () => {
  /**
   * You can use "useRoadStream" hook or modify it as needed to implement this page.
   * const { road } = useRoadStream(isPaused);
   */

  const { road } = useRoadStream(true);

  console.log(road);

  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Rect x={0} y={0} width={100} height={100} fill="red" />
      </Layer>
    </Stage>
  );
};

export default RoadObserverPage;
