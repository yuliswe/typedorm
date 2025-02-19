import {
  AttributeOptionsUniqueType,
  CompositePrimaryKey,
  DYNAMO_ATTRIBUTE_PREFIX,
  EntityTarget,
  IsPrimaryKey,
  PrimaryKey,
  ScalarType,
  SimplePrimaryKey,
  Table,
} from 'src/common';
import {
  BaseAttributeMetadata,
  BaseAttributeMetadataOptions,
} from 'src/core/classes/metadata/base-attribute-metadata';
import { DynamoEntitySchemaPrimaryKey } from 'src/core/classes/metadata/entity-metadata';
import { buildPrimaryKeySchema } from 'src/core/helpers/build-primary-key-schema';
import { isScalarTypeProvider } from 'src/core/helpers/is-scalar-type';

export interface AttributeMetadataOptions extends BaseAttributeMetadataOptions {
  table: Table;
  entityClass: EntityTarget<any>;
  unique?: AttributeOptionsUniqueType;
  default?: ScalarType | (() => ScalarType);
}

export class AttributeMetadata extends BaseAttributeMetadata {
  readonly unique?: DynamoEntitySchemaPrimaryKey;
  readonly autoUpdate?: () => any;
  readonly default?: (entity: any) => ScalarType;
  readonly table: Table;
  readonly entityClass: EntityTarget<any>;
  constructor(options: AttributeMetadataOptions) {
    const { name, entityClass, unique, table } = options;
    super(options);
    this.entityClass = entityClass;
    this.table = table;
    this.default = this.getDefaultValueProvider(name, options.default);

    if (unique) {
      this.unique = this.buildUniqueAttributesPrimaryKey(unique);
    }
  }

  private getDefaultValueProvider(
    attrName: string,
    defaultValue: AttributeMetadataOptions['default']
  ) {
    if (!defaultValue) {
      return;
    }

    if (isScalarTypeProvider(defaultValue)) {
      return defaultValue;
    } else {
      return () => defaultValue;
    }
  }

  private buildUniqueAttributesPrimaryKey(unique: AttributeOptionsUniqueType) {
    if (IsPrimaryKey(unique)) {
      return buildPrimaryKeySchema({
        table: this.table,
        primaryKey: unique,
        attributes: {
          [this.name]: this.type,
        },
      });
    } else {
      return this.autoGeneratedPrimaryKeySchema();
    }
  }

  private autoGeneratedPrimaryKeySchema() {
    const primaryKey = {} as PrimaryKey;

    const uniqueKeyValue = `${DYNAMO_ATTRIBUTE_PREFIX}_${this.entityClass.name.toUpperCase()}.${this.name.toUpperCase()}#{{${
      this.name
    }}}`;

    if (this.table.usesCompositeKey()) {
      (primaryKey as CompositePrimaryKey).partitionKey = uniqueKeyValue;
      (primaryKey as CompositePrimaryKey).sortKey = uniqueKeyValue;
    } else {
      (primaryKey as SimplePrimaryKey).partitionKey = uniqueKeyValue;
    }

    return buildPrimaryKeySchema({
      table: this.table,
      primaryKey,
      attributes: {
        [this.name]: this.type,
      },
    });
  }
}
