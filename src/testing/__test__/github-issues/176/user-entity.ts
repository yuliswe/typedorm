import {
  AUTO_GENERATE_ATTRIBUTE_STRATEGY,
  Attribute,
  AutoGenerateAttribute,
  Entity,
} from 'src/common';
import { testTable } from 'src/testing/__test__/__mocks__/test-table';

@Entity({
  name: 'User',
  table: testTable,
  primaryKey: {
    partitionKey: 'ID#{{id}}',
    sortKey: 'ID#{{id}}',
  },
})
export class User {
  @AutoGenerateAttribute({
    strategy: AUTO_GENERATE_ATTRIBUTE_STRATEGY.UUID4,
  })
  id!: string;

  @Attribute()
  name!: string;
}
