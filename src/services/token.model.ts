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

  @Column
  name: string;

  @Column
  symbol: string;

  @Column
  decimals: number;

  @Column({
    field: 'initial_supply',
  })
  initialSupply: number;

  @Column({
    field: 'total_supply',
  })
  totalSupply: number;

  @Column({
    field: 'owner_address',
  })
  ownerAddress: string;

  @Column({
    field: 'transaction_hash',
  })
  transactionHash: string;
}

export const TOKEN_REPOSITORY = Symbol.for('TOKENS_REPOSITORY');
export const TokensRepository: ValueProvider = {
  provide: TOKEN_REPOSITORY,
  useValue: TokenModel,
};
