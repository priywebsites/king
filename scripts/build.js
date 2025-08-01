#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('Building frontend...');
try {
  execSync('vite build', { stdio: 'inherit' });
} catch (error) {
  console.error('Frontend build failed');
  process.exit(1);
}

console.log('Building backend...');
try {
  execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.mjs', { stdio: 'inherit' });
} catch (error) {
  console.error('Backend build failed');
  process.exit(1);
}

console.log('Build completed successfully!');