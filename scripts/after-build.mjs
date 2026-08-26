import { copyFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const outputDirectory = resolve('docs')
await copyFile(resolve(outputDirectory, 'index.html'), resolve(outputDirectory, '404.html'))
await writeFile(resolve(outputDirectory, '.nojekyll'), '')
