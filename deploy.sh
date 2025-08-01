#!/bin/bash

echo "Starting deployment build..."

# Build frontend
echo "Building frontend..."
npm run vite build || exit 1

# Build backend with correct format
echo "Building backend..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.mjs || exit 1

echo "Build completed successfully!"
echo "Starting production server..."

NODE_ENV=production node dist/index.mjs