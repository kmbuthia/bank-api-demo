import { IsIn, IsNumber, IsString } from 'class-validator';

export class LoanAppDTO {
  @IsNumber()
  @IsIn([234774784, 318411216, 340397370, 366585630, 397178638])
  customerNumber: number;

  @IsNumber()
  amount: number;
}

export class LoanQueryDTO {
  @IsString()
  token: string;
}

export class LoanSubscribeDTO {
  @IsNumber()
  @IsIn([234774784, 318411216, 340397370, 366585630, 397178638])
  customerNumber: number;
}
