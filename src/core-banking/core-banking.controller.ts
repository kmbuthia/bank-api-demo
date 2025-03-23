import { Controller, Get, Logger, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { CoreBankingService } from './core-banking.service';
import { TransactionsDTO } from 'src/common/dtos';

@Controller('v1/core-banking')
export class CoreBankingController {
  constructor(
    private cbService: CoreBankingService,
    private logger: Logger,
  ) {
    this.logger = new Logger(CoreBankingController.name);
  }

  @Get('/kyc')
  async customerKYC() {}

  @Get('/transactions')
  async customerTransactions(
    @Query() query: TransactionsDTO,
    @Res() res: Response,
  ) {
    try {
      const response = await this.cbService.getTransactions(
        query.customerNumber,
      );
      return res.status(200).send(response);
    } catch (err) {
      this.logger.error(err.stack);
      return res.status(400).send(err.message);
    }
  }
}
