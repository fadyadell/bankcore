import { fetchApi } from '@/lib/apiClient';
import { HealthStatus } from '@bankcore/contracts';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const response = await fetchApi<HealthStatus>('/api/v1/health', { cache: 'no-store' });
  
  const health = response.data;
  const error = response.error?.message;

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Bankcore Portal</h1>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">API Health Status</h2>
          
          {error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
              <p className="font-bold">Unreachable</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : (
            <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200">
              <p className="font-bold flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-green-500 inline-block"></span>
                Healthy
              </p>
              <div className="text-sm mt-2 space-y-1">
                <p>Status: {health?.status}</p>
                <p>Uptime: {Math.floor(health?.uptime || 0)}s</p>
                <p className="text-xs text-green-600/80">
                  Last checked: {new Date(health?.timestamp || '').toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
