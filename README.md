# Kings Barber Shop Website

A highly animated, modern website for Kings Barber Shop in Anaheim, CA with premium dark aesthetic and over-the-top animations.

## Vercel Deployment Configuration

### Deployment Settings:
- **Root Directory**: `.` (current directory)
- **Build Command**: `npm run build`
- **Install Command**: `npm install`
- **Output Directory**: `dist/public`

### Manual Deployment Steps:
1. Connect your GitHub repository to Vercel
2. Set the following in Vercel dashboard:
   - Framework Preset: `Other`
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist/public`
   - Install Command: `npm install`

### Environment Variables (if needed):
- `NODE_ENV=production`

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