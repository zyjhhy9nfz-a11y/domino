import { defineConfig } from 'vite';
import { printAccessUrls } from './print-access-urls.js';

function accessUrlPlugin(label) {
  return {
    name: 'dominoes-access-urls',
    configureServer(server) {
      server.httpServer?.once('listening', () => {
        const addr = server.httpServer?.address();
        const port = typeof addr === 'object' && addr ? addr.port : 5174;
        setTimeout(() => printAccessUrls(port, label), 100);
      });
    },
    configurePreviewServer(server) {
      server.httpServer?.once('listening', () => {
        const addr = server.httpServer?.address();
        const port = typeof addr === 'object' && addr ? addr.port : 3000;
        setTimeout(() => printAccessUrls(port, `${label} Preview`), 100);
      });
    },
  };
}

export default defineConfig({
  server: {
    host: true,
    port: 5174,
  },
  preview: {
    host: true,
    port: 3000,
  },
  plugins: [accessUrlPlugin('Dev Server')],
});
