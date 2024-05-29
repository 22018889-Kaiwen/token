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

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly ownerAddress: string;
}
