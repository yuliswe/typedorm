import { Attribute } from 'src/common/decorators/attribute.decorator';
import { Entity } from 'src/common/decorators/entity.decorator';
import { MetadataManager } from 'src/common/metadata/metadata-manager';

beforeEach(() => {
  MetadataManager.createMetadataStorage();
});

afterEach(() => {
  MetadataManager.resetMetadata();
});

test('adds raw metadata', () => {
  @Entity({
    name: 'user',
    primaryKey: {
      partitionKey: 'PK',
    },
  })
  class User {
    @Attribute()
    readonly role: string;
  }
  expect(
    MetadataManager.metadataStorage.getRawAttributesForEntity(User)
  ).toEqual([
    {
      name: 'role',
      type: 'String',
    },
  ]);
});

/**
 * Issue #29
 */
test('adds raw metadata for enum property', () => {
  enum ROLE {
    ADMIN = 'admin',
    USER = 'user',
  }
  @Entity({
    name: 'user',
    primaryKey: {
      partitionKey: 'USER#{{role}}',
    },
  })
  class User {
    @Attribute({
      isEnum: true,
    })
    role: ROLE;
  }
  expect(
    MetadataManager.metadataStorage.getRawAttributesForEntity(User)
  ).toEqual([
    {
      name: 'role',
      type: 'String',
    },
  ]);
});
