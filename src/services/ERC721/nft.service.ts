import { Inject, Injectable, Logger } from '@nestjs/common';
import Web3 from 'web3';
import * as NftFactoryAbi from 'src/NftFactory.json';
import * as NftAbi from 'src/Nft.json';
import { NFT_REPOSITORY, NftModel } from '../ERC721/nft.model';
import * as dotenv from 'dotenv';
import { FireblocksSDK } from 'fireblocks-sdk';
import { FireblocksWeb3Provider } from '@fireblocks/fireblocks-web3-provider';
import * as fs from 'fs';

dotenv.config();

@Injectable()
export class NftService {
  private readonly logger = new Logger(NftService.name);
  private web3: Web3;
  private privateKey: string;
  private nftfactoryContractAddress: string;
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

    // Create a new instance of the Fireblocks Web3 provider
    const fireblocksProvider = new FireblocksWeb3Provider({
      privateKey: fireblocksPrivateKey,
      apiKey: fireblocksApiKey,
      chainId: 11155111,
      vaultAccountIds: '2',
      apiBaseUrl: 'https://sandbox-api.fireblocks.io',
      rpcUrl: infuraUrl,
    });

    this.web3 = new Web3(fireblocksProvider);
    this.nftfactoryContractAddress = process.env.NFT_FACTORY_CONTRACT_ADDRESS;

    if (!this.nftfactoryContractAddress) {
      throw new Error(
        'Factory contract address is not defined in the environment variables.',
      );
    }
  }

  async createNftCollection(dto: { name: string; symbol: string }) {
    const { name, symbol } = dto;

    try {
      const vaultAccountId = '2'; // Fireblocks vault account ID
      const assetId = 'ETH_TEST5'; // SEPOLIA
      const depositAddresses = await this.fireblocks.getDepositAddresses(
        vaultAccountId,
        assetId,
      );

      if (!depositAddresses || depositAddresses.length === 0) {
        throw new Error(
          'No deposit addresses found for the specified Fireblocks vault account and asset.',
        );
      }

      const ownerAddress = depositAddresses[0].address;
      this.logger.debug(`Owner Address: ${ownerAddress}`);

      const factoryContract = new this.web3.eth.Contract(
        NftFactoryAbi.abi,
        this.nftfactoryContractAddress,
      );
      const deployTx = factoryContract.methods.deployToken(name, symbol);

      const nonce = await this.web3.eth.getTransactionCount(ownerAddress);
      const gasPrice = await this.web3.eth.getGasPrice();

      if (nonce === undefined || nonce === null) {
        throw new Error('Failed to fetch nonce.');
      }

      if (gasPrice === undefined || gasPrice === null) {
        throw new Error('Failed to fetch gas price.');
      }

      this.logger.debug(`Nonce: ${nonce.toString()}`);
      this.logger.debug(`Gas Price: ${gasPrice.toString()}`);

      const txObject = {
        from: ownerAddress,
        to: this.nftfactoryContractAddress,
        data: deployTx.encodeABI(),
        nonce: nonce.toString(), // Convert BigInt to string
        gasPrice: gasPrice.toString(), // Convert BigInt to string
      };

      const customStringify = (obj: any) => {
        return JSON.stringify(obj, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value,
        );
      };

      this.logger.debug(`Transaction Object: ${customStringify(txObject)}`);

      const receipt = await this.web3.eth.sendTransaction(txObject);
      this.logger.debug(`Transaction receipt: ${customStringify(receipt)}`);

      const tokenAddress = receipt.logs[0].address;
      this.logger.debug(`Token Collection address: ${tokenAddress}`);

      await this.refreshNftOwnershipOnFireblocks();

      const nftCollection = await this.nftRepository.create({
        contractAddress: tokenAddress,
        name: name,
        symbol: symbol,
      });

      return nftCollection.contractAddress;
    } catch (error) {
      this.logger.error(
        'Error creating NFT collection:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async getVaultAccountAddress(
    vaultAccountId: string,
    assetId: string,
  ): Promise<string> {
    const vaultAccount = await this.fireblocks.getVaultAccountById(
      vaultAccountId,
    );
    const address = vaultAccount.assets.find(
      (asset) => asset.id === assetId,
    )?.id;
    if (!address) {
      throw new Error(`Address not found for assetId ${assetId}`);
    }
    return address;
  }

  async refreshNftOwnershipOnFireblocks() {
    try {
      // Get vault accounts
      const vaultAccounts = await this.fireblocks.getVaultAccountsWithPageInfo(
        {},
      );
      const vaultAccountIds = vaultAccounts.accounts.map((va: any) => va.id);

      // Refresh NFT ownership for each vault account
      for (const vaId of vaultAccountIds) {
        await this.fireblocks.refreshNFTOwnershipByVault(vaId, 'ETH_TEST5');
        this.logger.debug(
          `NFT ownership refreshed for vault account ID: ${vaId}`,
        );
      }
    } catch (error) {
      this.logger.error(
        'Error refreshing NFT ownership on Fireblocks:',
        error.stack || error.message,
      );
      throw error;
    }
  }

  async mintNft(dto: { tokenAddress: string; to: string; tokenURI: string }) {
    const { tokenAddress, to, tokenURI } = dto;

    try {
      const vaultAccountId = '2'; // Fireblocks vault account ID
      const assetId = 'ETH_TEST5'; // SEPOLIA
      const depositAddresses = await this.fireblocks.getDepositAddresses(
        vaultAccountId,
        assetId,
      );

      if (!depositAddresses || depositAddresses.length === 0) {
        throw new Error(
          'No deposit addresses found for the specified Fireblocks vault account and asset.',
        );
      }

      const ownerAddress = depositAddresses[0].address;
      this.logger.debug(`Owner Address: ${ownerAddress}`);

      const nftContract = new this.web3.eth.Contract(NftAbi.abi, tokenAddress);
      const mintTx = nftContract.methods.mintNFT(to, tokenURI);

      const nonce = await this.web3.eth.getTransactionCount(ownerAddress);
      const gasPrice = await this.web3.eth.getGasPrice();

      if (nonce === undefined || nonce === null) {
        throw new Error('Failed to fetch nonce.');
      }

      if (gasPrice === undefined || gasPrice === null) {
        throw new Error('Failed to fetch gas price.');
      }

      this.logger.debug(`Nonce: ${nonce.toString()}`);
      this.logger.debug(`Gas Price: ${gasPrice.toString()}`);

      const txObject = {
        from: ownerAddress,
        to: tokenAddress,
        data: mintTx.encodeABI(),
        nonce: nonce.toString(), // Convert BigInt to string
        gasPrice: gasPrice.toString(), // Convert BigInt to string
      };

      const customStringify = (obj: any) => {
        return JSON.stringify(obj, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value,
        );
      };

      this.logger.debug(`Transaction Object: ${customStringify(txObject)}`);

      const receipt = await this.web3.eth.sendTransaction(txObject);
      this.logger.debug(`Transaction receipt: ${customStringify(receipt)}`);

      await this.refreshNftOwnershipOnFireblocks();

      this.logger.debug('mintNft function completed successfully.');
      return customStringify(receipt);
    } catch (error) {
      this.logger.error('Error retrieving vault account assets:', error);
      throw error;
    }
  }

  async getBalance() {
    try {
      const vaultAccountId = '2'; // Your Fireblocks vault account ID

      const vaultAccount = await this.fireblocks.getVaultAccountById(
        vaultAccountId,
      );

      if (!vaultAccount) {
        throw new Error(`Vault account with ID ${vaultAccountId} not found.`);
      }

      // Fetch owned collections (NFTs) from Fireblocks SDK
      const ownedCollectionsResponse =
        await this.fireblocks.listOwnedCollections();

      // Fetch owned assets (tokens) from Fireblocks SDK
      const ownedAssetsResponse = await this.fireblocks.listOwnedAssets();

      // Accessing data from responses
      console.log('Owned Collections (NFTs):', ownedCollectionsResponse.data);
      console.log('Owned Assets (Tokens):', ownedAssetsResponse.data);

      // Construct and return the balance object
      return {
        ownedCollections: ownedCollectionsResponse.data,
        ownedAssets: ownedAssetsResponse.data,
      };
    } catch (error) {
      this.logger.error('Error retrieving vault account assets:', error);
      throw error;
    }
  }
}
