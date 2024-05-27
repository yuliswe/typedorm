import { INDEX_TYPE, Table } from 'src/common';

export const testTable = new Table({
  name: 'product',
  partitionKey: 'PK',
  sortKey: 'SK',
  indexes: {
    GSI1: {
      type: INDEX_TYPE.GSI,
      partitionKey: 'GSI1PK',
      sortKey: 'GSI1SK',
    },
  },
});
