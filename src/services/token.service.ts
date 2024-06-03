import { Inject, Injectable } from '@nestjs/common';
import Web3 from 'web3';
import * as TokenFactoryABI from 'src/TokenFactory.json';
import { TOKEN_REPOSITORY, TokenModel } from './token.model';
import * as dotenv from 'dotenv';
dotenv.config();

const HDWalletProvider = require('@truffle/hdwallet-provider');

export enum EventType {
  DEPLOYTOKEN = 'DEPLOY_TOKEN',
  // MINT = 'MINT',
  // BURN = 'BURN',
  // TRANSFER = 'TRANSFER',
  // TRANSFERFROM = 'TRANSFER_FROM',
}

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
    const privateKey = process.env.DEV_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('PRIVATE_KEY is required');
    }
    this.privateKey = privateKey;

    const provider = new HDWalletProvider({
      privateKeys: [this.privateKey],
      providerOrUrl: infuraUrl,
    });

    this.web3 = new Web3(provider);
    this.factoryContractAddress = process.env.FACTORY_CONTRACT_ADDRESS;

    if (!this.factoryContractAddress) {
      throw new Error(
        'Factory contract address is not defined in the environment variables.',
      );
    }
  }

  async createToken(dto: {
    name: string;
    symbol: string;
    decimals: number;
    initialSupply: number;
  }) {
    const { name, symbol, decimals, initialSupply } = dto;

    const accounts = await this.web3.eth.getAccounts();
    const ownerAddress = accounts[0];

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

    const formattedReceipt = this.formatReceipt(receipt);

    const token = await this.tokenRepository.create({
      transactionHash: formattedReceipt.transactionHash,
      type: EventType.DEPLOYTOKEN,
      from: formattedReceipt.from,
      to: formattedReceipt.to,
      contractAddress: formattedReceipt.contractAddress,
    });

    if (!token) {
      throw new Error('Failed to create token record in the database.');
    }

    return formattedReceipt;
  }

  // async mintTokens(dto: { tokenAddress: string; to: string; amount: number }) {
  //   const { tokenAddress, to, amount } = dto;
  //   const accounts = await this.web3.eth.getAccounts();
  //   const ownerAddress = accounts[0];

  //   const tokenContract = new this.web3.eth.Contract(
  //     TokenABI.abi,
  //     tokenAddress,
  //   );
  //   const mintTx = tokenContract.methods.mint(to, amount);

  //   const gasPrice = await this.web3.eth.getGasPrice();
  //   const nonce = await this.web3.eth.getTransactionCount(ownerAddress);

  //   const txObject = {
  //     from: ownerAddress,
  //     to: tokenAddress,
  //     data: mintTx.encodeABI(),
  //     gasPrice,
  //     nonce,
  //   };

  //   const signedTx = await this.web3.eth.accounts.signTransaction(
  //     txObject,
  //     this.privateKey,
  //   );

  //   const receipt = await this.web3.eth.sendSignedTransaction(
  //     signedTx.rawTransaction,
  //   );

  //   const mint = await this.tokenRepository.create({
  //     transactionHash: receipt.transactionHash.toString(),
  //     type: EventType.MINT,
  //     from: receipt.from,
  //     to: receipt.to,
  //   });

  //   return mint.transactionHash;
  // }

  // async burnTokens(dto: { tokenAddress: string; amount: number }) {
  //   const { tokenAddress, amount } = dto;

  //   const accounts = await this.web3.eth.getAccounts();
  //   const ownerAddress = accounts[0];

  //   const tokenContract = new this.web3.eth.Contract(
  //     TokenABI.abi,
  //     tokenAddress,
  //   );

  //   const burnTx = tokenContract.methods.burn(amount);

  //   const gasPrice = await this.web3.eth.getGasPrice();

  //   const nonce = await this.web3.eth.getTransactionCount(ownerAddress);

  //   const txObject = {
  //     from: ownerAddress,
  //     to: tokenAddress,
  //     data: burnTx.encodeABI(),
  //     gasPrice,
  //     nonce,
  //   };

  //   const signedTx = await this.web3.eth.accounts.signTransaction(
  //     txObject,
  //     this.privateKey,
  //   );

  //   const receipt = await this.web3.eth.sendSignedTransaction(
  //     signedTx.rawTransaction,
  //   );

  //   const burn = await this.tokenRepository.create({
  //     transactionHash: receipt.transactionHash.toString(),
  //     type: EventType.BURN,
  //     from: receipt.from,
  //     to: receipt.to,
  //   });
  //   return burn.transactionHash;
  // }

  // async transferTokens(dto: {
  //   tokenAddress: string;
  //   to: string;
  //   amount: number;
  // }) {
  //   const { tokenAddress, to, amount } = dto;

  //   const accounts = await this.web3.eth.getAccounts();
  //   const ownerAddress = accounts[0];

  //   const tokenContract = new this.web3.eth.Contract(
  //     TokenABI.abi,
  //     tokenAddress,
  //   );

  //   const transferTx = tokenContract.methods.transfer(to, amount);

  //   const gasPrice = await this.web3.eth.getGasPrice();

  //   const nonce = await this.web3.eth.getTransactionCount(ownerAddress);

  //   const txObject = {
  //     from: ownerAddress,
  //     to: tokenAddress,
  //     data: transferTx.encodeABI(),
  //     gasPrice,
  //     nonce,
  //   };

  //   const signedTx = await this.web3.eth.accounts.signTransaction(
  //     txObject,
  //     this.privateKey,
  //   );

  //   const receipt = await this.web3.eth.sendSignedTransaction(
  //     signedTx.rawTransaction,
  //   );

  //   const transfer = await this.tokenRepository.create({
  //     transactionHash: receipt.transactionHash.toString(),
  //     type: EventType.TRANSFER,
  //     from: receipt.from,
  //     to: receipt.to,
  //   });
  //   return transfer.transactionHash;
  // }

  // async transferFromTokens(dto: {
  //   tokenAddress: string;
  //   from: string;
  //   to: string;
  //   amount: number;
  // }) {
  //   const { tokenAddress, from, to, amount } = dto;

  //   const accounts = await this.web3.eth.getAccounts();
  //   const ownerAddress = accounts[0];

  //   const tokenContract = new this.web3.eth.Contract(
  //     TokenABI.abi,
  //     tokenAddress,
  //   );

  //   const transferFromTx = tokenContract.methods.transferFrom(from, to, amount);

  //   const gasPrice = await this.web3.eth.getGasPrice();

  //   const nonce = await this.web3.eth.getTransactionCount(ownerAddress);

  //   const txObject = {
  //     from: ownerAddress,
  //     to: tokenAddress,
  //     data: transferFromTx.encodeABI(),
  //     gasPrice,
  //     nonce,
  //   };

  //   const signedTx = await this.web3.eth.accounts.signTransaction(
  //     txObject,
  //     this.privateKey,
  //   );

  //   const receipt = await this.web3.eth.sendSignedTransaction(
  //     signedTx.rawTransaction,
  //   );

  //   const transferFrom = await this.tokenRepository.create({
  //     transactionHash: receipt.transactionHash.toString(),
  //     type: EventType.TRANSFERFROM,
  //     from: receipt.from,
  //     to: receipt.to,
  //   });
  //   return transferFrom.transactionHash;
  // }

  formatReceipt(receipt: any) {
    return {
      transactionHash: receipt.transactionHash,
      blockHash: receipt.blockHash,
      blockNumber: receipt.blockNumber,
      contractAddress: receipt.contractAddress,
      gasUsed: receipt.gasUsed,
      cumulativeGasUsed: receipt.cumulativeGasUsed,
      from: receipt.from,
      to: receipt.to,
      status: receipt.status,
      events: receipt.events,
    };
  }
}
