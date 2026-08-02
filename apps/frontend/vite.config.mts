/// <reference types='vitest' />
import { defineConfig } from 'vite';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/apps/frontend',
  server: {
    port: 4200,
    host: 'localhost',
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    rollupOptions: {
      input: {
        main: import.meta.dirname + '/index.html',
        customer: import.meta.dirname + '/customer.html',
        employee: import.meta.dirname + '/employee.html',
        admin: import.meta.dirname + '/admin.html'
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
}));
