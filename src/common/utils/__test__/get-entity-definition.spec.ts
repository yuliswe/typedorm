import { Entity } from 'src/common';
import { Attribute } from 'src/common/decorators/attribute.decorator';
import { getEntityDefinition } from 'src/common/utils/get-entity-definition';

@Entity({
  name: 'user',
  primaryKey: {
    partitionKey: '{{id}}',
  },
})
class User {
  @Attribute()
  id: string;

  @Attribute()
  name: string;
}

test('returns entity definition by name', () => {
  const definition = getEntityDefinition('user');

  expect(definition).toEqual({
    name: 'user',
    primaryKey: {
      partitionKey: '{{id}}',
    },
    target: User,
  });
});

test('returns entity definition by entity data', () => {
  // this is what is stored to dynamodb
  const definition = getEntityDefinition({
    id: '1',
    name: 'test',
    __en: 'user',
  });

  expect(definition).toEqual({
    name: 'user',
    primaryKey: {
      partitionKey: '{{id}}',
    },
    target: User,
  });
});
