const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export interface HealthResponse {
  status: 'ok';
  database: 'connected';
}

export async function getHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) throw new Error(`API trả về HTTP ${response.status}`);
  return (await response.json()) as HealthResponse;
}
