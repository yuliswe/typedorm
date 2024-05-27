import { Attribute, Entity } from 'src/common';
import { table } from 'src/core/__mocks__/table';

export interface UserPrimaryKey {
  id: string;
}

@Entity({
  table,
  name: 'user-custom-constructor',
  primaryKey: {
    partitionKey: 'USER#{{id}}',
    sortKey: 'USER#{{id}}',
  },
})
export class UserCustomConstructor implements UserPrimaryKey {
  @Attribute()
  id: string;

  @Attribute()
  name: string;

  constructor({ name }: Partial<UserCustomConstructor>) {
    this.name = name!;
  }
}
