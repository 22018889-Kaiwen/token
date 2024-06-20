import { Inject, Injectable } from '@nestjs/common';
import Web3 from 'web3';
import * as TokenFactoryABI from 'src/TokenFactory.json';
import { TOKEN_REPOSITORY, TokenModel } from '../ERC20/token.model';
import * as dotenv from 'dotenv';
import { FireblocksSDK } from 'fireblocks-sdk';
import * as fs from 'fs';

dotenv.config();

@Injectable()
export class TokenService {
  private web3: Web3;
  private factoryContractAddress: string;
  private privateKey: string;
  private fireblocks: FireblocksSDK;

  constructor(
    @Inject(TOKEN_REPOSITORY)
    private tokenRepository: typeof TokenModel,
  ) {
    const infuraUrl = `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`;
    this.privateKey = process.env.DEV_PRIVATE_KEY;
    if (!this.privateKey.startsWith('0x')) {
      this.privateKey = `0x${this.privateKey}`;
    }

    this.web3 = new Web3(new Web3.providers.HttpProvider(infuraUrl));
    this.factoryContractAddress = process.env.FACTORY_CONTRACT_ADDRESS;

    if (!this.factoryContractAddress) {
      throw new Error(
        'Factory contract address is not defined in the environment variables.',
      );
    }

    const fireblocksApiKey = process.env.FIREBLOCKS_API_KEY;
    if (!fireblocksApiKey) {
      throw new Error('FIREBLOCKS_API_KEY is required');
    }

    const fireblocksPrivatePath = process.env.FIREBLOCKS_API_SECRET_PATH;
    if (!fireblocksPrivatePath) {
      throw new Error('FIREBLOCKS_PRIVATE_KEY_PATH is required');
    }

    const fireblocksBaseUrl = process.env.FIREBLOCKS_BASE_URL;
    if (!fireblocksBaseUrl) {
      throw new Error('FIREBLOCKS_BASE_URL is required');
    }

    const fireblocksPrivateKey = fs.readFileSync(
      fireblocksPrivatePath,
      'utf-8',
    );

    this.fireblocks = new FireblocksSDK(
      fireblocksPrivateKey,
      fireblocksApiKey,
      fireblocksBaseUrl,
    );
  }
  async createToken(dto: {
    name: string;
    symbol: string;
    decimals: number;
    initialSupply: number;
  }) {
    const { name, symbol, decimals, initialSupply } = dto;

    const account = this.web3.eth.accounts.privateKeyToAccount(this.privateKey);
    const ownerAddress = account.address;

    this.web3.eth.accounts.wallet.add(account);
    this.web3.eth.defaultAccount = ownerAddress;

    const factoryContract = new this.web3.eth.Contract(
      TokenFactoryABI.abi,
      this.factoryContractAddress,
    );

    const deployTx = factoryContract.methods.createToken(
      name,
      symbol,
      decimals,
      initialSupply,
    );

    const nonce = await this.web3.eth.getTransactionCount(ownerAddress);
    const gasPrice = await this.web3.eth.getGasPrice();

    const txObject = {
      from: ownerAddress,
      to: this.factoryContractAddress,
      data: deployTx.encodeABI(),
      nonce,
      gasPrice: gasPrice.toString(),
    };

    const signedTx = await this.web3.eth.accounts.signTransaction(
      txObject,
      this.privateKey,
    );

    const receipt = await this.web3.eth.sendSignedTransaction(
      signedTx.rawTransaction,
    );

    console.log('Transaction receipt:', receipt);

    const tokenAddress = receipt.logs[0].address;
    console.log('Token address:', tokenAddress);

    const token = await this.tokenRepository.create({
      contractAddress: tokenAddress,
      name: name,
      symbol: symbol,
      decimals: decimals,
      initialSupply: initialSupply,
    });

    await this.registerAssetOnFireblocks(token.contractAddress, symbol);

    return token.contractAddress;
  }

  async registerAssetOnFireblocks(contractAddress: string, symbol: string) {
    const blockchainId = 'ETH_TEST5';
    try {
      const registerAsset = await this.fireblocks.registerNewAsset(
        blockchainId,
        contractAddress,
        symbol,
      );
      console.log('Registered asset on Fireblocks', registerAsset);
    } catch (error) {
      console.error('Error registering asset on Fireblocks', error);
    }
  }
}
