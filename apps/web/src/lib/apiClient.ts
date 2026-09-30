import { ApiResponse } from '@bankcore/contracts';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      // Try to parse the error envelope if the API returned it
      try {
        const errorData = await response.json();
        return errorData;
      } catch {
        return {
          data: null,
          error: {
            message: `HTTP Error: ${response.status} ${response.statusText}`,
            code: 'HTTP_ERROR',
          },
        };
      }
    }

    const data = await response.json();
    return data;
  } catch (error: unknown) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'Network error',
        code: 'NETWORK_ERROR',
      },
    };
  }
}
