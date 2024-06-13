import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

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
  @Min(1)
  readonly initialSupply: number;
}

export class CreateNftCollectionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly symbol: string;
}

export class MintNftDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly tokenAddress: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly to: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly tokenURI: string;
}
