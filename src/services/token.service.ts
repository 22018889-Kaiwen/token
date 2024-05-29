import { Inject, Injectable } from '@nestjs/common';
import Web3 from 'web3';
import { HttpProvider } from 'web3-providers-http';
import * as FactoryABI from 'src/Factory.json';
import { TOKEN_REPOSITORY, TokenModel } from './token.model';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class TokenService {
  private web3: Web3;
  private factoryContractAddress: string;
  private privateKey: string;

  constructor(
    @Inject(TOKEN_REPOSITORY)
    private tokenRepository: typeof TokenModel,
  ) {
    const infuraUrl = `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`;
    this.web3 = new Web3(new HttpProvider(infuraUrl));
    this.factoryContractAddress = process.env.FACTORY_CONTRACT_ADDRESS;
    this.privateKey = process.env.PRIVATE_KEY;
  }

  async deployToken(dto: {
    name: string;
    symbol: string;
    decimals: number;
    initialSupply: number;
    ownerAddress: string;
  }) {
    const { name, symbol, decimals, initialSupply, ownerAddress } = dto;

    const factoryContract = new this.web3.eth.Contract(
      FactoryABI.abi,
      this.factoryContractAddress,
    );

    const deployTx = factoryContract.methods.deployToken(
      name,
      symbol,
      decimals,
      initialSupply,
      ownerAddress,
    );

    const gasPrice = await this.web3.eth.getGasPrice();

    const nonce = await this.web3.eth.getTransactionCount(ownerAddress);

    const txObject = {
      from: ownerAddress,
      to: this.factoryContractAddress,
      data: deployTx.encodeABI(),
      gasPrice,
      nonce,
    };

    const signedTx = await this.web3.eth.accounts.signTransaction(
      txObject,
      this.privateKey,
    );

    const receipt = await this.web3.eth.sendSignedTransaction(
      signedTx.rawTransaction,
    );

    const token = await this.tokenRepository.create({
      name,
      symbol,
      decimals,
      initialSupply,
      ownerAddress,
      transactionHash: receipt.transactionHash.toString(),
    });
    return token.transactionHash;
  }
}
