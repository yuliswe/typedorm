import {
  DebugLogger,
  DYNAMO_QUERY_ITEMS_IMPLICIT_LIMIT,
  EntityTarget,
  getEntityDefinition,
  loadPackage,
  NoSuchEntityExistsError,
  Replace,
  Table,
} from '@typedorm/common';
import {
  DocumentClient,
  DocumentClientV2,
  DocumentClientV3,
} from '@typedorm/document-client';
import {isUsedForPrimaryKey} from '../../helpers/is-used-for-primary-key';
import {BatchManager} from '../manager/batch-manager';
import {EntityManager} from '../manager/entity-manager';
import {ScanManager} from '../manager/scan-manager';
import {TransactionManager} from '../manager/transaction-manager';
import {AttributeMetadata} from '../metadata/attribute-metadata';
import {
  DynamoEntitySchemaPrimaryKey,
  EntityMetadata,
} from '../metadata/entity-metadata';
import {ConnectionMetadataBuilder} from './connection-metadata-builder';
import {ConnectionOptions} from './connection-options';

export class Connection {
  readonly name: string;
  readonly table: Table;
  readonly entityManager: EntityManager;
  readonly transactionManger: TransactionManager;
  readonly batchManager: BatchManager;
  readonly scanManager: ScanManager;
  readonly defaultConfig: {queryItemsImplicitLimit: number};
  readonly documentClient: DocumentClient;
  readonly logger: DebugLogger;

  private _entityMetadatas: Map<string, EntityMetadata>;
  private isConnected: boolean;

  constructor(
    private options: ConnectionOptions,
    private destroySelf: (name: string) => void
  ) {
    const {table, name = 'default'} = options;
    if (table) {
      this.table = table;
    }
    this.name = name;
    this.entityManager = new EntityManager(this);
    this.batchManager = new BatchManager(this);
    this.transactionManger = new TransactionManager(this);
    this.scanManager = new ScanManager(this);
    this.defaultConfig = {
      queryItemsImplicitLimit:
        options.dynamoQueryItemsImplicitLimit ??
        DYNAMO_QUERY_ITEMS_IMPLICIT_LIMIT,
    };

    this.documentClient = this.loadOrInitiateDocumentClient(
      options.documentClient
    );

    /**
     * This makes sure that we only ever build entity metadatas once per connection
     */
    this.isConnected = false;
    this.logger = new DebugLogger();
  }

  connect() {
    if (this.isConnected) {
      throw new Error(
        'There is already an active connection, Connect should only be called once per application.'
      );
    }

    try {
      this._entityMetadatas = new Map(
        this.buildMetadatas().map(entityMeta => [
          entityMeta.target.name,
          entityMeta,
        ])
      );

      this.isConnected = true;
      return this;
    } catch (err) {
      // Failed to connect to connection, clear self from connection manager
      this.destroySelf(this.name);
      throw err;
    }
  }

  get entityMetadatas() {
    return Array.from(this._entityMetadatas.values());
  }

  hasMetadata<Entity>(entityClass: EntityTarget<Entity>) {
    return !!this.getEntityByTarget(entityClass);
  }

  getAttributesForEntity<Entity>(entityClass: EntityTarget<Entity>) {
    const attributesMap = this._entityMetadatas.get(entityClass.name);
    if (!attributesMap) {
      throw new Error(
        `Cannot find attributes for entity "${entityClass.name}".`
      );
    }
    return attributesMap.attributes;
  }

  get globalTable() {
    return this.table;
  }

  /**
   * Returns any attributes marked as unique
   * If attribute used in a primary key is marked as unique, it is ignored, since all primary key are always unique
   * @param entityClass
   */
  getUniqueAttributesForEntity<Entity>(entityClass: EntityTarget<Entity>) {
    const entityMetadata = this.getEntityByTarget(entityClass);

    return this.getAttributesForEntity<Entity>(entityClass).filter(attr => {
      // only attributes that are not part of primary key should be included
      return (
        (attr as AttributeMetadata)?.unique &&
        !isUsedForPrimaryKey(entityMetadata.schema.primaryKey, attr.name)
      );
    }) as Replace<
      AttributeMetadata,
      'unique',
      {unique: DynamoEntitySchemaPrimaryKey}
    >[];
  }

  /**
   * Returns a list of attribute names that are referenced in primary key
   * @param entityClass Entity to get primary key attributes for
   * @returns
   */
  getPrimaryKeyAttributeInterpolationsForEntity<Entity>(
    entityClass: EntityTarget<Entity>
  ) {
    const entityMetadata = this.getEntityByTarget(entityClass);
    return [
      ...new Set(
        Object.values(
          entityMetadata.schema.primaryKey.metadata._interpolations ?? {}
        ).flat()
      ),
    ];
  }

  getEntityByTarget<Entity>(entityClass: EntityTarget<Entity>) {
    const metadata = this._entityMetadatas.get(entityClass.name);
    if (!metadata) {
      throw new Error(
        `No such entity named "${entityClass.name}" is known to TypeDORM, make sure it is declared at the connection creation time.`
      );
    }
    return metadata;
  }

  getEntityByPhysicalName(name: string) {
    const entitySpec = getEntityDefinition(name);

    if (!entitySpec) {
      throw new NoSuchEntityExistsError(name);
    }
    return this.getEntityByTarget(entitySpec.target);
  }

  getAutoUpdateAttributes<Entity>(entityClass: EntityTarget<Entity>) {
    return this.getAttributesForEntity(entityClass).filter(
      attr => attr?.autoUpdate
    );
  }

  isUsedForPrimaryKey(
    primaryKey: DynamoEntitySchemaPrimaryKey,
    attributeName: string
  ) {
    const primaryKeyInterpolations = primaryKey.metadata._interpolations ?? {};
    return Object.keys(primaryKeyInterpolations).some(key => {
      const currInterpolation = primaryKeyInterpolations[key];
      return currInterpolation.includes(attributeName);
    });
  }

  buildMetadatas() {
    return new ConnectionMetadataBuilder(this).buildEntityMetadatas(
      this.options.entities
    );
  }

  loadOrInitiateDocumentClient(documentClient?: unknown) {
    if (!documentClient) {
      const AWSModule = loadPackage('aws-sdk');
      return new DocumentClientV2(new AWSModule.DynamoDB.DocumentClient());
    }

    if (documentClient instanceof DocumentClientV2) {
      return documentClient;
    } else if (documentClient instanceof DocumentClientV3) {
      return documentClient;
    } else {
      return new DocumentClientV2(documentClient as any);
    }
  }
}
