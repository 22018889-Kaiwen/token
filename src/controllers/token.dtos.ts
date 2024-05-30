import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class DeployTokenDto {
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

export class AllowanceTokensDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly tokenAddress: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly owner: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly spender: string;
}

export class BalanceOfTokensDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly tokenAddress: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly owner: string;
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
  readonly tokens: number;
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
  readonly tokens: number;
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
  readonly tokens: number;
}

export class ApproveTokensDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly tokenAddress: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly spender: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  readonly tokens: number;
}

export class BurnTokensDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly tokenAddress: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly from: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  readonly tokens: number;
}
