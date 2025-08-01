#!/usr/bin/env node

import { spawn } from 'child_process';
import { existsSync } from 'fs';

// Check if built files exist
if (!existsSync('dist/index.mjs')) {
  console.error('Built server not found. Run npm run build first.');
  process.exit(1);
}

// Start the server
const server = spawn('node', ['dist/index.mjs'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production' }
});

server.on('error', (error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  process.exit(code);
});