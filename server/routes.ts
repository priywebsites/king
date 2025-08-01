import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    console.log('[SERVER DEBUG] Health check endpoint called');
    res.json({ 
      status: 'healthy',
      message: 'Kings Barber Shop website is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  // Basic test endpoint
  app.get('/api/test', (req, res) => {
    console.log('[SERVER DEBUG] Test endpoint called');
    res.json({ 
      message: 'Kings Barber Shop API is working',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      features: ['Static website', 'External booking integration']
    });
  });

  const server = createServer(app);
  return server;
}