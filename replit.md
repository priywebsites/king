# Kings Barber Shop Website

## Overview

This is a modern, highly animated website for Kings Barber Shop located in Anaheim, CA. The application is built as a full-stack web application using React for the frontend and Express.js for the backend, with a focus on creating an exceptional user experience with premium animations and a sleek dark mode aesthetic.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**July 24, 2025**: Successfully migrated project from Replit Agent to Replit environment and implemented comprehensive booking system with full SMS functionality
- Fixed missing tsx dependency issue that was preventing workflow execution
- Completely redesigned services section with comprehensive new service offerings
- Added The King Package ($100) as premium featured service
- Organized services into clear categories: Hair Services, Beard & Shave Services, Facials & Grooming
- Enhanced service cards with pricing, duration, and detailed descriptions
- **NEW: Complete booking system implementation**
  - Customer-facing booking flow with phone verification
  - Hidden barber dashboard for appointment management
  - SMS notifications for appointments to +1 431-997-3415
  - Cancel/reschedule functionality with confirmation codes
  - Dynamic pricing with Alex premium barber surcharge (+$5)
  - Phone number verification via 6-digit SMS codes
  - Privacy-protected barber dashboard (no customer personal info)
  - Real-time appointment management and updates
  - **Dynamic time slots** - Automatically generated based on service duration (5-60 minutes)
  - **Smart scheduling** - Prevents double-booking by checking existing appointments
  - **Pacific Time Zone** - Correct time display for Anaheim, CA location
  - **Automatic daily reset** - Appointments clear at 9 PM PST when barbershop closes
  - **Manual reset capability** - Admin endpoint to clear all appointments instantly
  - **FINAL SMS SYSTEM** - Barber notifications working perfectly, tested with customer's phone for verification
  - **TIMEZONE FIXED** - Removed all timezone conversions, dashboard shows exact booking times regardless of user location
  - **CONSISTENT TIME DISPLAY** - All time slots show as "11:30 AM - 12:00 PM" format across booking, dashboard, and SMS
  - **COMPLETE MESSAGE SYSTEM** - Customer and barber SMS include service, barber, time slot, price, and confirmation codes
  - **BARBER SMS TO 431-997-3415** - All barber notifications (bookings, cancellations, reschedules) go to verified number
  - **CUSTOMER CODE REMINDERS** - Strong messaging urging customers to screenshot and save confirmation codes
  - **CALL OPTION FOR FORGOTTEN CODES** - Added prominent call button in cancel/reschedule form for customers who forgot codes
  - **COMPLETE CANCELLATION SMS** - Barber receives detailed cancellation SMS with all appointment details

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Animations**: Framer Motion for advanced animations and transitions
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL session store with connect-pg-simple

### Design System
- **Color Scheme**: Black, gray, and white palette for premium dark mode aesthetic
- **Typography**: Montserrat for headings, Inter for body text
- **Components**: Fully responsive with mobile-first design
- **Animations**: Over-the-top animations including parallax, scroll-based transitions, hover effects, and scaling

## Key Components

### Frontend Components
1. **Navigation**: Sticky animated navigation bar with scroll-to-section functionality
2. **Hero Section**: Full-screen hero with parallax background and call-to-action
3. **Services Section**: Animated service cards with pricing and descriptions
4. **Gallery Section**: Animated image grid showcasing barbershop work
5. **Location Section**: Interactive section with hours and Google Maps integration
6. **Contact Section**: Call-to-action focused on phone bookings
7. **Footer**: Comprehensive footer with business information and social links

### Backend Components
1. **Express Server**: Main application server with middleware setup
2. **Storage Interface**: Abstracted storage layer for database operations
3. **Route Handler**: Centralized route registration system
4. **Vite Integration**: Development server integration for hot module replacement

### UI System
- **shadcn/ui Components**: Complete set of accessible UI primitives
- **Custom Animations**: Framer Motion integration for smooth transitions
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Dark Theme**: Consistent dark mode color scheme throughout

## Data Flow

### Frontend Data Flow
1. React components use TanStack Query for server state
2. Component state managed locally with React hooks
3. Animations triggered by scroll events and user interactions
4. Navigation handled by Wouter router with smooth scrolling

### Backend Data Flow
1. Express middleware processes incoming requests
2. Routes delegate to storage interface for data operations
3. Database operations handled by Drizzle ORM
4. Responses formatted as JSON for API endpoints

### Build Process
1. TypeScript compilation with strict type checking
2. Vite bundles frontend assets with optimization
3. esbuild bundles backend code for production
4. Static assets served from dist/public directory

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React, React DOM, React Query
- **UI Framework**: Radix UI primitives, Tailwind CSS
- **Animation**: Framer Motion, Embla Carousel
- **Database**: Drizzle ORM, Neon Database serverless driver
- **Build Tools**: Vite, esbuild, TypeScript

### Development Dependencies
- **Type Safety**: TypeScript with strict configuration
- **Code Quality**: ESLint, Prettier (implied by structure)
- **Development Server**: Vite with HMR and error overlay

### Business Integrations
- **Phone System**: Direct tel: links for one-tap calling
- **Maps Integration**: Google Maps embed for location display
- **Image Hosting**: Unsplash for placeholder barbershop imagery

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with HMR
- **Database**: Neon Database connection via DATABASE_URL
- **Environment Variables**: NODE_ENV for environment detection

### Production Build
- **Frontend**: Vite production build to dist/public
- **Backend**: esbuild bundle to dist/index.js
- **Static Serving**: Express serves frontend assets in production
- **Database**: Persistent PostgreSQL via Neon Database

### Configuration Management
- **TypeScript**: Shared configuration across frontend/backend
- **Path Aliases**: Consistent import paths with @ and @shared prefixes
- **Tailwind**: Centralized design system configuration
- **Drizzle**: Database schema and migration management

### Performance Optimizations
- **Code Splitting**: Vite handles automatic code splitting
- **Asset Optimization**: Image compression and lazy loading
- **Animation Performance**: Hardware-accelerated CSS animations
- **Database**: Connection pooling via Neon serverless architecture

The application prioritizes mobile-first responsive design with premium animations and smooth user interactions, specifically optimized for driving phone-based appointment bookings for the barbershop business.