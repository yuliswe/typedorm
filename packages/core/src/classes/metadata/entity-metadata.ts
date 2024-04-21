import {
  EntityRawMetadataOptions,
  EntityTarget,
  Indexes,
  INDEX_TYPE,
  INTERNAL_ENTITY_ATTRIBUTE,
  Table,
} from '@typedorm/common';
import { buildPrimaryKeySchema } from '../../helpers/build-primary-key-schema';
import { getInterpolatedKeys } from '../../helpers/get-interpolated-keys';
import { validateKey } from '../../helpers/validate-key';
import { Connection } from '../connection/connection';
import { AttributeMetadata } from './attribute-metadata';
import { AutoGeneratedAttributeMetadata } from './auto-generated-attribute-metadata';
import { BaseMetadata } from './base-metadata';
import { InternalAttributeMetadata } from './internal-attribute-metadata';

export type DynamoEntitySchemaPrimaryKey = {
  attributes: { [key: string]: any };
  metadata: {
    _interpolations?: { [key: string]: string[] };
  };
};
export type DynamoEntityIndexesSchema = {
  [key: string]: {
    attributes: { [key: string]: any };
    metadata: DynamoEntityIndexSchema;
  };
};

export type DynamoEntityIndexSchema = {
  // auto generated
  _name?: string;
  // for LSI, only contains interpolations for sort key
  _interpolations?: { [key: string]: string[] };
  isSparse: boolean;
  type: INDEX_TYPE;
};

export interface DynamoEntitySchema {
  primaryKey: DynamoEntitySchemaPrimaryKey;
  indexes?: DynamoEntityIndexesSchema;
  schemaVersionAttribute?: string;
}

export type AttributeMetadataType =
  | AttributeMetadata
  | AutoGeneratedAttributeMetadata;

export interface EntityMetadataOptions extends EntityRawMetadataOptions {
  table: Table;
  connection: Connection;
  attributes: AttributeMetadataType[];
}

export class EntityMetadata extends BaseMetadata {
  readonly name: string;
  readonly table: Table;
  readonly target: EntityTarget<any>;
  readonly attributes: AttributeMetadataType[];
  readonly internalAttributes: InternalAttributeMetadata[];
  readonly schema: DynamoEntitySchema;
  constructor({
    connection,
    table,
    name,
    target,
    primaryKey,
    indexes,
    attributes,
    schemaVersionAttribute,
  }: EntityMetadataOptions) {
    super(connection);
    this.name = name;
    this.target = target;
    this.attributes = attributes;
    this.table = table;

    // auto persist internal attributes
    this.internalAttributes = [
      new InternalAttributeMetadata({
        name: INTERNAL_ENTITY_ATTRIBUTE.ENTITY_NAME,
        type: 'String',
        value: this.name,
      }),
    ];

    // validate attributes and key type pair
    const attributesKeyTypePair = this.attributes.reduce(
      (acc, attr) => {
        this.validateAttributeMetadata(attr);
        acc[attr.name] = attr.type;
        return acc;
      },
      {} as { [key: string]: string }
    );

    this.schema = {
      primaryKey: buildPrimaryKeySchema({
        table: this.table,
        primaryKey,
        attributes: attributesKeyTypePair,
      }),
      indexes: this.buildIndexesSchema({
        table: this.table,
        indexes: { ...indexes },
        attributes: attributesKeyTypePair,
      }),
      schemaVersionAttribute,
    };
  }

  private validateAttributeMetadata(
    attributeToValidate: AttributeMetadataType
  ) {
    this.internalAttributes.forEach(internalAttr => {
      if (attributeToValidate.name === internalAttr.name) {
        throw new Error(
          `Attribute name "${attributeToValidate.name}" is reserved by TypeDORM and cannot be used.`
        );
      }
    });
  }

  private buildIndexesSchema({
    table,
    indexes,
    attributes,
  }: {
    table: Table;
    indexes: Indexes;
    attributes: { [key: string]: string };
  }): DynamoEntityIndexesSchema {
    return Object.keys(indexes).reduce((acc, key) => {
      const tableIndexSignature = table.getIndexByKey(key);
      if (!tableIndexSignature) {
        throw new Error(
          `No matching index signature found for index "${key}" in table "${table.name}"`
        );
      }

      const currentIndex = indexes[key];

      validateKey(currentIndex.sortKey, attributes, this.name);
      // validates and gets and fill set indexes interpolations of sort key
      const sortKeyInterpolations = getInterpolatedKeys(currentIndex.sortKey);

      if (tableIndexSignature.type === INDEX_TYPE.LSI) {
        if (currentIndex.type !== INDEX_TYPE.LSI) {
          throw new Error('Index signature mismatch.');
        }
        acc[key] = {
          attributes: {
            [tableIndexSignature.sortKey]: currentIndex.sortKey,
          },
          metadata: {
            type: tableIndexSignature.type,
            isSparse:
              currentIndex.isSparse === undefined ||
              currentIndex.isSparse === null
                ? true // by default all indexes are sparse
                : !!currentIndex.isSparse,
            _name: key,
            _interpolations: {
              [tableIndexSignature.sortKey]: sortKeyInterpolations,
            },
          },
        };

        return acc;
      } else {
        if (currentIndex.type !== INDEX_TYPE.GSI) {
          throw new Error('Index signature mismatch.');
        }
        validateKey(currentIndex.partitionKey, attributes);
        // validates and gets and fill set indexes interpolations of partition key
        const partitionKeyInterpolations = getInterpolatedKeys(
          currentIndex.partitionKey
        );

        acc[key] = {
          attributes: {
            [tableIndexSignature.partitionKey]: currentIndex.partitionKey,
            [tableIndexSignature.sortKey]: currentIndex.sortKey,
          },
          metadata: {
            isSparse:
              currentIndex.isSparse === undefined ||
              currentIndex.isSparse === null
                ? true // by default all indexes are sparse
                : !!currentIndex.isSparse,
            type: tableIndexSignature.type,
            _name: key,
            // remove any duplicates from partition or sort keys
            _interpolations: {
              [tableIndexSignature.partitionKey]: partitionKeyInterpolations,
              [tableIndexSignature.sortKey]: sortKeyInterpolations,
            },
          },
        };
        return acc;
      }
    }, {} as DynamoEntityIndexesSchema);
  }
}
