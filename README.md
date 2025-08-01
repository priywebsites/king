# Kings Barber Shop Website

A highly animated, modern website for Kings Barber Shop in Anaheim, CA with premium dark aesthetic and over-the-top animations.

## Replit Autoscale Deployment

This project is configured for Replit Autoscale deployment. Due to ESM/CommonJS compatibility issues, use these commands:

### Deployment Configuration:
- **Build Command**: `node scripts/build.js`
- **Start Command**: `node scripts/start.js`
- **Port**: 5000 (configured in PORT environment variable)

### Alternative Deployment:
You can also use the single deployment script:
```bash
./deploy.sh
```

### Manual Deployment Steps:
1. Click the **Deploy** button in your Replit workspace
2. Select **Autoscale Deployment**
3. Set build command to: `node scripts/build.js`
4. Set start command to: `node scripts/start.js`
5. Your app will be available at your assigned .replit.app domain

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