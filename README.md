# Kings Barber Shop Website

A highly animated, modern website for Kings Barber Shop in Anaheim, CA with premium dark aesthetic and over-the-top animations.

## Vercel Deployment

This project is now configured for Vercel deployment with proper ESM support.

### Vercel Deployment Settings:
- **Framework Preset**: Other
- **Root Directory**: `./` (leave empty for root)
- **Build Command**: `vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/server.mjs`
- **Output Directory**: `dist/public`
- **Install Command**: `npm install`

### Quick Deploy:
The project includes a `vercel.json` configuration file that handles the build process automatically.

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