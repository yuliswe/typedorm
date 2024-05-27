import { Attribute, Entity } from 'src/common';
import { table } from 'src/core/__mocks__/table';

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
