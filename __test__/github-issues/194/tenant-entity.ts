import { Attribute, Entity } from 'src/common';
import { testTable } from '../../__mocks__/test-table';

@Entity<Tenant>({
  table: testTable,
  name: 'tenant',
  primaryKey: {
    partitionKey: {
      alias: 'id',
    },
    sortKey: {
      alias: 'active',
    },
  },
})
export class Tenant {
  @Attribute()
  id: number;

  @Attribute()
  tenant: number;

  @Attribute()
  active: boolean;
}
