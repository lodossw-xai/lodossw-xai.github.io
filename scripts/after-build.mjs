import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const outputDirectory = resolve('docs');
const indexFile = resolve(outputDirectory, 'index.html');
const staticRoutes = [
  'about',
  'work',
  'careers',
  'contact',
  'privacy',
  'terms',
];

await Promise.all(
  staticRoutes.map(async (route) => {
    const routeDirectory = resolve(outputDirectory, route);
    await mkdir(routeDirectory, { recursive: true });
    await copyFile(indexFile, resolve(routeDirectory, 'index.html'));
  })
);

await copyFile(indexFile, resolve(outputDirectory, '404.html'));
await writeFile(resolve(outputDirectory, '.nojekyll'), '');
