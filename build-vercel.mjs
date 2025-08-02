#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('Building for Vercel...');

// Build frontend with fallback
console.log('Building frontend...');
try {
  execSync('npx vite build', { stdio: 'inherit' });
} catch (error) {
  console.error('Frontend build failed');
  process.exit(1);
}

// Build backend with ESM
console.log('Building backend...');
try {
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/server.mjs', { 
    stdio: 'inherit' 
  });
} catch (error) {
  console.error('Backend build failed');
  process.exit(1);
}

console.log('Vercel build completed successfully!');