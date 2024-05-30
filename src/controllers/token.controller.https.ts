import { Body, Controller, Delete, Post, Put } from '@nestjs/common';
import { TokenService } from '../services/token.service';
import { BaseResponse } from 'src/base/base-response';
import {
  DeployTokenDto,
  AllowanceTokensDto,
  BalanceOfTokensDto,
  MintTokensDto,
  TransferTokensDto,
  TransferFromTokensDto,
  ApproveTokensDto,
  BurnTokensDto,
} from './token.dtos';

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

  @Post('allowance')
  async allowance(
    @Body() allowanceTokensDto: AllowanceTokensDto,
  ): Promise<BaseResponse> {
    const allowance = await this.tokenService.allowanceTokens(allowanceTokensDto);

    return {
      success: true,
      message: 'Tokens allowance checked successfully',
      data: allowance,
    };
  }

  @Post('balanceOf')
  async balanceOf(
    @Body() balanceOfTokensDto: BalanceOfTokensDto,
  ): Promise<BaseResponse> {
    const balanceOf = await this.tokenService.balanceOfTokens(balanceOfTokensDto);

    return {
      success: true,
      message: 'Tokens balance checked successfully',
      data: balanceOf,
    };
  }

  @Put('mint')
  async mint(@Body() mintTokensDto: MintTokensDto): Promise<BaseResponse> {
    const mint = await this.tokenService.mintTokens(mintTokensDto);

    return {
      success: true,
      message: 'Tokens minted successfully',
      data: mint,
    };
  }

  @Put('transfer')
  async transfer(
    @Body() transferTokensDto: TransferTokensDto,
  ): Promise<BaseResponse> {
    const transfer = await this.tokenService.transferTokens(transferTokensDto);

    return {
      success: true,
      message: 'Tokens transferred successfully',
      data: transfer,
    };
  }

  @Put('transferFrom')
  async transferFrom(
    @Body() transferFromTokenDto: TransferFromTokensDto,
  ): Promise<BaseResponse> {
    const transferFrom = await this.tokenService.transferFromTokens(
      transferFromTokenDto,
    );

    return {
      success: true,
      message: 'Tokens transferred successfully',
      data: transferFrom,
    };
  }

  @Put('approve')
  async approve(
    @Body() approveTokensDto: ApproveTokensDto,
  ): Promise<BaseResponse> {
    const approval = await this.tokenService.approveTokens(approveTokensDto);

    return {
      success: true,
      message: 'Tokens approved successfully',
      data: approval,
    };
  }

  @Delete('burn')
  async burn(@Body() burnTokensDto: BurnTokensDto): Promise<BaseResponse> {
    const burn = await this.tokenService.burnTokens(burnTokensDto);

    return {
      success: true,
      message: 'Tokens burned successfully',
      data: burn,
    };
  }
}
