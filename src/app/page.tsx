'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const { push } = useRouter();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        🔥 SV Frontend Screening Test 🔥
      </h1>

      <div className="flex gap-4">
        <button
          onClick={() => push('/bouncing-ball')}
          className="px-6 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors shadow-md"
        >
          중력 낙하 실험
        </button>
        <button
          onClick={() => push('/road-observer')}
          className="px-6 py-3 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors shadow-md"
        >
          도로 감시 시스템
        </button>
      </div>
    </main>
  );
}
