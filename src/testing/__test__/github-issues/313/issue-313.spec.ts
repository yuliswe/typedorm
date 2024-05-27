import { EntityManager } from 'src/core';
import { createTestConnection } from 'src/testing';
import { TestEntity } from 'src/testing/__test__/github-issues/313/test-entity';

it('validates entity and creates successful connection', () => {
  const connection = createTestConnection({
    entities: [TestEntity],
    documentClient: {},
  });
  const entityManager = new EntityManager(connection);

  expect(connection.hasMetadata(TestEntity)).toBeTruthy();

  expect(entityManager).toBeInstanceOf(EntityManager);
});
