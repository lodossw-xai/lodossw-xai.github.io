import react from '@vitejs/plugin-react';
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
export default defineConfig(({ mode }) => {
  return {
    // GitHub Pages 배포 시 경로 설정
    base: '/lodossw-xai.github.io/',
    plugins: [react(), transformTemplates(mode)],
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
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
          },
        },
      },
    },
  };
});
