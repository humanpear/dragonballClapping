import { Module } from '@nestjs/common';
import { MatchGateway } from './match.gateway';
import { PrismaService } from './prisma.service';

@Module({
  providers: [MatchGateway, PrismaService]
})
export class AppModule {}
