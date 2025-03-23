import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { LmsService } from './lms.service';
import { LoanAppDTO, LoanQueryDTO, LoanSubscribeDTO } from '../common/dtos';
import { CoreBankingService } from '../core-banking/core-banking.service';
import { BasicAuthGuard } from '../common/guards';

@Controller('v1/lms')
export class LmsController {
  constructor(
    private lmsService: LmsService,
    private cbService: CoreBankingService,
    private logger: Logger,
  ) {
    this.logger = new Logger(LmsController.name);
  }

  @Post('/subscribe')
  @UseGuards(BasicAuthGuard)
  async subscribe(@Body() body: LoanSubscribeDTO, @Res() res: Response) {
    try {
      const response = await this.cbService.getKYC(body.customerNumber);
      return res.status(200).send(response);
    } catch (err) {
      this.logger.error(err.stack);
      return res.status(400).send(err.message);
    }
  }

  @Post('/loan')
  @UseGuards(BasicAuthGuard)
  async loanRequest(@Body() body: LoanAppDTO, @Res() res: Response) {
    try {
      const response = await this.lmsService.createLoanApplication(
        body.customerNumber,
        body.amount,
      );
      return res.status(200).send(response);
    } catch (err) {
      this.logger.error(err.stack);
      return res.status(400).send(err.message);
    }
  }

  @Get('/loan')
  @UseGuards(BasicAuthGuard)
  async loanStatus(@Query() query: LoanQueryDTO, @Res() res: Response) {
    try {
      const response = await this.lmsService.getLoanApplicationStatus(
        query.token,
      );
      return res.status(200).send(response);
    } catch (err) {
      this.logger.error(err.stack);
      return res.status(400).send(err.message);
    }
  }
}
