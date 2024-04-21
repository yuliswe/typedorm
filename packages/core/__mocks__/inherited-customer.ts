import { Attribute, Entity } from '@typedorm/common';
import { table } from 'packages/core/__mocks__/table';

abstract class BaseUser {
  @Attribute()
  id: string;

  @Attribute()
  name: string;
}

abstract class UserWithAccount extends BaseUser {
  @Attribute()
  username: string;

  @Attribute()
  password: string;
}

@Entity({
  table,
  name: 'customer',
  primaryKey: {
    partitionKey: 'CUS#{{id}}',
    sortKey: 'CUS#{{email}}',
  },
})
export class Customer extends UserWithAccount {
  @Attribute()
  email: string;

  @Attribute()
  loyaltyPoints: number;
}
