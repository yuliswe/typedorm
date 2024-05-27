import { Attribute, Entity, INDEX_TYPE } from 'src/common';
import { table } from 'src/core/__mocks__/table';

@Entity({
  table,
  name: 'user-with-default-values',
  primaryKey: {
    partitionKey: 'USER#{{id}}',
    sortKey: 'USER#{{id}}',
  },
  indexes: {
    GSI1: {
      partitionKey: 'USER#STATUS#{{status}}',
      sortKey: 'USER#{{status}}',
      type: INDEX_TYPE.GSI,
    },
  },
})
export class UserWithDefaultValues {
  @Attribute()
  id: string;

  @Attribute({
    default: 'active',
  })
  status: string;
}
