import { ValueProvider } from '@nestjs/common';
import { BaseModel } from 'src/base/base-model';
import { Column, DataType, Table } from 'sequelize-typescript';

@Table({
  tableName: 'tokens',
})
export class TokenModel extends BaseModel {
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

  @Column
  decimals: string;

  @Column({
    field: 'initial_supply',
  })
  initialSupply: string;

  @Column({
    field: 'asset_id',
  })
  assetId: string;
}

export const TOKEN_REPOSITORY = Symbol.for('TOKENS_REPOSITORY');
export const TokensRepository: ValueProvider = {
  provide: TOKEN_REPOSITORY,
  useValue: TokenModel,
};
