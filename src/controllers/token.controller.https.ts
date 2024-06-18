import { Body, Controller, Get, Post } from '@nestjs/common';
import { BaseResponse } from 'src/base/base-response';
import { CreateNftCollectionDto, CreateTokenDto, MintNftDto } from './token.dtos';
import { TokenService } from 'src/services/ERC20/token.service';
import { NftService } from 'src/services/ERC721/nft.service';

@Controller('token')
export class TokenController {
  constructor(
    private readonly tokenService: TokenService,
    private readonly nftService: NftService,
  ) {}

  @Post('deploy')
  async deployToken(@Body() dto: CreateTokenDto): Promise<BaseResponse> {
    const token = await this.tokenService.createToken(dto);

    return {
      success: true,
      message: 'Token deployed successfully',
      data: token,
    };
  }

  @Post('createNftCollection')
  async deployNftCollection(@Body() dto: CreateNftCollectionDto): Promise<BaseResponse> {
    const nftAddress = await this.nftService.createNftCollection(dto);

    return {
      success: true,
      message: 'NFT deployed successfully',
      data: nftAddress,
    };
  }

  @Post('mintNft')
  async mintNft(@Body() dto: MintNftDto): Promise<BaseResponse> {
    const nftAddress = await this.nftService.mintNft(dto);

    return {
      success: true,
      message: 'NFT minted successfully',
      data: nftAddress,
    };
  }

  @Get('getBalance')
  async getBalance(): Promise<BaseResponse> {
    const balance = await this.nftService.getBalance();

    return {
      success: true,
      message: 'Balance fetched successfully',
      data: balance,
    };
  }
}
