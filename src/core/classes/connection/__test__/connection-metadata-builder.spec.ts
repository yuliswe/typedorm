import path from 'path';
import {
  Attribute,
  DuplicateEntityPhysicalNameError,
  Entity,
} from 'src/common';
import { Organisation } from 'src/core/__mocks__/organisation';
import { table } from 'src/core/__mocks__/table';
import { User } from 'src/core/__mocks__/user';
import { UserUniqueEmail } from 'src/core/__mocks__/user-unique-email';
import { ConnectionMetadataBuilder } from 'src/core/classes/connection/connection-metadata-builder';
import { createTestConnection, resetTestConnection } from 'src/testing';

let metadataBuilder: ConnectionMetadataBuilder;
beforeEach(() => {
  const connection = createTestConnection({
    entities: [],
  });
  metadataBuilder = new ConnectionMetadataBuilder(connection);
});

afterEach(() => {
  resetTestConnection();
});

/**
 * @group buildEntityMetadatas
 */
test('builds entity metadata from list of entities', () => {
  const entities = metadataBuilder.buildEntityMetadatas([
    User,
    Organisation,
    UserUniqueEmail,
  ]);

  expect(entities.length).toEqual(3);
});

test('builds entity metadata with path match', () => {
  const entities = metadataBuilder.buildEntityMetadatas(
    path.resolve(__dirname, '../../../__mocks__/**/*.ts')
  );
  expect(entities.length).toEqual(10);
});

test('throws when trying to register duplicated entities', () => {
  @Entity({
    table,
    name: 'user',
    primaryKey: {
      partitionKey: '{{id}}',
      sortKey: '{{id}}',
    },
  })
  class DuplicateUser {
    @Attribute()
    id: string;
  }

  const entitiesFactory = () =>
    metadataBuilder.buildEntityMetadatas([DuplicateUser, User]);

  expect(entitiesFactory).toThrow(DuplicateEntityPhysicalNameError);
});
