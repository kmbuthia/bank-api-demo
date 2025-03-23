import { Logger, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

import { ScoringController } from './scoring.controller';
import { ScoringService } from './scoring.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'REDIS_SCORING',
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            host: configService.get('cache.host'),
            port: configService.get('cache.port'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get('cache.host'),
            port: configService.get('cache.port'),
          },
          password: configService.get('cache.password'),
          ttl: configService.get('cache.defaultTTL'),
        }),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ScoringController],
  providers: [ScoringService, Logger],
})
export class ScoringModule {}
