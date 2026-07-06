import axios from 'axios';

import type { Fasting, Type } from '../types.ts';

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
  client: ApiClient = axios,
): Promise<Fasting[]> => {
  const baseUrl = apiBaseUrl.replace(/\/$/, '');
  const { data } = await client.get<FastingsResponse>(
    `${baseUrl}/api/v1/fastings?month=${month}&year=${year}`,
  );

  return data.data ?? [];
};

export const fetchFastingTypes = async (
  apiBaseUrl: string,
  client: ApiClient = axios,
): Promise<Type[]> => {
  const baseUrl = apiBaseUrl.replace(/\/$/, '');
  const { data } = await client.get<FastingTypesResponse>(
    `${baseUrl}/api/v1/types`,
  );

  return data.data ?? [];
};
