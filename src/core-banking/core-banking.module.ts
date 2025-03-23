import { Logger, Module } from '@nestjs/common';
import { CoreBankingController } from './core-banking.controller';
import { CoreBankingService } from './core-banking.service';

@Module({
  controllers: [CoreBankingController],
  providers: [CoreBankingService, Logger],
})
export class CoreBankingModule {}
