import { config } from 'dotenv';
import { MongooseModuleOptions } from '@nestjs/mongoose';

// Load environment variables
config();

// Get connection string and password from environment variables
const MONGO_URL = process.env.MONGO_URL;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;

if (!MONGO_URL || !MONGO_PASSWORD) {
  throw new Error('MONGO_URL or MONGO_PASSWORD environment variables are not defined');
}

// Replace <password> with actual password in the connection string
const connectionString = MONGO_URL.replace('<password>', MONGO_PASSWORD);

// Export MongoDB configuration for NestJS MongooseModule
export const mongodbConfig = {
  uri: connectionString,
  authSource: 'admin',
  retryWrites: true,
  ssl: true,
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true
} as const; 