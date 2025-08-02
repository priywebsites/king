// Vercel serverless function entry point
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let serverHandler = null;

const initializeServer = async () => {
  if (!serverHandler) {
    try {
      const serverPath = join(__dirname, '../dist/server.mjs');
      const server = await import(serverPath);
      serverHandler = server.default || server;
    } catch (error) {
      console.error('Error loading server:', error);
      serverHandler = (req, res) => {
        res.status(500).json({ 
          error: 'Server failed to load', 
          message: error.message 
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