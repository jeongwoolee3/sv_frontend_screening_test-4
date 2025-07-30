import { useEffect, useState, useCallback, useRef } from 'react';
import { Road } from '@/types/road-observer.type';

interface UseRoadStreamOptions {
  retryDelay?: number;
  maxRetries?: number;
}

function useRoadStream(isPaused: boolean, options: UseRoadStreamOptions = {}) {
  const { retryDelay = 2000, maxRetries = 5 } = options;
  const [road, setRoad] = useState<Road | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const retryCountRef = useRef(0);
  const eventSourceRef = useRef<EventSource | null>(null);

  const updateRoad = useCallback(
    (roadData: Road) => {
      if (!isPaused) {
        setRoad(roadData);
      }
    },
    [isPaused]
  );

  const resetConnection = useCallback(() => {
    setIsConnected(false);
    setError(null);
    retryCountRef.current = 0;
  }, []);

  useEffect(() => {
    const connectSSE = () => {
      try {
        const eventSource = new EventSource('/api/road');
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          setIsConnected(true);
          setError(null);
          retryCountRef.current = 0;
        };

        eventSource.onmessage = (event) => {
          try {
            const roadData = JSON.parse(event.data);
            updateRoad(roadData);
          } catch (parseError) {
            setError('데이터 파싱 오류가 발생했습니다.');
          }
        };

        eventSource.onerror = () => {
          setIsConnected(false);
          eventSource.close();

          if (retryCountRef.current < maxRetries) {
            retryCountRef.current++;
            setError(
              `연결 재시도 중... (${retryCountRef.current}/${maxRetries})`
            );
            setTimeout(connectSSE, retryDelay);
          } else {
            setError('서버 연결에 실패했습니다. 페이지를 새로고침해주세요.');
          }
        };
      } catch (err) {
        setError('연결 초기화 중 오류가 발생했습니다.');
      }
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [updateRoad, retryDelay, maxRetries]);

  return {
    road,
    setRoad,
    isConnected,
    error,
    resetConnection,
  };
}

export default useRoadStream;
