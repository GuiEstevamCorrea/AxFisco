import { Injectable } from '@nestjs/common';
import { MessageBroker } from '@application/ports/infrastructure.interface';

@Injectable()
export class RabbitMQService implements MessageBroker {
  private isConnected = false;

  constructor() {
    this.connect();
  }

  private async connect(): Promise<void> {
    try {
      // Simplified connection for demo - would use amqplib in production
      console.log('✅ Connected to RabbitMQ (Mock)');
      this.isConnected = true;
    } catch (error) {
      console.error('❌ Failed to connect to RabbitMQ:', error);
      setTimeout(() => this.connect(), 5000);
    }
  }

  async publish(queue: string, message: any): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      // Mock implementation
      console.log(`📤 Message sent to queue '${queue}':`, message);
    } catch (error) {
      console.error(`❌ Failed to publish message to queue '${queue}':`, error);
      throw error;
    }
  }

  async subscribe(queue: string, callback: (message: any) => void): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      // Mock implementation
      console.log(`👂 Listening to queue '${queue}'`);
    } catch (error) {
      console.error(`❌ Failed to subscribe to queue '${queue}':`, error);
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      this.isConnected = false;
      console.log('✅ RabbitMQ connection closed');
    } catch (error) {
      console.error('❌ Failed to close RabbitMQ connection:', error);
    }
  }
}
