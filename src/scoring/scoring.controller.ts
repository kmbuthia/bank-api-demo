import { Body, Controller, Logger, Post, Res, UseGuards } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RedisContext,
} from '@nestjs/microservices';
import { Response } from 'express';
import { ScoringService } from './scoring.service';
import { ScoreClientDTO } from '../common/dtos';
import { BasicAuthGuard } from '../common/guards';
// import { QueryScoreDTO } from 'src/common/dtos';

@Controller('v1/scoring')
export class ScoringController {
  constructor(
    private scoringService: ScoringService,
    private logger: Logger,
  ) {
    this.logger = new Logger(ScoringController.name);
  }

  @Post('/')
  @UseGuards(BasicAuthGuard)
  async createClient(@Body() body: ScoreClientDTO, @Res() res: Response) {
    try {
      const response = await this.scoringService.createClient(body);
      return res.status(200).send(response);
    } catch (err) {
      this.logger.error(err.stack);
      return res.status(400).send(err.message);
    }
  }

  // @Get('/init')
  // async initQueryScore(@Query() query: QueryScoreDTO) {
  //   return this.scoringService.initQueryScore(query);
  // }

  // @Get('/status')
  // async getQueryScore() {}

  @MessagePattern('checkscore')
  async checkScore(@Payload() data: any, @Ctx() context: RedisContext) {
    try {
      console.log(`Processing message from channel: ${context.getChannel()}`);
      console.log('Processing data:', JSON.parse(data));
      await this.scoringService.getQueryScore(JSON.parse(data));
    } catch (err) {
      this.logger.error(err.stack);
    }
  }
}
