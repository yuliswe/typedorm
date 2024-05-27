import { PrimaryKey } from 'packages/common/metadata/metadata-storage';
export function IsPrimaryKey(key: any): key is PrimaryKey {
  return !!(key as PrimaryKey).partitionKey;
}
