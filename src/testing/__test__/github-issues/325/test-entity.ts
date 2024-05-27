import { Expose } from 'class-transformer';
import { Attribute, Entity } from 'src/common';
import { testTable } from 'src/testing/__test__/github-issues/325/test-table';

@Entity({
  table: testTable,
  name: 'item',
  primaryKey: {
    partitionKey: 'ITEM#{{id}}',
  },
  schemaVersionAttribute: 'schemaVersion',
})
export class TestEntity {
  @Attribute()
  id: string;

  @Attribute()
  unversionedAttribute: string;

  @Expose({ since: 2, until: 3 })
  @Attribute()
  attributeInVersion2And3: string;

  @Expose({ since: 3 })
  @Attribute()
  attributeSinceVersion3: string;

  @Attribute()
  schemaVersion: number;
}
