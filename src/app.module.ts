import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LmsModule } from './lms/lms.module';
import { CoreBankingModule } from './core-banking/core-banking.module';
import { ScoringModule } from './scoring/scoring.module';
import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
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
        isGlobal: true,
      }),
      inject: [ConfigService],
    }),
    LmsModule,
    CoreBankingModule,
    ScoringModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
