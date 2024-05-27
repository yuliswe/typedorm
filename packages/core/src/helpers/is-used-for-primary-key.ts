import { IsCompositePrimaryKey, PrimaryKey } from 'packages/common';
import { DynamoEntitySchemaPrimaryKey } from 'packages/core/src/classes/metadata/entity-metadata';
import { getInterpolatedKeys } from 'packages/core/src/helpers/get-interpolated-keys';

const IsRawPrimaryKey = (key: unknown): key is PrimaryKey => {
  return !!(key as PrimaryKey).partitionKey;
};

export function isUsedForPrimaryKey(
  primaryKey: DynamoEntitySchemaPrimaryKey | PrimaryKey,
  attributeName: string
) {
  let primaryKeyInterpolations = [] as string[];

  // if raw primary key was provided, resolve all the interpolations for it
  if (IsRawPrimaryKey(primaryKey)) {
    primaryKeyInterpolations = [
      ...primaryKeyInterpolations,
      ...getInterpolatedKeys(primaryKey.partitionKey),
    ];

    if (IsCompositePrimaryKey(primaryKey)) {
      primaryKeyInterpolations = [
        ...primaryKeyInterpolations,
        ...getInterpolatedKeys(primaryKey.sortKey),
      ];
    }
    // when parsed primary key is provided, flatten all interpolations to an array
  } else {
    const interpolationsToFlatten = primaryKey.metadata._interpolations ?? {};
    primaryKeyInterpolations = [
      ...primaryKeyInterpolations,
      ...Object.keys(interpolationsToFlatten).flatMap(key => {
        const currInterpolation = interpolationsToFlatten[key];
        return currInterpolation;
      }),
    ];
  }

  // check if there is a matching attribute name
  return primaryKeyInterpolations.includes(attributeName);
}
