import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { v4 as UUIDV4 } from 'uuid';
import * as https from 'https';
import { ClientProxy } from '@nestjs/microservices';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { CheckScoreEvent, CustomerScore, Loan } from '../common/types';
import { ScoreClientDTO } from '../common/dtos';

const agent = new https.Agent({
  keepAlive: true,
});

// TODO: Implement OnModuleInit to check cache for restart persistence
@Injectable()
export class ScoringService {
  scoringAxiosInstance: AxiosInstance;

  constructor(
    @Inject('REDIS_SCORING') private redisClient: ClientProxy,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
    private logger: Logger,
  ) {
    this.scoringAxiosInstance = axios.create({
      baseURL: this.configService.get('scoring.url'),
      httpsAgent: agent,
      timeout: 60000, // 60 seconds
    });
    this.logger = new Logger(ScoringService.name);
  }

  async createClient(clientDetails: ScoreClientDTO) {
    const response = await this.scoringAxiosInstance.post(
      '/client/createClient',
      clientDetails,
    );
    if (this.configService.get('app.mockAPI')) {
      response.data = {
        ...response.data,
        url: clientDetails.url,
        name: clientDetails.name,
        username: clientDetails.username,
        password: clientDetails.password,
        token: UUIDV4(),
      };
    }
    // Store token
    await this.cacheManager.set(
      'app-client-token',
      response.data?.token,
      1000 * 60 * 60, // 1 hour
    );
    return response.data;
  }

  async initQueryScore(customerNumber: number) {
    // First check if customer already has score request in progress
    const scoreInProgress = await this.cacheManager.get(
      `customer_score_${customerNumber}`,
    );
    if (scoreInProgress) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'This customer already has a request in progress',
      });
    }
    // Send request to scoring API
    const clientToken: string | null =
      await this.cacheManager.get('app-client-token');
    console.log('TOKEN:', clientToken);
    const response = await this.scoringAxiosInstance.get(
      `/initiateQueryScore/${customerNumber}`,
      {
        headers: {
          'client-token': clientToken,
        },
      },
    );
    if (this.configService.get('app.mockAPI')) {
      response.data = {
        token: UUIDV4(),
      };
    }
    // console.log(response.status, response.data);
    // Save info to cache
    await this.cacheManager.set(
      `customer_score_${customerNumber}`,
      `in_progress_${response.data?.token}`,
      this.configService.get('cache.defaultTTL'),
    );
    this.redisClient.emit(
      this.configService.get('scoring.checkScoreEvent'),
      JSON.stringify({
        customerNumber,
        token: response.data?.token,
        retries: 0,
      }),
    );
    return { message: response.data };
  }

  // NB. To be called by event listener only
  async getQueryScore(eventData: CheckScoreEvent) {
    const clientToken: string | null =
      await this.cacheManager.get('app-client-token');
    const response = await this.scoringAxiosInstance.get(
      `/queryScore/${eventData.token}`,
      {
        headers: {
          'client-token': clientToken,
          attempt: eventData.retries,
        },
      },
    );
    this.logger.log(response.data);
    if (response.data?.score) {
      // Update loan application
      if (this.configService.get('app.mockAPI')) {
        response.data = {
          ...response.data,
          customerNumber: eventData.customerNumber,
        };
      }
      this.logger.log(response.data);
      await this.updateLoanApplication(eventData.token, response.data);
      await this.cacheManager.del(`customer_score_${eventData.customerNumber}`);
    } else if (eventData.retries < 10) {
      // Retry in 5 seconds if retry limit not reached
      setTimeout(() => {
        this.redisClient.emit(
          this.configService.get('scoring.checkScoreEvent'),
          JSON.stringify({
            customerNumber: eventData.customerNumber,
            token: eventData.token,
            retries: eventData.retries + 1,
          }),
        );
      }, 5000);
    } else {
      this.logger.warn(
        `Retries exceeded for customer: ${eventData.customerNumber}`,
      );
    }
  }

  async updateLoanApplication(token: string, customerScore: CustomerScore) {
    const customerLoan: string | null = await this.cacheManager.get(
      `customer_loan_${token}`,
    );
    if (customerLoan) {
      await this.validateLoanApplication(
        token,
        JSON.parse(customerLoan),
        customerScore,
      );
    }
  }

  async validateLoanApplication(
    token: string,
    customerLoan: Loan,
    customerScore: CustomerScore,
  ) {
    // Check if loan amount valid. Check if no exclusion.
    if (customerLoan.amount > customerScore.limitAmount) {
      await this.cacheManager.set(
        `customer_loan_${token}`,
        JSON.stringify({
          ...customerLoan,
          status: 'rejected',
          reason: `Loan amount exceeds allowed limit of: ${customerScore.limitAmount}`,
        }),
      );
    } else if (customerScore.exclusion !== 'No Exclusion') {
      await this.cacheManager.set(
        `customer_loan_${token}`,
        JSON.stringify({
          ...customerLoan,
          status: 'rejected',
          reason: customerScore.exclusionReason,
        }),
      );
    } else {
      await this.cacheManager.set(
        `customer_loan_${token}`,
        JSON.stringify({
          ...customerLoan,
          status: 'approved',
        }),
      );
    }
  }
}
