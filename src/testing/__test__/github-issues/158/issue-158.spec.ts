// assuming there is a EMAIL_INDEX loaded before anything else
process.env.EMAIL_INDEX = 'email-index-v2';

import { EntityManager } from 'src/core';
import { createTestConnection, resetTestConnection } from 'src/testing';
import EntityData from 'src/testing/__test__/github-issues/158/test-entity';
import { testTable } from 'src/testing/__test__/github-issues/158/test-table';
let entityManager: EntityManager;

const dcMock = {
  query: jest.fn(),
};
beforeEach(() => {
  const connection = createTestConnection({
    entities: [EntityData],
    table: testTable,
    documentClient: dcMock,
  });
  entityManager = new EntityManager(connection);
});

afterEach(() => {
  resetTestConnection();
});

test('entityManager find returns attributes that has the same name as key', async () => {
  dcMock.query.mockReturnValue({
    Items: [
      {
        SK: 'root',
        stringSet: ['test'],
        email: 'test-entity@gmail.com',
        PK: 'entity#12345678',
        name: 'ABCD',
      },
    ],
  });

  const response = await entityManager.find(
    EntityData,
    'test-entity@gmail.com',
    {
      queryIndex: process.env.EMAIL_INDEX!,
      limit: 1,
    }
  );

  expect(response.items[0]).toBeInstanceOf(EntityData);
  expect(response).toEqual({
    items: [
      {
        name: 'ABCD',
        stringSet: ['test'],
        email: 'test-entity@gmail.com',
      },
    ],
  });
});
