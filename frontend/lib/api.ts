import {
  HouseholdRequest,
  HouseholdImpactResponse,
  AggregateRequest,
  AggregateImpactResponse,
  HealthResponse,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const DEFAULT_TIMEOUT = 120000; // 2 minutes for aggregate calcs

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number = DEFAULT_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async health(): Promise<HealthResponse> {
    const response = await fetchWithTimeout(
      `${this.baseUrl}/api/health`,
      { method: 'GET' },
      10000
    );
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    return response.json();
  }

  async calculateHouseholdImpact(
    request: HouseholdRequest
  ): Promise<HouseholdImpactResponse> {
    const response = await fetchWithTimeout(
      `${this.baseUrl}/api/household-impact`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      },
      60000 // 1 minute for household calc
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Calculation failed: ${response.status}`
      );
    }

    return response.json();
  }

  async calculateAggregateImpact(
    request: AggregateRequest
  ): Promise<AggregateImpactResponse> {
    const response = await fetchWithTimeout(
      `${this.baseUrl}/api/aggregate-impact`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      },
      180000 // 3 minutes for aggregate calc
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Aggregate calculation failed: ${response.status}`
      );
    }

    return response.json();
  }
}

export const api = new ApiClient();
export default api;
