import { IsNumber } from 'class-validator';

export class TransactionsDTO {
  @IsNumber()
  customerNumber: number;
}
