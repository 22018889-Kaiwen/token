import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateTokenDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly symbol: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  readonly decimals: number;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  readonly initialSupply: number;
}

export class MintTokensDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly tokenAddress: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly to: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  readonly amount: number;
}
export class BurnTokensDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly tokenAddress: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  readonly amount: number;
}

export class TransferTokensDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly tokenAddress: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly to: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  readonly amount: number;
}

export class TransferFromTokensDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly tokenAddress: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly from: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly to: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  readonly amount: number;
}
