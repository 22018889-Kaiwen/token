import { Inject, Injectable } from '@nestjs/common';
import Web3 from 'web3';
import * as NftFactoryAbi from 'src/NftFactory.json';
import { NFT_REPOSITORY, NftModel } from '../ERC721/nft.model';
import * as dotenv from 'dotenv';
import { FireblocksSDK } from 'fireblocks-sdk';
import * as fs from 'fs';

dotenv.config();

@Injectable()
export class NftService {
  private web3: Web3;
  private nftfactoryContractAddress: string;
  private privateKey: string;
  private fireblocks: FireblocksSDK;

  constructor(
    @Inject(NFT_REPOSITORY)
    private nftRepository: typeof NftModel,
  ) {
    const infuraUrl = `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`;
    this.privateKey = process.env.DEV_PRIVATE_KEY;
    if (!this.privateKey.startsWith('0x')) {
      this.privateKey = `0x${this.privateKey}`;
    }

    this.web3 = new Web3(new Web3.providers.HttpProvider(infuraUrl));
    this.nftfactoryContractAddress = process.env.NFT_FACTORY_CONTRACT_ADDRESS;

    if (!this.nftfactoryContractAddress) {
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

  async createNftCollection(dto: { name: string; symbol: string }) {
    const { name, symbol } = dto;

    const account = this.web3.eth.accounts.privateKeyToAccount(this.privateKey);
    const ownerAddress = account.address;

    this.web3.eth.accounts.wallet.add(account);
    this.web3.eth.defaultAccount = ownerAddress;

    const factoryContract = new this.web3.eth.Contract(
      NftFactoryAbi.abi,
      this.nftfactoryContractAddress,
    );

    const deployTx = factoryContract.methods.deployToken(name, symbol);

    const nonce = await this.web3.eth.getTransactionCount(ownerAddress);
    const gasPrice = await this.web3.eth.getGasPrice();

    const txObject = {
      from: ownerAddress,
      to: this.nftfactoryContractAddress,
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
    console.log('Token Collection address:', tokenAddress);

    const nftCollection = await this.nftRepository.create({
      contractAddress: tokenAddress,
      name: name,
      symbol: symbol,
    });

    return nftCollection.contractAddress;
  }
  async mintNft(dto: { tokenAddress: string; to: string; tokenURI: string }) {
    try {
      const { tokenAddress, to, tokenURI } = dto;

      console.log('Starting mintNft function...');
      console.log('Token Address:', tokenAddress);
      console.log('Recipient Address:', to);
      console.log('Token URI:', tokenURI);

      const account = this.web3.eth.accounts.privateKeyToAccount(
        this.privateKey,
      );
      const ownerAddress = account.address;

      console.log('Owner Address:', ownerAddress);

      this.web3.eth.accounts.wallet.add(account);
      this.web3.eth.defaultAccount = ownerAddress;

      const contract = new this.web3.eth.Contract(
        NftFactoryAbi.abi,
        tokenAddress,
      );

      console.log('Initialized contract instance:', contract);

      const deployTx = contract.methods.mintNFT(tokenAddress, to, tokenURI);

      console.log('Created mintNFT transaction:', deployTx);

      const nonce = await this.web3.eth.getTransactionCount(ownerAddress);
      console.log('Nonce:', nonce);

      const gasPrice = await this.web3.eth.getGasPrice();
      console.log('Gas Price:', gasPrice.toString());

      const txObject = {
        from: ownerAddress,
        to: this.nftfactoryContractAddress,
        data: deployTx.encodeABI(),
        nonce,
        gasPrice: gasPrice.toString(),
      };

      console.log('Transaction Object:', txObject);

      const signedTx = await this.web3.eth.accounts.signTransaction(
        txObject,
        this.privateKey,
      );

      console.log('Signed Transaction:', signedTx);

      const receipt = await this.web3.eth.sendSignedTransaction(
        signedTx.rawTransaction,
      );

      console.log('Transaction Receipt:', receipt);

      const nftAddress = receipt.logs[0].address;
      console.log('NFT Address:', nftAddress);

      console.log('mintNft function completed successfully.');
      return nftAddress;
    } catch (error) {
      console.error('Error in mintNft function:', error);
      throw error;
    }
  }
}
