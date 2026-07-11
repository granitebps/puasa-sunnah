import axios from 'axios';

import type { Fasting, Type } from '../types.ts';

export const apiClient = axios.create({
  headers: {
    'X-API-Client': 'official-app',
  },
});

interface ApiClient {
  get<T>(url: string): Promise<{ data: T }>;
}

interface FastingTypesResponse {
  success?: boolean;
  message?: string;
  data?: Type[];
  timestamp?: number;
}

interface FastingsResponse {
  data?: Fasting[];
}

export const fetchFastings = async (
  apiBaseUrl: string,
  month: number,
  year: number,
  client: ApiClient = apiClient,
): Promise<Fasting[]> => {
  const baseUrl = apiBaseUrl.replace(/\/$/, '');
  const { data } = await client.get<FastingsResponse>(
    `${baseUrl}/api/v1/fastings?month=${month}&year=${year}`,
  );

  return data.data ?? [];
};

export const fetchFastingTypes = async (
  apiBaseUrl: string,
  client: ApiClient = apiClient,
): Promise<Type[]> => {
  const baseUrl = apiBaseUrl.replace(/\/$/, '');
  const { data } = await client.get<FastingTypesResponse>(
    `${baseUrl}/api/v1/types`,
  );

  return data.data ?? [];
};
