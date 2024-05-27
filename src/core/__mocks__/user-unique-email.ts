import { Attribute, Entity, INDEX_TYPE } from 'src/common';
import { table } from 'src/core/__mocks__/table';

export interface UserUniqueEmailPrimaryKey {
  id: string;
}

export interface UserUniqueEmailGSI1 {
  status: string;
  name?: string;
}

@Entity({
  table,
  name: 'user-unique-email',
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
export class UserUniqueEmail
  implements UserUniqueEmailPrimaryKey, UserUniqueEmailGSI1
{
  @Attribute()
  id: string;

  @Attribute()
  name: string;

  @Attribute()
  status: string;

  @Attribute({
    unique: true,
  })
  email: string;
}
