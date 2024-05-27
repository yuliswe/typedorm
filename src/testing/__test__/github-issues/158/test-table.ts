import { INDEX_TYPE, Table } from 'src/common';

export const testTable = new Table({
  name: 'user-v2',
  partitionKey: 'PK',
  sortKey: 'SK',
  indexes: {
    [process.env.EMAIL_INDEX!]: {
      type: INDEX_TYPE.GSI,
      partitionKey: 'email',
      sortKey: 'sk',
    },
  },
});
