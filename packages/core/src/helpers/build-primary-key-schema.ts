import {
  Table,
  PrimaryKey,
  IsCompositePrimaryKey,
  EntityAliasOrString,
} from '@typedorm/common';
import { getInterpolatedKeys } from './get-interpolated-keys';
import { validateKey } from './validate-key';

export function buildPrimaryKeySchema({
  table,
  primaryKey,
  attributes,
}: {
  table: Table;
  primaryKey: PrimaryKey;
  attributes: { [key: string]: string };
}): {
  attributes: { [key: string]: EntityAliasOrString<any> };
  metadata: {
    _interpolations: { [key: string]: any };
  };
} {
  const partitionKeyInterpolations = getInterpolatedKeys(
    primaryKey.partitionKey
  );

  const tablePartitionKeyName = table.partitionKey;
  if (IsCompositePrimaryKey(primaryKey)) {
    // validate primary key signature
    if (!table.usesCompositeKey()) {
      throw new Error(
        `Table "${table.name}" does not use composite key, thus sort key "${primaryKey.sortKey}" should not exist.`
      );
    }

    validateKey(primaryKey.partitionKey, attributes);
    validateKey(primaryKey.sortKey, attributes);

    // build primary key
    const tableSortKeyName = table.sortKey ?? '';
    const sortKeyInterpolations = getInterpolatedKeys(primaryKey.sortKey);
    return {
      attributes: {
        [tablePartitionKeyName]: primaryKey.partitionKey,
        [tableSortKeyName]: primaryKey.sortKey,
      },
      metadata: {
        _interpolations: {
          [tablePartitionKeyName]: partitionKeyInterpolations,
          [tableSortKeyName]: sortKeyInterpolations,
        },
      },
    };
    // when current primary key is a simple key
  } else {
    // validate signature
    if (table.usesCompositeKey()) {
      throw new Error(
        `Table "${table.name}" uses composite key as a primary key, thus sort key is required`
      );
    }
    validateKey(primaryKey.partitionKey, attributes);

    // build primary key
    return {
      attributes: {
        [tablePartitionKeyName]: primaryKey.partitionKey,
      },
      metadata: {
        _interpolations: {
          [tablePartitionKeyName]: partitionKeyInterpolations,
        },
      },
    };
  }
}
