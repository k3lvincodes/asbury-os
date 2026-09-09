import fs from 'node:fs';
import path from 'node:path';

// Automatically load .env into process.env if present
try {
  if (typeof process.loadEnvFile === 'function') {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      process.loadEnvFile(envPath);
    }
  }
} catch (e) {
  // Ignore if already loaded or missing
}

// Backend entry point
// Imports and starts the Node.js server
import './worker';

