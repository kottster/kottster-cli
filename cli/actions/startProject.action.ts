import nodemon from 'nodemon';
import { API } from '../services/api.service';
import { getEnvOrThrow } from '../utils/getEnvOrThrow';

/**
 * Start the project in the current directory.
 * @param script The path to the script file (src/main.js). 
 */
export async function startProject (): Promise<void> {
  // Read config
  const appId = getEnvOrThrow('APP_ID');
  const secretKey = getEnvOrThrow('SECRET_KEY');
  const script = 'src/main.js';
  
  // Get JWT secret using secret key
  const jwtSecret = API.getJWTSecret(appId, secretKey);
  
  nodemon({
    script,
    watch: ['src', '.env'],
    ext: 'js',
    execMap: {
      js: 'node --no-warnings --experimental-specifier-resolution=node',
    },
    env: {
      ...process.env,
      JWT_SECRET: jwtSecret,
    },
  })
    .on('crash', () => process.exit())
    .on('quit', () => process.exit());
}
