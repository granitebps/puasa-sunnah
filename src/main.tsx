import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PostHogProvider } from 'posthog-js/react';
import { Analytics } from '@vercel/analytics/react';

import App from './App.tsx';

const options = {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PostHogProvider apiKey={import.meta.env.VITE_POSTHOG_KEY} options={options}>
      <Analytics />
      <App />
    </PostHogProvider>
  </StrictMode>
);
