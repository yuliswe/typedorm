import { EntityManager } from 'src/core';
import { createTestConnection } from 'src/testing';
import { TestEntity } from './test-entity';

it('validates entity and creates successful connection', async () => {
  const connection = createTestConnection({
    entities: [TestEntity],
    documentClient: {},
  });
  const entityManager = new EntityManager(connection);

  expect(connection.hasMetadata(TestEntity)).toBeTruthy();

  expect(entityManager).toBeInstanceOf(EntityManager);
});
