import { Body, Controller, Post } from '@nestjs/common';
import { BaseResponse } from 'src/base/base-response';
import { CreateTokenDto } from './token.dtos';
import { TokenService } from 'src/services/ERC20/token.service';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('deploy')
  async deployToken(@Body() dto: CreateTokenDto): Promise<BaseResponse> {
    const token = await this.tokenService.createToken(dto);

    return {
      success: true,
      message: 'Token deployed successfully',
      data: token,
    };
  }
}
