import assert from 'node:assert/strict';
import test from 'node:test';

import {
  apiClient,
  fetchFastings,
  fetchFastingTypes,
} from '../src/api/fastingApi.ts';

test('includes the official app identifier on every API client request', () => {
  assert.equal(apiClient.defaults.headers['X-API-Client'], 'official-app');
});

test('loads fasting types from the types endpoint', async () => {
  let requestedUrl = '';
  const types = [
    {
      id: 1,
      name: 'Puasa Senin Kamis',
      description: '',
      background_color: '#E0F7FA',
      text_color: '#00796B',
    },
  ];
  const client = {
    get: async <T>(url: string): Promise<{ data: T }> => {
      requestedUrl = url;
      return {
        data: {
          success: true,
          message: 'Success',
          data: types,
          timestamp: 1783225806350,
        } as T,
      };
    },
  };

  const result = await fetchFastingTypes('https://api.example.com/', client);

  assert.equal(requestedUrl, 'https://api.example.com/api/v1/types');
  assert.deepEqual(result, types);
});

test('returns an empty list when the types response has no data', async () => {
  const client = {
    get: async <T>(): Promise<{ data: T }> => ({
      data: { success: true } as T,
    }),
  };

  assert.deepEqual(await fetchFastingTypes('https://api.example.com', client), []);
});

test('loads fasting schedules for the requested month and year', async () => {
  let requestedUrl = '';
  const fastings = [{ id: 9, date: '2026-07-06' }];
  const client = {
    get: async <T>(url: string): Promise<{ data: T }> => {
      requestedUrl = url;
      return { data: { data: fastings } as T };
    },
  };

  const result = await fetchFastings(
    'https://api.example.com/',
    7,
    2026,
    client,
  );

  assert.equal(
    requestedUrl,
    'https://api.example.com/api/v1/fastings?month=7&year=2026',
  );
  assert.deepEqual(result, fastings);
});
