import { Inject, Injectable } from '@nestjs/common';
import Web3 from 'web3';
import { HttpProvider } from 'web3-providers-http';
import * as FactoryABI from 'src/Factory.json';
import { TOKEN_REPOSITORY, TokenModel } from './token.model';
import * as dotenv from 'dotenv';
dotenv.config();

export enum EventType {
  DEPLOYTOKEN = 'DEPLOY_TOKEN',
  MINT = 'MINT',
  BURN = 'BURN',
  TRANSFER = 'TRANSFER',
  TRANSFERFROM = 'TRANSFER_FROM',
  APPROVAL = 'APPROVAL',
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
    this.web3 = new Web3(new HttpProvider(infuraUrl));
    this.factoryContractAddress = process.env.FACTORY_CONTRACT_ADDRESS;
    this.privateKey = process.env.PRIVATE_KEY;
  }

  async deployToken(dto: {
    name: string;
    symbol: string;
    decimals: number;
    initialSupply: number;
  }) {
    const { name, symbol, decimals, initialSupply } = dto;

    const ownerAddress = process.env.OWNER_ADDRESS;

    const factoryContract = new this.web3.eth.Contract(
      FactoryABI.abi,
      this.factoryContractAddress,
    );

    const deployTx = factoryContract.methods.deployToken(
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

    const token = await this.tokenRepository.create({
      transactionHash: receipt.transactionHash.toString(),
      type: EventType.DEPLOYTOKEN,
      from: receipt.from,
      to: receipt.to,
    });
    return token.transactionHash;
  }

  async allowanceTokens(dto: {
    tokenAddress: string;
    owner: string;
    spender: string;
  }) {
    const { tokenAddress, owner, spender } = dto;

    const factoryContract = new this.web3.eth.Contract(
      FactoryABI.abi,
      tokenAddress,
    );

    const allowance = await factoryContract.methods
      .allowanceToken(owner, spender)
      .call();

    return allowance;
  }

  async balanceOfTokens(dto: { tokenAddress: string; owner: string }) {
    const { tokenAddress, owner } = dto;

    const factoryContract = new this.web3.eth.Contract(
      FactoryABI.abi,
      tokenAddress,
    );

    const balance = await factoryContract.methods.balanceOfToken(owner).call();

    return balance;
  }

  async mintTokens(dto: { tokenAddress: string; to: string; tokens: number }) {
    const { tokenAddress, to, tokens } = dto;

    const ownerAddress = process.env.OWNER_ADDRESS;

    const factoryContract = new this.web3.eth.Contract(
      FactoryABI.abi,
      tokenAddress,
    );

    const mintTx = factoryContract.methods.mintToken(to, tokens);

    const gasPrice = await this.web3.eth.getGasPrice();

    const nonce = await this.web3.eth.getTransactionCount(ownerAddress);

    const txObject = {
      from: ownerAddress,
      to: tokenAddress,
      data: mintTx.encodeABI(),
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

    const mint = await this.tokenRepository.create({
      transactionHash: receipt.transactionHash.toString(),
      type: EventType.MINT,
      from: receipt.from,
      to: receipt.to,
    });
    return mint.transactionHash;
  }

  async transferTokens(dto: {
    tokenAddress: string;
    to: string;
    tokens: number;
  }) {
    const { tokenAddress, to, tokens } = dto;

    const ownerAddress = process.env.OWNER_ADDRESS;

    const factoryContract = new this.web3.eth.Contract(
      FactoryABI.abi,
      tokenAddress,
    );

    const transferTx = factoryContract.methods.transferToken(to, tokens);

    const gasPrice = await this.web3.eth.getGasPrice();

    const nonce = await this.web3.eth.getTransactionCount(ownerAddress);

    const txObject = {
      from: ownerAddress,
      to: tokenAddress,
      data: transferTx.encodeABI(),
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

    const transfer = await this.tokenRepository.create({
      transactionHash: receipt.transactionHash.toString(),
      type: EventType.TRANSFER,
      from: receipt.from,
      to: receipt.to,
    });
    return transfer.transactionHash;
  }

  async transferFromTokens(dto: {
    tokenAddress: string;
    from: string;
    to: string;
    tokens: number;
  }) {
    const { tokenAddress, from, to, tokens } = dto;

    const ownerAddress = process.env.OWNER_ADDRESS;

    const factoryContract = new this.web3.eth.Contract(
      FactoryABI.abi,
      tokenAddress,
    );

    const transferFromTx = factoryContract.methods.transferTokenFrom(
      from,
      to,
      tokens,
    );

    const gasPrice = await this.web3.eth.getGasPrice();

    const nonce = await this.web3.eth.getTransactionCount(ownerAddress);

    const txObject = {
      from: ownerAddress,
      to: tokenAddress,
      data: transferFromTx.encodeABI(),
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

    const transferFrom = await this.tokenRepository.create({
      transactionHash: receipt.transactionHash.toString(),
      type: EventType.TRANSFERFROM,
      from: receipt.from,
      to: receipt.to,
    });
    return transferFrom.transactionHash;
  }

  async approveTokens(dto: {
    tokenAddress: string;
    spender: string;
    tokens: number;
  }) {
    const { tokenAddress, spender, tokens } = dto;

    const ownerAddress = process.env.OWNER_ADDRESS;

    const factoryContract = new this.web3.eth.Contract(
      FactoryABI.abi,
      tokenAddress,
    );

    const approveTx = factoryContract.methods.approveToken(spender, tokens);

    const gasPrice = await this.web3.eth.getGasPrice();

    const nonce = await this.web3.eth.getTransactionCount(ownerAddress);

    const txObject = {
      from: ownerAddress,
      to: tokenAddress,
      data: approveTx.encodeABI(),
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

    const approve = await this.tokenRepository.create({
      transactionHash: receipt.transactionHash.toString(),
      type: EventType.APPROVAL,
      from: receipt.from,
      to: receipt.to,
    });
    return approve.transactionHash;
  }

  async burnTokens(dto: {
    tokenAddress: string;
    from: string;
    tokens: number;
  }) {
    const { tokenAddress, from, tokens } = dto;

    const ownerAddress = process.env.OWNER_ADDRESS;

    const factoryContract = new this.web3.eth.Contract(
      FactoryABI.abi,
      tokenAddress,
    );

    const burnTx = factoryContract.methods.burn(from, tokens);

    const gasPrice = await this.web3.eth.getGasPrice();

    const nonce = await this.web3.eth.getTransactionCount(ownerAddress);

    const txObject = {
      from: ownerAddress,
      to: tokenAddress,
      data: burnTx.encodeABI(),
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

    const burn = await this.tokenRepository.create({
      transactionHash: receipt.transactionHash.toString(),
      type: EventType.BURN,
      from: receipt.from,
      to: receipt.to,
    });
    return burn.transactionHash;
  }
}
