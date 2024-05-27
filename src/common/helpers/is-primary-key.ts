import { PrimaryKey } from 'src/common/metadata/metadata-storage';
export function IsPrimaryKey(key: any): key is PrimaryKey {
  return !!(key as PrimaryKey).partitionKey;
}
