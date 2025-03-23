import { Logger, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { LmsController } from './lms.controller';
import { LmsService } from './lms.service';
import { ScoringService } from '../scoring/scoring.service';
import { CoreBankingService } from '../core-banking/core-banking.service';
import { BasicAuthStrategy } from '../common/auth-strategies/basic.auth-strategy';

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
  controllers: [LmsController],
  providers: [
    LmsService,
    ScoringService,
    CoreBankingService,
    BasicAuthStrategy,
    Logger,
  ],
})
export class LmsModule {}
