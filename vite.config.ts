import react from '@vitejs/plugin-react';
import { sites } from '@openai/sites-vite-plugin';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 템플릿 변환 플러그인
const transformTemplates = (mode: string) => ({
  name: 'transform-templates',
  closeBundle: async () => {
    const env = loadEnv(mode, process.cwd());
    const siteUrl = env['VITE_SITE_URL'] || 'https://xaikorea.ai';
    const siteDomain = env['VITE_SITE_DOMAIN'] || 'xaikorea.ai';

    const templates = [
      { src: 'CNAME.template', dest: 'CNAME' },
      { src: 'robots.txt.template', dest: 'robots.txt' },
      { src: 'sitemap.xml.template', dest: 'sitemap.xml' },
    ];

    templates.forEach(({ src, dest }) => {
      const templatePath = resolve(__dirname, 'src/templates', src);
      try {
        let content = readFileSync(templatePath, 'utf-8');
        content = content.replace(/%VITE_SITE_URL%/g, siteUrl);
        content = content.replace(/%VITE_SITE_DOMAIN%/g, siteDomain);

        const outPath = resolve(__dirname, 'docs', dest);
        writeFileSync(outPath, content);
        console.log(
          `[transform-templates] Generated ${dest} for ${siteDomain} (mode: ${mode})`
        );
      } catch (err) {
        console.error(`[transform-templates] Error generating ${dest}:`, err);
      }
    });
  },
});

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const sharedConfig = {
    base: '/',
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@components': resolve(__dirname, './src/components'),
        '@features': resolve(__dirname, './src/features'),
        '@hooks': resolve(__dirname, './src/hooks'),
        '@utils': resolve(__dirname, './src/utils'),
        '@types': resolve(__dirname, './src/types'),
        '@styles': resolve(__dirname, './src/styles'),
      },
    },
  };

  if (mode === 'sites') {
    process.env['WRANGLER_WRITE_LOGS'] ??= 'false';
    process.env['WRANGLER_LOG_PATH'] ??= '.wrangler/logs';
    process.env['MINIFLARE_REGISTRY_PATH'] ??= '.wrangler/registry';

    const { cloudflare } = await import('@cloudflare/vite-plugin');

    return {
      ...sharedConfig,
      plugins: [
        react(),
        sites(),
        cloudflare({
          viteEnvironment: { name: 'server' },
          config: {
            main: './worker/index.ts',
            compatibility_date: '2026-08-27',
            assets: { not_found_handling: 'single-page-application' },
          },
        }),
      ],
      build: {
        target: 'esnext',
        sourcemap: true,
        rollupOptions: {
          output: {
            manualChunks(id: string) {
              return id.includes('node_modules/react') ? 'react-vendor' : undefined;
            },
          },
        },
      },
    };
  }

  return {
    ...sharedConfig,
    plugins: [react(), transformTemplates(mode)],
    server: {
      port: 3000,
      open: true,
    },
    build: {
      target: 'esnext',
      outDir: 'docs',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            return id.includes('node_modules/react') ? 'react-vendor' : undefined;
          },
        },
      },
    },
  };
});
