import { Attribute, Entity, INDEX_TYPE } from 'packages/common';
import { table } from 'packages/core/__mocks__/table';

export interface UserPrimaryKey {
  id: string;
}

export interface UserGSI1 {
  status: string;
  name?: string;
}

@Entity({
  table,
  name: 'user',
  primaryKey: {
    partitionKey: 'USER#{{id}}',
    sortKey: 'USER#{{id}}',
  },
  indexes: {
    GSI1: {
      partitionKey: 'USER#STATUS#{{status}}',
      sortKey: 'USER#{{name}}',
      type: INDEX_TYPE.GSI,
      isSparse: false,
    },
  },
})
export class User implements UserPrimaryKey, UserGSI1 {
  @Attribute()
  id: string;

  @Attribute()
  name: string;

  @Attribute()
  status: string;

  @Attribute()
  age: number;

  @Attribute()
  addresses: string[];
}
