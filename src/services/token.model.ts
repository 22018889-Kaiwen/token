import { ValueProvider } from '@nestjs/common';
import { BaseModel } from 'src/base/base-model';
import { Column, DataType, Table } from 'sequelize-typescript';
import { EventType } from './token.types';

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
    field: 'transaction_hash',
  })
  transactionHash: string;

  @Column
  type: EventType;

  @Column
  from: string;

  @Column
  to: string;

  @Column({
    field: 'contract_address',
  })
  contractAddress: string;
}

export const TOKEN_REPOSITORY = Symbol.for('TOKENS_REPOSITORY');
export const TokensRepository: ValueProvider = {
  provide: TOKEN_REPOSITORY,
  useValue: TokenModel,
};
