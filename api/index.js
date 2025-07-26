// Vercel serverless function entry point
const path = require('path');

console.log('[VERCEL DEBUG] API entry point called');

// Import the built server
const serverPath = path.join(__dirname, '../dist/index.js');
console.log('[VERCEL DEBUG] Loading server from:', serverPath);

try {
  const server = require(serverPath);
  console.log('[VERCEL DEBUG] Server loaded successfully');
  module.exports = server;
} catch (error) {
  console.error('[VERCEL DEBUG] Error loading server:', error);
  
  // Fallback export
  module.exports = (req, res) => {
    console.error('[VERCEL DEBUG] Fallback handler called');
    res.status(500).json({ 
      error: 'Server failed to load', 
      message: error.message,
      timestamp: new Date().toISOString()
    });
  };
}