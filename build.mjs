#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

console.log('🏗️  Building frontend...');
try {
  execSync('vite build', { stdio: 'inherit' });
  console.log('✅ Frontend build completed');
} catch (error) {
  console.error('❌ Frontend build failed:', error.message);
  process.exit(1);
}

console.log('🏗️  Building backend...');
try {
  execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.mjs', { stdio: 'inherit' });
  console.log('✅ Backend build completed');
} catch (error) {
  console.error('❌ Backend build failed:', error.message);
  process.exit(1);
}

console.log('🔧 Fixing ESM imports in backend bundle...');
try {
  let content = readFileSync('dist/index.mjs', 'utf-8');
  
  // Fix any CommonJS require statements that might have slipped through
  content = content.replace(/require\(([^)]+)\)/g, 'await import($1)');
  
  // Ensure we have proper ESM export handling for Vercel
  if (!content.includes('export default')) {
    // Add a proper default export that matches what Vercel expects
    content += '\n// Vercel serverless function export\nexport default app;\n';
  }
  
  writeFileSync('dist/index.mjs', content);
  console.log('✅ Backend ESM fixes applied');
} catch (error) {
  console.error('❌ ESM fix failed:', error.message);
  process.exit(1);
}

console.log('🎉 Build completed successfully!');