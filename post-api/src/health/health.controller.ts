import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly mongoConnection: Connection) {}

  @Get()
  async check() {
    try {
      // Check MongoDB connection
      const isConnected = this.mongoConnection.readyState === 1;
      
      return {
        status: isConnected ? 'ok' : 'error',
        database: isConnected ? 'connected' : 'disconnected'
      };
    } catch (error) {
      return {
        status: 'error',
        database: 'error',
        message: error.message
      };
    }
  }
} 