import { Body, Controller, Post } from '@nestjs/common';
import { TokenService } from '../services/token.service';
import { BaseResponse } from 'src/base/base-response';
import {
  CreateTokenDto,
} from './token.dtos';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('deploy')
  async deployToken(@Body() dto: CreateTokenDto): Promise<BaseResponse> {
    const receipt = await this.tokenService.createToken(dto);

    return {
      success: true,
      message: 'Token deployed successfully',
      data: receipt,
    };
  }

  // @Post('mint')
  // async mint(@Body() dto: MintTokensDto): Promise<BaseResponse> {
  //   const tx = await this.tokenService.mintTokens(dto);

  //   return {
  //     success: true,
  //     message: 'Tokens minted successfully',
  //     data: tx,
  //   };
  // }

  // @Post('transfer')
  // async transfer(@Body() dto: TransferTokensDto): Promise<BaseResponse> {
  //   const tx = await this.tokenService.transferTokens(dto);

  //   return {
  //     success: true,
  //     message: 'Tokens transferred successfully',
  //     data: tx,
  //   };
  // }

  // @Post('transferFrom')
  // async transferFrom(
  //   @Body() dto: TransferFromTokensDto,
  // ): Promise<BaseResponse> {
  //   const tx = await this.tokenService.transferFromTokens(dto);

  //   return {
  //     success: true,
  //     message: 'Tokens transferred successfully',
  //     data: tx,
  //   };
  // }

  // @Post('burn')
  // async burn(@Body() dto: BurnTokensDto): Promise<BaseResponse> {
  //   const tx = await this.tokenService.burnTokens(dto);

  //   return {
  //     success: true,
  //     message: 'Tokens burned successfully',
  //     data: tx,
  //   };
  // }
}
