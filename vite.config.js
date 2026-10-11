import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Deployed at https://deepen-yadav.github.io/profile/
export default defineConfig({
  plugins: [react()],
  base: '/profile/',
});
