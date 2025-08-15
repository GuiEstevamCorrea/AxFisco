import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      message: 'AxFisco API is running!',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  getHealth(): object {
    return {
      status: 'ok',
      service: 'AxFisco API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }
}
