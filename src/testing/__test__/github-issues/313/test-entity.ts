import { Attribute, Entity, INDEX_TYPE } from 'src/common';
import { testTable } from 'src/testing/__test__/__mocks__/test-table';

@Entity<TestEntity>({
  name: 'test-entity',
  table: testTable,
  primaryKey: {
    partitionKey: {
      alias: 'id',
    },
    sortKey: {
      alias: 'someOtherField',
    },
  },
  indexes: {
    GSI1: {
      type: INDEX_TYPE.GSI,
      partitionKey: {
        alias: 'mySecondaryId',
      },
      sortKey: {
        alias: 'id',
      },
    },
  },
})
export class TestEntity {
  @Attribute()
  id: string;

  @Attribute()
  someOtherField: string;

  @Attribute()
  mySecondaryId: string | undefined;
}
