import { isEmptyObject } from 'packages/common';
import {
  WriteBatchCreate,
  WriteBatchDelete,
} from 'packages/core/classes/batch/write-batch';

export function isBatchAddCreateItem<Entity>(
  item: any
): item is WriteBatchCreate<Entity> {
  return !isEmptyObject(item) && !!(item as WriteBatchCreate<Entity>).create;
}

export function isBatchAddDeleteItem<Entity, PrimaryKey>(
  item: any
): item is WriteBatchDelete<Entity, PrimaryKey> {
  return (
    !isEmptyObject(item) &&
    !!(item as WriteBatchDelete<Entity, PrimaryKey>).delete
  );
}
