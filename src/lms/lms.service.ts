import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ScoringService } from 'src/scoring/scoring.service';

@Injectable()
export class LmsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private scoringService: ScoringService,
  ) {}

  async createLoanApplication(customerNumber: number, amount: number) {
    const response = await this.scoringService.initQueryScore(customerNumber);
    if (response.message?.token) {
      // Save to cache
      await this.cacheManager.set(
        `customer_loan_${response.message?.token}`,
        JSON.stringify({
          customerNumber,
          amount,
          status: 'pending',
          token: response.message?.token,
        }),
        1000 * 60 * 60, // 1 hour
      );
      return {
        message: 'Loan application submitted successfully.',
        token: response.message?.token,
      };
    }
    throw new BadRequestException({
      statusCode: 400,
      message: 'Loan application failed. Please try again.',
    });
  }

  async getLoanApplicationStatus(token: string) {
    const customerLoan: string = await this.cacheManager.get(
      `customer_loan_${token}`,
    );
    if (customerLoan) {
      return { message: JSON.parse(customerLoan) };
    }
    throw new BadRequestException({
      statusCode: 400,
      message: 'Loan application not found',
    });
  }
}
