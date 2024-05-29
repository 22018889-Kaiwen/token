import { Body, Controller, Post } from '@nestjs/common';
import { TokenService } from '../services/token.service';
import { BaseResponse } from 'src/base/base-response';
import { DeployTokenDto } from './token.dtos';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Post('deploy')
  async deployToken(
    @Body() deployTokenDto: DeployTokenDto,
  ): Promise<BaseResponse> {
    const token = await this.tokenService.deployToken(deployTokenDto);

    return {
      success: true,
      message: 'Token deployed successfully',
      data: token,
    };
  }
}
