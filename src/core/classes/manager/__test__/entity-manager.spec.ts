import { ReturnConsumedCapacity } from '@aws-sdk/client-dynamodb';
import {
  EntityInstance,
  InvalidDynamicUpdateAttributeValueError,
} from 'src/common';
import { User, UserPrimaryKey } from 'src/core/__mocks__/user';
import {
  UserAutoGenerateAttributes,
  UserAutoGenerateAttributesPrimaryKey,
} from 'src/core/__mocks__/user-auto-generate-attributes';
import {
  UserUniqueEmail,
  UserUniqueEmailPrimaryKey,
} from 'src/core/__mocks__/user-unique-email';
import {
  UserAttrAlias,
  UserAttrAliasPrimaryKey,
} from 'src/core/__mocks__/user-with-attribute-alias';
import { Connection } from 'src/core/classes/connection/connection';
import { EntityManager } from 'src/core/classes/manager/entity-manager';
import { createTestConnection, resetTestConnection } from 'src/testing';

let manager: EntityManager;
let connection: Connection;
const dcMock = {
  put: jest.fn(),
  get: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  query: jest.fn(),
  transactWrite: jest.fn(),
};
beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date(1606896235000));
  connection = createTestConnection({
    entities: [
      User,
      UserUniqueEmail,
      UserAutoGenerateAttributes,
      UserAttrAlias,
    ],
    documentClient: dcMock,
  });

  manager = new EntityManager(connection);
});

afterEach(() => {
  resetTestConnection();
});

/**
 * @group create
 */
test('creates entity', async () => {
  dcMock.put.mockReturnValue({});

  const user = new User();
  user.id = '1';
  user.name = 'Test User';
  user.status = 'active';

  const userEntity = await manager.create(user, undefined, {
    returnConsumedCapacity: ReturnConsumedCapacity.TOTAL,
  });
  expect(dcMock.put).toHaveBeenCalledTimes(1);
  expect(dcMock.put).toHaveBeenCalledWith({
    Item: {
      GSI1PK: 'USER#STATUS#active',
      GSI1SK: 'USER#Test User',
      PK: 'USER#1',
      SK: 'USER#1',
      id: '1',
      __en: 'user',
      name: 'Test User',
      status: 'active',
    },
    TableName: 'test-table',
    ReturnConsumedCapacity: 'TOTAL',
    ConditionExpression:
      '(attribute_not_exists(#CE_PK)) AND (attribute_not_exists(#CE_SK))',
    ExpressionAttributeNames: {
      '#CE_PK': 'PK',
      '#CE_SK': 'SK',
    },
  });
  expect(userEntity).toEqual({
    id: '1',
    name: 'Test User',
    status: 'active',
  });
});

test('creates entity with possible overwrite', async () => {
  dcMock.put.mockReturnValue({});

  const user = new User();
  user.id = '1';
  user.name = 'Test User';
  user.status = 'active';

  const userEntity = await manager.create(user, {
    overwriteIfExists: true,
  });
  expect(dcMock.put).toHaveBeenCalledTimes(1);
  expect(dcMock.put).toHaveBeenCalledWith({
    Item: {
      GSI1PK: 'USER#STATUS#active',
      GSI1SK: 'USER#Test User',
      PK: 'USER#1',
      SK: 'USER#1',
      id: '1',
      __en: 'user',
      name: 'Test User',
      status: 'active',
    },
    TableName: 'test-table',
  });
  expect(userEntity).toEqual({
    id: '1',
    name: 'Test User',
    status: 'active',
  });
});

test('creates entity with possible overwrite and given condition', async () => {
  dcMock.put.mockReturnValue({});

  const user = new User();
  user.id = '1';
  user.name = 'Test User';
  user.status = 'active';

  const userEntity = await manager.create<User>(user, {
    overwriteIfExists: true,
    where: {
      NOT: {
        id: {
          EQ: '1',
        },
      },
    },
  });
  expect(dcMock.put).toHaveBeenCalledTimes(1);
  expect(dcMock.put).toHaveBeenCalledWith({
    Item: {
      GSI1PK: 'USER#STATUS#active',
      GSI1SK: 'USER#Test User',
      PK: 'USER#1',
      SK: 'USER#1',
      id: '1',
      __en: 'user',
      name: 'Test User',
      status: 'active',
    },
    ConditionExpression: 'NOT (#CE_id = :CE_id)',
    ExpressionAttributeNames: {
      '#CE_id': 'id',
    },
    ExpressionAttributeValues: {
      ':CE_id': '1',
    },
    TableName: 'test-table',
  });
  expect(userEntity).toEqual({
    id: '1',
    name: 'Test User',
    status: 'active',
  });
});

/**
 * Issue: #11
 */
test('creates entity and returns all attributes, including auto generated ones', async () => {
  dcMock.put.mockReturnValue({});

  const user = new UserAutoGenerateAttributes();
  user.id = '1';

  const userEntity = await manager.create(user);
  expect(dcMock.put).toHaveBeenCalledTimes(1);
  expect(dcMock.put).toHaveBeenCalledWith({
    Item: {
      GSI1PK: 'USER#UPDATED_AT#1606896235',
      GSI1SK: 'USER#1',
      PK: 'USER#1',
      SK: 'USER#1',
      id: '1',
      __en: 'user-auto-generate-attr',
      updatedAt: 1606896235,
    },
    TableName: 'test-table',
    ConditionExpression:
      '(attribute_not_exists(#CE_PK)) AND (attribute_not_exists(#CE_SK))',
    ExpressionAttributeNames: {
      '#CE_PK': 'PK',
      '#CE_SK': 'SK',
    },
  });
  expect(userEntity).toEqual({
    id: '1',
    updatedAt: 1606896235,
  });
});

/**
 * Issue: #203
 */
test('will throw when called with a POJO rather than an instance of a entity class', async () => {
  dcMock.put.mockReturnValue({});

  const user = new User();
  user.id = '1';
  user.name = 'Test User';
  user.status = 'active';

  await manager.create<User>(user); // works

  const userProperties = {
    id: '2',
    age: 2,
    name: 'two',
    status: 'broken',
    addresses: ['address a'],
  };

  await expect(
    manager.create<User>(userProperties as EntityInstance)
  ).rejects.toBeInstanceOf(Error);
});

/**
 * @group findOne
 */
test('finds one entity by given primary key', async () => {
  dcMock.get.mockReturnValue({
    Item: {
      PK: 'USER#1',
      SK: 'USER#1',
      GSI1PK: 'USER#STATUS#active',
      GSI1SK: 'USER#Me',
      id: '1',
      name: 'Me',
      status: 'active',
    },
  });

  const userEntity = await manager.findOne<User, UserPrimaryKey>(
    User,
    {
      id: '1',
    },
    {
      consistentRead: true,
    }
  );
  expect(dcMock.get).toHaveBeenCalledTimes(1);
  expect(dcMock.get).toHaveBeenCalledWith({
    Key: {
      PK: 'USER#1',
      SK: 'USER#1',
    },
    ConsistentRead: true,
    TableName: 'test-table',
  });
  expect(userEntity).toEqual({
    id: '1',
    name: 'Me',
    status: 'active',
  });
  expect(userEntity).toBeInstanceOf(User);
});

// issue: 110
test('returns undefined when no item was found with given primary key', async () => {
  dcMock.get.mockReturnValue({});

  const userEntity = await manager.findOne<User, UserPrimaryKey>(User, {
    id: '1',
  });

  expect(dcMock.get).toHaveBeenCalledTimes(1);
  expect(dcMock.get).toHaveBeenCalledWith({
    Key: {
      PK: 'USER#1',
      SK: 'USER#1',
    },
    TableName: 'test-table',
  });
  expect(userEntity).toBeUndefined();
});

test('throws an error when trying to do a get request with non primary key attributes', async () => {
  await expect(
    manager.findOne(User, {
      name: 'User',
    })
  ).rejects.toThrow(
    '"id" was referenced in USER#{{id}} but it\'s value could not be resolved.'
  );
});

/**
 * @group exists
 */
test('checks if given item exists', async () => {
  dcMock.get.mockReturnValue({
    Item: {
      PK: 'USER#1',
      SK: 'USER#1',
      GSI1PK: 'USER#STATUS#active',
      GSI1SK: 'USER#Me',
      id: '1',
      name: 'Me',
      status: 'active',
    },
  });

  const userEntity = await manager.exists<User, UserUniqueEmailPrimaryKey>(
    User,
    {
      id: '1',
    },
    {
      consistentRead: true,
      returnConsumedCapacity: ReturnConsumedCapacity.INDEXES,
    }
  );

  expect(dcMock.get).toHaveBeenCalledWith({
    Key: {
      PK: 'USER#1',
      SK: 'USER#1',
    },
    TableName: 'test-table',
    ConsistentRead: true,
    ReturnConsumedCapacity: 'INDEXES',
  });
  expect(userEntity).toEqual(true);
});

// issue: 110
test('returns correct value when trying check existence of item that does not exist', async () => {
  dcMock.get.mockReturnValue({});

  const userEntity = await manager.exists<User, UserUniqueEmailPrimaryKey>(
    User,
    {
      id: '1',
    }
  );

  expect(dcMock.get).toHaveBeenCalledWith({
    Key: {
      PK: 'USER#1',
      SK: 'USER#1',
    },
    TableName: 'test-table',
  });
  expect(userEntity).toEqual(false);
});

test('checks if item with given unique attribute exists', async () => {
  dcMock.get.mockReturnValue({
    Item: {
      PK: 'DRM_GEN_USERUNIQUEEMAIL.EMAIL#user@example.com',
      SK: 'DRM_GEN_USERUNIQUEEMAIL.EMAIL#user@example.com',
    },
  });

  const userEntity = await manager.exists<UserUniqueEmail>(UserUniqueEmail, {
    email: 'user@example.com',
  });

  expect(dcMock.get).toHaveBeenCalledWith({
    Key: {
      PK: 'DRM_GEN_USERUNIQUEEMAIL.EMAIL#user@example.com',
      SK: 'DRM_GEN_USERUNIQUEEMAIL.EMAIL#user@example.com',
    },
    TableName: 'test-table',
  });
  expect(userEntity).toEqual(true);
});

test('throws an error if trying to perform exists check with non key or non unique attributes', async () => {
  expect(dcMock.get).not.toHaveBeenCalled();
  await expect(
    async () =>
      await manager.exists<UserUniqueEmail>(UserUniqueEmail, {
        status: 'active',
      })
  ).rejects.toThrow(
    'Only attributes that are part of primary key or is marked as unique attribute can be queried, attribute "status is neither."'
  );
});

test('throws an error if trying to perform exists check with partial primary key', async () => {
  await expect(
    manager.findOne(User, {
      name: 'User',
    })
  ).rejects.toThrow(
    '"id" was referenced in USER#{{id}} but it\'s value could not be resolved.'
  );
});

/**
 * @group update
 */
test('updates item and return all new attributes', async () => {
  dcMock.update.mockReturnValue({
    Attributes: {
      PK: 'USER#1',
      SK: 'USER#1',
      GSI1PK: 'USER#STATUS#active',
      GSI1SK: 'USER#Me',
      id: '1',
      name: 'user',
      status: 'active',
    },
  });
  const updatedItem = await manager.update<User, UserPrimaryKey>(
    User,
    { id: '1' },
    {
      name: 'user',
      status: 'active',
    }
  );

  expect(dcMock.update).toHaveBeenCalledWith({
    ExpressionAttributeNames: {
      '#UE_GSI1PK': 'GSI1PK',
      '#UE_GSI1SK': 'GSI1SK',
      '#UE_name': 'name',
      '#UE_status': 'status',
    },
    ExpressionAttributeValues: {
      ':UE_GSI1PK': 'USER#STATUS#active',
      ':UE_GSI1SK': 'USER#user',
      ':UE_name': 'user',
      ':UE_status': 'active',
    },
    Key: {
      PK: 'USER#1',
      SK: 'USER#1',
    },
    ReturnValues: 'ALL_NEW',
    TableName: 'test-table',
    UpdateExpression:
      'SET #UE_name = :UE_name, #UE_status = :UE_status, #UE_GSI1SK = :UE_GSI1SK, #UE_GSI1PK = :UE_GSI1PK',
  });
  expect(updatedItem).toEqual({ id: '1', name: 'user', status: 'active' });
});

test('updates item with multiple body actions', async () => {
  dcMock.update.mockReturnValue({
    Attributes: {
      PK: 'USER#1',
      SK: 'USER#1',
      GSI1PK: 'USER#STATUS#active',
      GSI1SK: 'USER#Me',
      id: '1',
      name: 'user',
      status: 'active',
    },
  });
  const updatedItem = await manager.update<User, UserPrimaryKey>(
    User,
    { id: '1' },
    {
      name: 'user',
      status: {
        IF_NOT_EXISTS: {
          $PATH: 'id',
          $VALUE: 'active',
        },
      },
    }
  );

  expect(dcMock.update).toHaveBeenCalledWith({
    ExpressionAttributeNames: {
      '#UE_GSI1SK': 'GSI1SK',
      '#UE_GSI1PK': 'GSI1PK',
      '#UE_id': 'id',
      '#UE_name': 'name',
      '#UE_status': 'status',
    },
    ExpressionAttributeValues: {
      ':UE_GSI1SK': 'USER#user',
      ':UE_GSI1PK': 'USER#STATUS#active',
      ':UE_name': 'user',
      ':UE_status': 'active',
    },
    Key: {
      PK: 'USER#1',
      SK: 'USER#1',
    },
    ReturnValues: 'ALL_NEW',
    TableName: 'test-table',
    UpdateExpression:
      'SET #UE_name = :UE_name, #UE_status = if_not_exists(#UE_id, :UE_status), #UE_GSI1SK = :UE_GSI1SK, #UE_GSI1PK = :UE_GSI1PK',
  });
  expect(updatedItem).toEqual({ id: '1', name: 'user', status: 'active' });
});

test('updates item when trying to update attribute with dynamic value that is not referenced in any index', async () => {
  dcMock.update.mockReturnValue({});

  await manager.update<User, UserPrimaryKey>(
    User,
    { id: '1' },
    {
      age: {
        INCREMENT_BY: 3,
      },
    }
  );

  expect(dcMock.update).toHaveBeenCalledWith({
    ExpressionAttributeNames: {
      '#UE_age': 'age',
    },
    ExpressionAttributeValues: {
      ':UE_age': 3,
    },
    Key: {
      PK: 'USER#1',
      SK: 'USER#1',
    },
    ReturnValues: 'ALL_NEW',
    TableName: 'test-table',
    UpdateExpression: 'SET #UE_age = #UE_age + :UE_age',
  });
});
test('fails to transform when trying to use dynamic update expression for attribute that is also referenced in a index', async () => {
  // this should fail as update to age is not static and is also referenced by GSI1
  const updatedItem = async () =>
    manager.update<UserAttrAlias, UserAttrAliasPrimaryKey>(
      UserAttrAlias,
      { id: '1' },
      {
        age: {
          INCREMENT_BY: 3,
        },
      }
    );
  await expect(updatedItem).rejects.toThrow(
    InvalidDynamicUpdateAttributeValueError
  );
  expect(dcMock.update).not.toHaveBeenCalled();
});

test('updates item and attributes marked to be autoUpdated', async () => {
  jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));

  dcMock.update.mockReturnValue({
    Attributes: {
      PK: 'USER#1',
      SK: 'USER#1',
      GSI1PK: 'USER#STATUS#active',
      GSI1SK: 'USER#Me',
      id: '1',
      name: 'Me',
      status: 'active',
    },
  });

  const updatedItem = await manager.update<
    UserAutoGenerateAttributes,
    UserAutoGenerateAttributesPrimaryKey
  >(
    UserAutoGenerateAttributes,
    { id: '1' },
    {},
    {
      nestedKeySeparator: '.',
    }
  );

  expect(dcMock.update).toHaveBeenCalledWith({
    ExpressionAttributeNames: {
      '#UE_updatedAt': 'updatedAt',
      '#UE_GSI1PK': 'GSI1PK',
    },
    ExpressionAttributeValues: {
      ':UE_updatedAt': 1577836800,
      ':UE_GSI1PK': 'USER#UPDATED_AT#1577836800',
    },
    Key: {
      PK: 'USER#1',
      SK: 'USER#1',
    },
    ReturnValues: 'ALL_NEW',
    TableName: 'test-table',
    UpdateExpression:
      'SET #UE_updatedAt = :UE_updatedAt, #UE_GSI1PK = :UE_GSI1PK',
  });
  expect(updatedItem).toEqual({ id: '1', name: 'Me', status: 'active' });
});

test('updates item with unique attributes and returns all updated attributes', async () => {
  manager.findOne = jest
    .fn()
    // mock first call to return existing item, this will be called before update is performed
    .mockImplementationOnce(() => ({
      id: '1',
      email: 'old@email.com',
      status: 'active',
    }))
    // mock send call to return new updated item, this will be called after update is performed
    .mockImplementationOnce(() => ({
      id: '1',
      email: 'new@email.com',
      status: 'active',
    }));

  const updateOperationSpy = dcMock.transactWrite.mockReturnValue({
    on: jest.fn(),
    send: jest.fn().mockImplementation(cb => {
      cb(null, {
        ConsumedCapacity: [
          {
            TableName: 'my-table',
            CapacityUnits: 123.3,
          },
        ],
        ItemCollectionMetrics: [{}],
      });
    }),
  });

  const updatedItem = await manager.update<
    UserUniqueEmail,
    UserUniqueEmailPrimaryKey
  >(
    UserUniqueEmail,
    {
      id: '1',
    },
    {
      email: 'new@examil.com',
    },
    {},
    {
      requestId: 'MY_CUSTOM_UNIQUE_REQUEST_ID',
    }
  );

  expect(updateOperationSpy).toHaveBeenCalledTimes(1);
  expect(updateOperationSpy).toHaveBeenCalledWith({
    TransactItems: [
      {
        Update: {
          ExpressionAttributeNames: {
            '#UE_email': 'email',
          },
          ExpressionAttributeValues: {
            ':UE_email': 'new@examil.com',
          },
          Key: {
            PK: 'USER#1',
            SK: 'USER#1',
          },
          TableName: 'test-table',
          UpdateExpression: 'SET #UE_email = :UE_email',
        },
      },
      {
        Put: {
          ConditionExpression:
            '(attribute_not_exists(#CE_PK)) AND (attribute_not_exists(#CE_SK))',
          ExpressionAttributeNames: {
            '#CE_PK': 'PK',
            '#CE_SK': 'SK',
          },
          Item: {
            PK: 'DRM_GEN_USERUNIQUEEMAIL.EMAIL#new@examil.com',
            SK: 'DRM_GEN_USERUNIQUEEMAIL.EMAIL#new@examil.com',
          },
          TableName: 'test-table',
        },
      },
      {
        Delete: {
          Key: {
            PK: 'DRM_GEN_USERUNIQUEEMAIL.EMAIL#old@email.com',
            SK: 'DRM_GEN_USERUNIQUEEMAIL.EMAIL#old@email.com',
          },
          TableName: 'test-table',
        },
      },
    ],
  });
  expect(updatedItem).toEqual({
    id: '1',
    email: 'new@email.com',
    status: 'active',
  });
});

test('updates item and return all new attributes with given condition', async () => {
  dcMock.update.mockReturnValue({
    Attributes: {
      PK: 'USER#1',
      SK: 'USER#1',
      GSI1PK: 'USER#STATUS#active',
      GSI1SK: 'USER#Me',
      id: '1',
      name: 'user',
      status: 'active',
      age: 4,
    },
  });
  const updatedItem = await manager.update<User, UserPrimaryKey>(
    User,
    { id: '1' },
    {
      name: 'user',
      status: 'active',
    },
    {
      where: {
        age: {
          BETWEEN: [1, 11],
        },
      },
    }
  );

  expect(dcMock.update).toHaveBeenCalledWith({
    ExpressionAttributeNames: {
      '#UE_GSI1PK': 'GSI1PK',
      '#UE_GSI1SK': 'GSI1SK',
      '#UE_name': 'name',
      '#UE_status': 'status',
      '#CE_age': 'age',
    },
    ExpressionAttributeValues: {
      ':UE_GSI1PK': 'USER#STATUS#active',
      ':UE_GSI1SK': 'USER#user',
      ':UE_name': 'user',
      ':UE_status': 'active',
      ':CE_age_end': 11,
      ':CE_age_start': 1,
    },
    Key: {
      PK: 'USER#1',
      SK: 'USER#1',
    },
    ReturnValues: 'ALL_NEW',
    TableName: 'test-table',
    UpdateExpression:
      'SET #UE_name = :UE_name, #UE_status = :UE_status, #UE_GSI1SK = :UE_GSI1SK, #UE_GSI1PK = :UE_GSI1PK',
    ConditionExpression: '#CE_age BETWEEN :CE_age_start AND :CE_age_end',
  });
  expect(updatedItem).toEqual({
    id: '1',
    name: 'user',
    status: 'active',
    age: 4,
  });
});

test('updates item and create new unique item when no previous record was found', async () => {
  manager.findOne = jest
    .fn()
    .mockImplementationOnce(() => null)
    .mockImplementationOnce(() => ({
      id: '1',
      name: 'user',
      status: 'active',
      age: 4,
    }));

  dcMock.transactWrite.mockReturnValue({
    on: jest.fn(),
    send: jest.fn().mockImplementation(cb => {
      cb(null, {
        ConsumedCapacity: [{}],
        ItemCollectionMetrics: [{}],
      });
    }),
  });

  const updatedItem = await manager.update<
    UserUniqueEmail,
    UserUniqueEmailPrimaryKey
  >(
    UserUniqueEmail,
    {
      id: '1',
    },
    {
      email: 'new@examil.com',
    }
  );

  expect(manager.findOne).toHaveBeenCalledTimes(2);
  expect(dcMock.transactWrite).toHaveBeenCalledWith({
    TransactItems: [
      {
        Update: {
          ExpressionAttributeNames: {
            '#UE_email': 'email',
          },
          ExpressionAttributeValues: {
            ':UE_email': 'new@examil.com',
          },
          Key: {
            PK: 'USER#1',
            SK: 'USER#1',
          },
          TableName: 'test-table',
          UpdateExpression: 'SET #UE_email = :UE_email',
        },
      },
      {
        Put: {
          ConditionExpression:
            '(attribute_not_exists(#CE_PK)) AND (attribute_not_exists(#CE_SK))',
          ExpressionAttributeNames: {
            '#CE_PK': 'PK',
            '#CE_SK': 'SK',
          },
          Item: {
            PK: 'DRM_GEN_USERUNIQUEEMAIL.EMAIL#new@examil.com',
            SK: 'DRM_GEN_USERUNIQUEEMAIL.EMAIL#new@examil.com',
          },
          TableName: 'test-table',
        },
      },
    ],
  });

  expect(updatedItem).toEqual({
    age: 4,
    id: '1',
    name: 'user',
    status: 'active',
  });
});

/**
 * @group delete
 */
test('deletes item by primary key', async () => {
  dcMock.delete.mockReturnValue({
    Attributes: {},
  });

  const result = await manager.delete<User, UserPrimaryKey>(User, {
    id: '1',
  });

  expect(dcMock.delete).toHaveBeenCalledWith({
    Key: {
      PK: 'USER#1',
      SK: 'USER#1',
    },
    TableName: 'test-table',
  });
  expect(result).toEqual({
    success: true,
  });
});

test('deletes item by primary key and given condition', async () => {
  dcMock.delete.mockReturnValue({
    Attributes: {},
  });

  const result = await manager.delete<User, UserPrimaryKey>(
    User,
    {
      id: '1',
    },
    {
      where: {
        status: {
          NE: 'active',
        },
      },
    }
  );

  expect(dcMock.delete).toHaveBeenCalledWith({
    Key: {
      PK: 'USER#1',
      SK: 'USER#1',
    },
    TableName: 'test-table',
    ConditionExpression: '#CE_status <> :CE_status',
    ExpressionAttributeNames: {
      '#CE_status': 'status',
    },
    ExpressionAttributeValues: {
      ':CE_status': 'active',
    },
  });
  expect(result).toEqual({
    success: true,
  });
});

test('throws an error when trying to delete item by non primary key attributes', async () => {
  await expect(
    manager.delete(User, {
      name: 'User',
    })
  ).rejects.toThrow(
    '"id" was referenced in USER#{{id}} but it\'s value could not be resolved.'
  );
});

test('deletes an item with unique attributes', async () => {
  manager.findOne = jest.fn().mockReturnValue({
    id: '1',
    email: 'old@email.com',
    status: 'active',
  });

  const deleteItemOperation = dcMock.transactWrite.mockReturnValue({
    on: jest.fn(),
    send: jest.fn().mockImplementation(cb => {
      cb(null, {
        ConsumedCapacity: [{}],
        ItemCollectionMetrics: [{}],
      });
    }),
  });

  const deletedResponse = await manager.delete<
    UserUniqueEmail,
    UserUniqueEmailPrimaryKey
  >(UserUniqueEmail, {
    id: '1',
  });

  expect(deleteItemOperation).toHaveBeenCalledTimes(1);
  expect(deleteItemOperation).toHaveBeenCalledWith({
    TransactItems: [
      {
        Delete: {
          Key: {
            PK: 'USER#1',
            SK: 'USER#1',
          },
          TableName: 'test-table',
        },
      },
      {
        Delete: {
          Key: {
            PK: 'DRM_GEN_USERUNIQUEEMAIL.EMAIL#old@email.com',
            SK: 'DRM_GEN_USERUNIQUEEMAIL.EMAIL#old@email.com',
          },
          TableName: 'test-table',
        },
      },
    ],
  });
  expect(deletedResponse).toEqual({
    success: true,
  });
});

test('deletes an item with unique attributes when no existing item is found', async () => {
  // make find one return undefined
  manager.findOne = jest.fn();

  const deleteItemOperation = dcMock.transactWrite.mockReturnValue({
    on: jest.fn(),
    send: jest.fn().mockImplementation(cb => {
      cb(null, {
        ConsumedCapacity: [{}],
        ItemCollectionMetrics: [{}],
      });
    }),
  });

  const deletedResponse = await manager.delete<
    UserUniqueEmail,
    UserUniqueEmailPrimaryKey
  >(UserUniqueEmail, {
    id: '1',
  });

  expect(manager.findOne).toHaveBeenCalledTimes(1);
  expect(deleteItemOperation).toHaveBeenCalledTimes(1);
  expect(deleteItemOperation).toHaveBeenCalledWith({
    TransactItems: [
      {
        Delete: {
          Key: {
            PK: 'USER#1',
            SK: 'USER#1',
          },
          TableName: 'test-table',
        },
      },
    ],
  });
  expect(deletedResponse).toEqual({
    success: true,
  });
});

/**
 * @group find
 */
test('finds items matching given query params', async () => {
  dcMock.query.mockReturnValue({
    Items: [
      {
        PK: 'USER#1',
        SK: 'USER#1',
        GSI1PK: 'USER#STATUS#active',
        GSI1SK: 'USER#Me',
        id: '1',
        name: 'Me',
        status: 'active',
      },
      {
        PK: 'USER#2',
        SK: 'USER#2',
        GSI1PK: 'USER#STATUS#active',
        GSI1SK: 'USER#Me2',
        id: '2',
        name: 'Me',
        status: 'active',
      },
    ],
  });

  const users = await manager.find<User, UserPrimaryKey>(
    User,
    {
      id: 'aaaa',
    },
    {
      keyCondition: {
        BEGINS_WITH: 'USER#',
      },
      limit: 10,
    }
  );

  expect(dcMock.query).toHaveBeenCalledTimes(1);
  expect(dcMock.query).toHaveBeenCalledWith({
    ExpressionAttributeNames: {
      '#KY_CE_PK': 'PK',
      '#KY_CE_SK': 'SK',
    },
    ExpressionAttributeValues: {
      ':KY_CE_PK': 'USER#aaaa',
      ':KY_CE_SK': 'USER#',
    },
    KeyConditionExpression:
      '(#KY_CE_PK = :KY_CE_PK) AND (begins_with(#KY_CE_SK, :KY_CE_SK))',
    Limit: 10,
    TableName: 'test-table',
  });
  expect(users).toEqual({
    items: [
      {
        id: '1',
        name: 'Me',
        status: 'active',
      },
      {
        id: '2',
        name: 'Me',
        status: 'active',
      },
    ],
  });

  users.items.forEach(user => {
    expect(user).toBeInstanceOf(User);
  });
});

test('finds items matching given query params and options', async () => {
  dcMock.query.mockReturnValue({
    Items: [
      {
        PK: 'USER#1',
        SK: 'USER#1',
        GSI1PK: 'USER#STATUS#active',
        GSI1SK: 'USER#Me',
        id: '1',
        name: 'Me',
        status: 'active',
        age: 4,
      },
    ],
  });

  const users = await manager.find<User, UserPrimaryKey>(
    User,
    {
      id: 'aaaa',
    },
    {
      keyCondition: {
        BEGINS_WITH: 'USER#',
      },
      consistentRead: true,
      where: {
        AND: {
          age: {
            BETWEEN: [1, 5],
          },
          name: {
            EQ: 'Me',
          },
          status: 'ATTRIBUTE_EXISTS',
        },
      },
      limit: 10,
    }
  );

  expect(dcMock.query).toHaveBeenCalledTimes(1);
  expect(dcMock.query).toHaveBeenCalledWith({
    ExpressionAttributeNames: {
      '#KY_CE_PK': 'PK',
      '#KY_CE_SK': 'SK',
      '#FE_age': 'age',
      '#FE_name': 'name',
      '#FE_status': 'status',
    },
    ExpressionAttributeValues: {
      ':KY_CE_PK': 'USER#aaaa',
      ':KY_CE_SK': 'USER#',
      ':FE_age_end': 5,
      ':FE_age_start': 1,
      ':FE_name': 'Me',
    },
    ConsistentRead: true,
    KeyConditionExpression:
      '(#KY_CE_PK = :KY_CE_PK) AND (begins_with(#KY_CE_SK, :KY_CE_SK))',
    FilterExpression:
      '(#FE_age BETWEEN :FE_age_start AND :FE_age_end) AND (#FE_name = :FE_name) AND (attribute_exists(#FE_status))',
    Limit: 10,
    TableName: 'test-table',
  });
  expect(users).toEqual({
    items: [
      {
        id: '1',
        name: 'Me',
        status: 'active',
        age: 4,
      },
    ],
  });
  expect(users.items[0]).toBeInstanceOf(User);
});

test('finds items with alternate syntax', async () => {
  dcMock.query.mockReturnValue({
    Items: [
      {
        PK: 'USER#1',
        SK: 'USER#1',
        GSI1PK: 'USER#STATUS#active',
        GSI1SK: 'USER#Me',
        id: '1',
        name: 'Me',
        status: 'active',
      },
    ],
  });

  const users = await manager.find<User>(User, 'USER#1', {
    keyCondition: {
      BEGINS_WITH: 'USER#',
    },
    limit: 10,
  });

  expect(dcMock.query).toHaveBeenCalledTimes(1);
  expect(dcMock.query).toHaveBeenCalledWith({
    ExpressionAttributeNames: {
      '#KY_CE_PK': 'PK',
      '#KY_CE_SK': 'SK',
    },
    ExpressionAttributeValues: {
      ':KY_CE_PK': 'USER#1',
      ':KY_CE_SK': 'USER#',
    },
    KeyConditionExpression:
      '(#KY_CE_PK = :KY_CE_PK) AND (begins_with(#KY_CE_SK, :KY_CE_SK))',
    Limit: 10,
    TableName: 'test-table',
  });
  expect(users).toEqual({
    items: [
      {
        id: '1',
        name: 'Me',
        status: 'active',
      },
    ],
  });
});

test('finds item from given cursor position', async () => {
  dcMock.query.mockReturnValue({
    Items: [
      {
        PK: 'USER#1',
        SK: 'USER#1',
        GSI1PK: 'USER#STATUS#active',
        GSI1SK: 'USER#Me',
        id: '1',
        name: 'Me',
        status: 'active',
      },
      {
        PK: 'USER#2',
        SK: 'USER#2',
        GSI1PK: 'USER#STATUS#active',
        GSI1SK: 'USER#Me2',
        id: '2',
        name: 'Me',
        status: 'active',
      },
    ],
  });

  await manager.find<User, UserPrimaryKey>(
    User,
    {
      id: 'aaaa',
    },
    {
      keyCondition: {
        BEGINS_WITH: 'USER#',
      },
      limit: 10,
      cursor: {
        partitionKey: 'USER#1',
        sortKey: 'USER#1',
      },
    }
  );

  expect(dcMock.query).toHaveBeenCalledWith({
    ExclusiveStartKey: {
      partitionKey: 'USER#1',
      sortKey: 'USER#1',
    },
    ExpressionAttributeNames: {
      '#KY_CE_PK': 'PK',
      '#KY_CE_SK': 'SK',
    },
    ExpressionAttributeValues: {
      ':KY_CE_PK': 'USER#aaaa',
      ':KY_CE_SK': 'USER#',
    },
    KeyConditionExpression:
      '(#KY_CE_PK = :KY_CE_PK) AND (begins_with(#KY_CE_SK, :KY_CE_SK))',
    Limit: 10,
    TableName: 'test-table',
  });
});

test('queries items until limit is met', async () => {
  const itemsToReturn: any[] = [];
  for (let index = 1; index <= 1000; index++) {
    itemsToReturn.push({
      id: index.toString(),
      status: 'active',
      PK: `USER#${index}`,
      SK: `USER#${index}`,
    });
  }
  dcMock.query
    .mockImplementationOnce(() => ({
      Items: itemsToReturn,
      Count: itemsToReturn.length,
      LastEvaluatedKey: {
        partitionKey: 'USER#1000',
        sortKey: 'USER#1000',
      },
    }))
    .mockImplementationOnce(() => ({
      Items: itemsToReturn,
      Count: itemsToReturn.length,
    }));

  const users = await manager.find<User, UserPrimaryKey>(
    User,
    {
      id: '1',
    },
    {
      keyCondition: {
        BEGINS_WITH: 'USER#',
      },
      limit: 2000,
    }
  );

  expect(dcMock.query).toHaveBeenCalledTimes(2);
  expect(dcMock.query.mock.calls).toEqual([
    [
      {
        ExpressionAttributeNames: {
          '#KY_CE_PK': 'PK',
          '#KY_CE_SK': 'SK',
        },
        ExpressionAttributeValues: {
          ':KY_CE_PK': 'USER#1',
          ':KY_CE_SK': 'USER#',
        },
        KeyConditionExpression:
          '(#KY_CE_PK = :KY_CE_PK) AND (begins_with(#KY_CE_SK, :KY_CE_SK))',
        Limit: 2000,
        TableName: 'test-table',
      },
    ],
    [
      {
        ExclusiveStartKey: {
          partitionKey: 'USER#1000',
          sortKey: 'USER#1000',
        },
        ExpressionAttributeNames: { '#KY_CE_PK': 'PK', '#KY_CE_SK': 'SK' },
        ExpressionAttributeValues: {
          ':KY_CE_PK': 'USER#1',
          ':KY_CE_SK': 'USER#',
        },
        KeyConditionExpression:
          '(#KY_CE_PK = :KY_CE_PK) AND (begins_with(#KY_CE_SK, :KY_CE_SK))',
        Limit: 2000,
        TableName: 'test-table',
      },
    ],
  ]);
  expect(users.items.length).toEqual(2000);
});

/**
 * @group count
 */
test('counts items matching given query params', async () => {
  dcMock.query.mockReturnValue({
    Count: 132,
  });

  const usersCount = await manager.count<User, UserPrimaryKey>(
    User,
    {
      id: 'aaaa',
    },
    {
      keyCondition: {
        BEGINS_WITH: 'USER#',
      },
      consistentRead: true,
    }
  );

  expect(dcMock.query).toHaveBeenCalledTimes(1);
  expect(dcMock.query).toHaveBeenCalledWith({
    ExpressionAttributeNames: {
      '#KY_CE_PK': 'PK',
      '#KY_CE_SK': 'SK',
    },
    ExpressionAttributeValues: {
      ':KY_CE_PK': 'USER#aaaa',
      ':KY_CE_SK': 'USER#',
    },
    KeyConditionExpression:
      '(#KY_CE_PK = :KY_CE_PK) AND (begins_with(#KY_CE_SK, :KY_CE_SK))',
    Select: 'COUNT',
    ConsistentRead: true,
    TableName: 'test-table',
  });
  expect(usersCount).toEqual(132);
});

test('counts items with multiple requests', async () => {
  dcMock.query
    .mockImplementationOnce(() => ({
      Count: 121,
      LastEvaluatedKey: 'AAAA',
    }))
    .mockImplementationOnce(() => ({
      Count: 56,
      LastEvaluatedKey: 'BB',
    }))
    .mockImplementationOnce(() => ({
      Count: 13,
    }));

  const users = await manager.count<User, UserPrimaryKey>(
    User,
    {
      id: 'aaaa',
    },
    {
      keyCondition: {
        BEGINS_WITH: 'USER#',
      },
      where: {
        AND: {
          age: {
            BETWEEN: [1, 5],
          },
          name: {
            EQ: 'Me',
          },
          status: 'ATTRIBUTE_EXISTS',
        },
      },
    }
  );

  expect(dcMock.query).toHaveBeenCalledTimes(3);
  expect(dcMock.query.mock.calls).toEqual([
    [
      {
        ExpressionAttributeNames: {
          '#KY_CE_PK': 'PK',
          '#KY_CE_SK': 'SK',
          '#FE_age': 'age',
          '#FE_name': 'name',
          '#FE_status': 'status',
        },
        ExpressionAttributeValues: {
          ':KY_CE_PK': 'USER#aaaa',
          ':KY_CE_SK': 'USER#',
          ':FE_age_end': 5,
          ':FE_age_start': 1,
          ':FE_name': 'Me',
        },
        KeyConditionExpression:
          '(#KY_CE_PK = :KY_CE_PK) AND (begins_with(#KY_CE_SK, :KY_CE_SK))',
        FilterExpression:
          '(#FE_age BETWEEN :FE_age_start AND :FE_age_end) AND (#FE_name = :FE_name) AND (attribute_exists(#FE_status))',
        Select: 'COUNT',
        TableName: 'test-table',
      },
    ],
    [
      {
        ExclusiveStartKey: 'AAAA',
        ExpressionAttributeNames: {
          '#KY_CE_PK': 'PK',
          '#KY_CE_SK': 'SK',
          '#FE_age': 'age',
          '#FE_name': 'name',
          '#FE_status': 'status',
        },
        ExpressionAttributeValues: {
          ':KY_CE_PK': 'USER#aaaa',
          ':KY_CE_SK': 'USER#',
          ':FE_age_end': 5,
          ':FE_age_start': 1,
          ':FE_name': 'Me',
        },
        KeyConditionExpression:
          '(#KY_CE_PK = :KY_CE_PK) AND (begins_with(#KY_CE_SK, :KY_CE_SK))',
        FilterExpression:
          '(#FE_age BETWEEN :FE_age_start AND :FE_age_end) AND (#FE_name = :FE_name) AND (attribute_exists(#FE_status))',
        Select: 'COUNT',
        TableName: 'test-table',
      },
    ],
    [
      {
        ExclusiveStartKey: 'BB',
        ExpressionAttributeNames: {
          '#KY_CE_PK': 'PK',
          '#KY_CE_SK': 'SK',
          '#FE_age': 'age',
          '#FE_name': 'name',
          '#FE_status': 'status',
        },
        ExpressionAttributeValues: {
          ':KY_CE_PK': 'USER#aaaa',
          ':KY_CE_SK': 'USER#',
          ':FE_age_end': 5,
          ':FE_age_start': 1,
          ':FE_name': 'Me',
        },
        KeyConditionExpression:
          '(#KY_CE_PK = :KY_CE_PK) AND (begins_with(#KY_CE_SK, :KY_CE_SK))',
        FilterExpression:
          '(#FE_age BETWEEN :FE_age_start AND :FE_age_end) AND (#FE_name = :FE_name) AND (attribute_exists(#FE_status))',
        Select: 'COUNT',
        TableName: 'test-table',
      },
    ],
  ]);

  expect(users).toEqual(190);
});
