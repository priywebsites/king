# Kings Barber Shop Website

A highly animated, modern website for Kings Barber Shop in Anaheim, CA with premium dark aesthetic and over-the-top animations.

## Vercel Deployment

This project is configured for Vercel deployment with ESM support and custom build script to handle format issues.

### Vercel Deployment Settings:
- **Framework Preset**: Other
- **Root Directory**: `./` (leave empty for root)
- **Build Command**: `node build-vercel.mjs`
- **Output Directory**: `dist/public`
- **Install Command**: `npm install`

### What the build does:
1. Builds frontend with Vite (outputs to `dist/public`)
2. Builds backend with esbuild in ESM format (outputs to `dist/server.mjs`)
3. Handles ESM/CommonJS compatibility issues automatically

### Quick Deploy:
The project includes a `vercel.json` configuration file that uses the custom build script.

## Replit Autoscale Deployment (Alternative)

For Replit deployment, use these commands:
- **Build Command**: `node scripts/build.js`
- **Start Command**: `node scripts/start.js`

## Local Development

```bash
npm install
npm run dev
```

## Build for Production

```bash
npm run build
```

This creates:
- Frontend assets in `dist/public/`
- Backend bundle in `dist/index.js`

## Project Structure

- `client/` - React frontend with Vite
- `server/` - Express.js backend
- `shared/` - Shared TypeScript types
- `attached_assets/` - Images and assets
- `dist/` - Built output directory

## Features

- Fully responsive mobile-first design
- Dark mode premium aesthetic
- Over-the-top animations with Framer Motion
- Service gallery with custom barbershop photos
- Phone booking integration
- Real-time open/closed status
- Google Maps integration