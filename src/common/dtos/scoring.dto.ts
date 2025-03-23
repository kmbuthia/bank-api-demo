import { IsNumber, IsString } from 'class-validator';

export class QueryScoreDTO {
  @IsNumber()
  customerNumber: number;
}

export class ScoreClientDTO {
  @IsString()
  url: string;

  @IsString()
  name: string;

  @IsString()
  username: string;

  @IsString()
  password: string;
}
