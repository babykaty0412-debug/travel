import { defineConfig, type Plugin } from 'vite';

// Content-Security-Policy：限制資源來源，降低 XSS/注入風險
const CSP = [
  "default-src 'self'",
  "img-src 'self' data: https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com",
  "connect-src 'self' https://router.project-osrm.org",
  "style-src 'self' 'unsafe-inline'", // Leaflet 會注入 inline style
  "script-src 'self'",
  "font-src 'self'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

// 只在 production build 注入 CSP（dev 需要 Vite HMR 的 inline script）
function injectCsp(): Plugin {
  return {
    name: 'inject-csp',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        '</head>',
        `  <meta http-equiv="Content-Security-Policy" content="${CSP}" />\n</head>`,
      );
    },
  };
}

// GitHub Pages 專案站台路徑為 /travel/
export default defineConfig({
  base: '/travel/',
  plugins: [injectCsp()],
  build: {
    outDir: 'dist',
    target: 'es2022',
    sourcemap: false,
    modulePreload: { polyfill: false }, // 避免注入 inline script，符合 script-src 'self'
  },
});
