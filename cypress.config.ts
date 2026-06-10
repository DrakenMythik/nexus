import { defineConfig } from 'cypress';

export default defineConfig({
  allowCypressEnv: false,
  e2e: {
    baseUrl: 'http://127.0.0.1:4173',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    supportFile: false,
  }
});
