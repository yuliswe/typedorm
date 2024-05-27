# Step by step guide

Working with relational data in dynamoDB can be painful, but it doesn't have to be. This guide will walk you through relational data modeling can be simplified using TypeDORM.

- [Step by step guide](#step-by-step-guide)
  - [Creating a table](#creating-a-table)
  - [Creating a model](#creating-a-model)
  - [Creating an entity](#creating-an-entity)
  - [Adding attributes to an entity](#adding-attributes-to-an-entity)
  - [Adding auto generated attributes](#adding-auto-generated-attributes)
  - [Creating a Connection](#creating-a-connection)
  - [Get managers for connection](#get-managers-for-connection)
    - [Get manager instance from current connection](#get-manager-instance-from-current-connection)
    - [Get manager instance from current TypeDORM context](#get-manager-instance-from-current-typedorm-context)
  - [Manager Operations](#manager-operations)
    - [Create a record](#create-a-record)
    - [Find a record](#find-a-record)
    - [Update a record](#update-a-record)
    - [Query 1-m relations](#query-1-m-relations)
    - [Delete a record](#delete-a-record)

## Creating a table

**Table** in TypeDORM is different to entity (at least until there is a way to provision table resource from entity schema), unlike [TypeORM](https://github.com/typeorm/typeorm), and must be provisioned (most likely outside of TypeDORM lifecycle) and declared like this:

```Typescript
const myTable = new Table({
  name: 'my-table',
  partitionKey: 'PK',
  sortKey: 'SK',
  indexes: {
    GSI1: {
      type: INDEX_TYPE.GSI,
      partitionKey: 'GSI1PK',
      sortKey: 'GSI1SK',
    },
    LSI1: {
      type: INDEX_TYPE.LSI,
      sortKey: 'LSI1SK',
    },
  },
});
```

_Note_: _when working with Single table, you will only need one global table declaration per connection._

## Creating a model

When working with TypeDORM, first thing you would want to do is to define a model, this will define all the properties and it's types.

For example, storing our `User` as model will look like this,

```Typescript
export class User {
  id: string;
  name: string;
  email: string;
  status: string
}

```

This is what we will need to use when creating new records in dynamoDB, but TypeDORM doesn't know how to organize this model in table, such as what indexes it uses, what the primary key is, etc. , for that we need to defined an entity for model. You really only need to define model as entity if that model needs to be stored in dynamoDB table, any application level models can be excluded.

## Creating an entity

**Entity** is a class representation of a model. `@Entity` lets TypeDORM know how to parse/un-parse. Primary key and any indexes defined in here must be of what the class can accept.
For example, if table is using simple primary key and trying to define `@Entity` decorator with composite primary key, TypeDORM will reject the configuration. In the same way if any index declared on entity does is not known to above table configuration, TypeDORM will reject it,

Turning earlier model into Entity

```Typescript
@Entity({
  name: 'user', // name of the entity that will be added to each item as an attribute
  // primary key
  primaryKey: {
    partitionKey: 'USER#{{id}}',
    sortKey: 'USER#{{id}}',
  },
  indexes: {
    // specify GSI1 key - "GSI1" named global secondary index needs to exist in above table declaration
    GSI1: {
      partitionKey: 'USER#{{id}}',
      sortKey: 'USER#{{id}}#STATUS#{{status}}',
      type: INDEX_TYPE.GSI,
    },
  },
})
export class User {
  id: string;
  name: string;
  email: string;
  status: string
}
```

Now, TypeDORM knows about all indexes, keys and how it needs to be structured, but still doesn't know about attributes that will go with specified entities and where to get values for tokens like `{{status}}`. we will do that next.

## Adding attributes to an entity

To add attributes to entity, use `@Attribute` or other higher level annotations like `@AutoGenerateAttribute`.

```Typescript
import {Table} from 'src/common';

@Entity({
  name: 'user', // name of the entity that will be added to each item as an attribute
  // primary key
  primaryKey: {
    partitionKey: 'USER#{{id}}',
    sortKey: 'USER#{{id}}',
  },
  indexes: {
    // specify GSI1 key - "GSI1" named global secondary index needs to exist in above table declaration
    GSI1: {
      partitionKey: 'USER#{{id}}',
      sortKey: 'USER#{{id}}#STATUS#{{status}}',
      type: INDEX_TYPE.GSI,
    },
  },
})
export class User {
  id: string;

  @Attribute()
  name: string;

  @Attribute({
    unique: true
  })
  email: string;

  @Attribute()
  status: string

  updatedAt: string
}
```

This will tell TypeDORM that entity `User` has `id`, `name`, `email`, `status` and `updatedAt`. There is also a `unique: true` option provided to `email`, what this does is tells TypeDORM to always maintain uniqueness on `email`.

## Adding auto generated attributes

When working with databases, there is usually a need of creating some sort of unique identifiers, TypeDORM can do that for you. All you need to do is to annotate property with `@AutoGenerateAttribute` then specify strategy and other options.

```Typescript
import {Attribute, Entity, AutoGenerateAttribute} from 'src/common';
import {AUTO_GENERATE_ATTRIBUTE_STRATEGY} from 'src/common';

@Entity({
  name: 'user', // name of the entity that will be added to each item as an attribute
  // primary key
  primaryKey: {
    partitionKey: 'USER#{{id}}',
    sortKey: 'USER#{{id}}',
  },
  indexes: {
    // specify GSI1 key - "GSI1" named global secondary index needs to exist in above table declaration
    GSI1: {
      partitionKey: 'USER#{{id}}',
      sortKey: 'USER#{{id}}#STATUS#{{status}}',
      type: INDEX_TYPE.GSI,
    },
  },
})
export class User {
  @AutoGenerateAttribute({
    strategy: AUTO_GENERATE_ATTRIBUTE_STRATEGY.UUID4,
  })
  id: string;

  @Attribute()
  name: string;

  @Attribute({
    unique: true
  })
  email: string;

  @Attribute()
  status: string

  @AutoGenerateAttribute({
    strategy: AUTO_GENERATE_ATTRIBUTE_STRATEGY.EPOCH,
    autoUpdate: true
  })
  updatedAt: string
}
```

Now, `id` and `updatedAt` will be auto generated based on specified strategy.
Other than that, there is a `autoUpdate: true` on `updatedAt`, which just marks it to be auto updated whenever new write operation happens on record.

## Creating a Connection

Now we have entity and it's attributes created, it's time to register them in an connection. This configuration will usually go at in the entrypoint file, if using `express`, that will be your `app.js`.

```Typescript
import 'reflect-metadata';
import {createConnection} from 'src/core';
import {User} from './entities/user.entity'

createConnection({
  table: myGlobalTable,
  entities: [User], // list other entities as you go
});

// or specify a match pattern where entities are stored, like this

createConnection({
  table: myGlobalTable,
  entities: './entities/*.entity.ts',
});

```

## Get managers for connection

Every connection has it's unique instance of all managers, and they have the ability to call respective transformers to normalize/de-normalize item based on it's schema.
Therefore, when working with multiple connections simultaneously (i.e. two tables configured in diff accounts using diff creds), it is important to be able get current manager by name, there for TypeDORM provides two ways to call this manager instances.

For given two connections,

```Typescript
const defaultConnection = createConnection({
  table: myGlobalTable,
  entities: './entities/*.entity.ts',
});

const anotherConnection = createConnection({
  name: 'other-connection',
  table: myGlobalTable,
  entities: './entities/*.entity.ts',
});
```

### Get manager instance from current connection

```Typescript
const defaultEntityManager = defaultConnection.entityManager
const defaultTransactionManager = defaultConnection.transactionManager
// ...

const anotherEntityManager = anotherConnection.entityManager
const anotherTransactionManager = anotherConnection.transactionManager
// ...

```

### Get manager instance from current TypeDORM context

```Typescript
const defaultEntityManager = getEntityManager()
const defaultTransactionManager = getTransactionManager()
// ...

const anotherEntityManager = getEntityManager('other-connection')
const anotherTransactionManager = getTransactionManager('other-connection')
// ...
```

## Manager Operations

### Create a record

This is all the minimum configuration we need, now let's create a user record.

```Typescript
import {getEntityManager} from 'src/core';
import {User} from './entities/user.entity'

const user = new User();
user.name = 'Loki';
user.status = 'active';
user.email = 'loki@asgard.com'

// create user record
const response = await getEntityManager().create(user);

// response:
{
  id: 'some-auto-generated-uuid',
  name: 'Loki',
  status: 'active',
  email: 'loki@asgard.com',
  updatedAt: 12312312313
}
```

To understand how TypeDORM handles these entities under the hood see [this](./how-it-works.md#creating-a-record).

### Find a record

Once item is created using TypeDORM, it can be retrieved/fetched using continent methods like `find`, `findOne`, `exists`.

To query our earlier created user item

```Typescript
import {getEntityManager} from 'src/core';
import {User} from './entities/user.entity'

// since primary key is only single attribute `id`, we only need to pass that when reading item back
const user = await getEntityManager().findOne(User, {id: 'some-auto-generated-uuid'})

// response:
{
  id: 'some-auto-generated-uuid',
  name: 'Loki',
  status: 'active',
  email: 'loki@asgard.com',
  updatedAt: 12312312313
}
```

### Update a record

Items can be updated using simple update functions on entity manager and can be written like this

```Typescript
import {getEntityManager} from 'src/core';
import {User} from './entities/user.entity'

// since primary key is only single attribute `id`, we only need to pass that when reading item back
const user = await getEntityManager().update(User, {id: 'some-auto-generated-uuid'},
 {name: 'Ex-Loki', status: 'inactive'}
)

// response:
{
  id: 'some-auto-generated-uuid',
  name: 'Ex-Loki',
  status: 'inactive',
  email: 'loki@asgard.com',
  updatedAt: 12312312313
}
```

To get more insight on how how update works with TypeDORM, have a look at [this](./how-it-works.md#updating-a-record)

### Query 1-m relations

Going ahead with earlier example of `User` entity, let's each of our user can have many orders, and our order entity looks like this

```Typescript
import {Attribute, Entity, AutoGenerateAttribute} from 'src/common';
import {AUTO_GENERATE_ATTRIBUTE_STRATEGY} from 'src/common';

@Entity({
  name: 'order',
  primaryKey: {
    partitionKey: 'ORDER#{{id}}',
    sortKey: 'ORDER#{{id}}',
  },
  indexes: {
    GSI1: {
      partitionKey: 'USER#{{userId}}',
      sortKey: 'ORDER#{{status}}#CREATED_AT#{{createdAt}}',
      type: INDEX_TYPE.GSI,
    },
  },
})
export class Order {
  @AutoGenerateAttribute({
    strategy: AUTO_GENERATE_ATTRIBUTE_STRATEGY.UUID4,
  })
  id: string;

  // userId must be present on each order, so that we can link it back to belonging user
  @Attribute()
  userId: string

  @Attribute()
  items: any[];

  @Attribute()
  status: string

  @AutoGenerateAttribute({
    strategy: AUTO_GENERATE_ATTRIBUTE_STRATEGY.EPOCH,
  })
  createdAt: string
}
```

With having above order entity next to user entity, we can not perform 1:m items lookups, such as
Now, let's have a look at what it would look like querying below two patterns

- get all the `cancelled` orders for user x

```Typescript
import {getEntityManager} from 'src/core';
import {User} from './entities/user.entity'


const cancelledOrders = await getEntityManager().find(Order,
  {userId: 'user-1'}, {
  queryIndex: 'GSI1',
  keyCondition: {
    BEGINS_WITH: 'ORDER#cancelled',
  },
})

// response:
[
  {
    id: 'order-1',
    userId: 'user-1',
    items: [...],
    status: 'cancelled',
    createdAt: 1212312312
  },
  {
    id: 'order-2',
    userId: 'user-1',
    items: [...],
    status: 'cancelled',
    createdAt: 1212312312
  },
  ...
]
```

- get recent 5 orders that `pending`.

```Typescript
import {getEntityManager} from 'src/core';
import {User} from './entities/user.entity'


const recentPendingOrders = await getEntityManager().find(Order,
  {userId: 'user-1'}, {
  queryIndex: 'GSI1',
  keyCondition: {
    BEGINS_WITH: 'ORDER#pending',
  },
  limit: 5,
  orderBy: QUERY_ORDER.DESC
})

// response:
[
  {
    id: 'order-100',
    userId: 'user-1',
    items: [...],
    status: 'pending',
    createdAt: 1512312312
  },
  {
    id: 'order-99',
    userId: 'user-1',
    items: [...],
    status: 'pending',
    createdAt: 1412312312
  },
  ... 3 more recent order items
]
```

To understand more on how the query input looks like when it is passed to DocumentClient, have a look at [this](./how-it-works.md#querying-items)

### Delete a record

Items can be updated using simple update functions on entity manager and can be written like this

```Typescript
import {getEntityManager} from 'src/core';
import {User} from './entities/user.entity'

// since primary key is only single attribute `id`, we only need to pass that when reading item back
const user = await getEntityManager().delete(User, {id: 'user-1'})

// response:
{
  success: true
}
```

And from TypeDORM perspective, item delete request will be sent as [this](./how-it-works.md#deleting-a-record)
