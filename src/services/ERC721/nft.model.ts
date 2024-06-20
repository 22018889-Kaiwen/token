import { ValueProvider } from '@nestjs/common';
import { BaseModel } from 'src/base/base-model';
import { Column, DataType, Table } from 'sequelize-typescript';

@Table({
  tableName: 'nfts',
})
export class NftModel extends BaseModel {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({
    field: 'contract_address',
  })
  contractAddress: string;

  @Column
  name: string;

  @Column
  symbol: string;
}

export const NFT_REPOSITORY = Symbol.for('NFTS_REPOSITORY');
export const NftsRepository: ValueProvider = {
  provide: NFT_REPOSITORY,
  useValue: NftModel,
};
