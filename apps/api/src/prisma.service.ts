import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma connected');
    } catch {
      this.logger.warn('Prisma unavailable, running without DB persistence');
    }
  }

  async safeCreateMatchEvent(data: { matchId: string; turnIndex: number; type: string; payload: unknown }) {
    try {
      return await this.matchEvent.create({ data });
    } catch {
      this.logger.warn(`Failed to persist match event: ${data.type}`);
      return null;
    }
  }
}
