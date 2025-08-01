// Vercel serverless function entry point
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('[VERCEL DEBUG] API entry point called');

// Dynamic import wrapper
let serverHandler = null;

const initializeServer = async () => {
  if (!serverHandler) {
    try {
      const serverPath = join(__dirname, '../dist/index.mjs');
      console.log('[VERCEL DEBUG] Loading server from:', serverPath);
      
      const server = await import(serverPath);
      console.log('[VERCEL DEBUG] Server loaded successfully');
      serverHandler = server.default || server;
    } catch (error) {
      console.error('[VERCEL DEBUG] Error loading server:', error);
      serverHandler = (req, res) => {
        console.error('[VERCEL DEBUG] Fallback handler called');
        res.status(500).json({ 
          error: 'Server failed to load', 
          message: error.message,
          timestamp: new Date().toISOString()
        });
      };
    }
  }
  return serverHandler;
};

export default async (req, res) => {
  const handler = await initializeServer();
  return handler(req, res);
};