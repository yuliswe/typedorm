import { EntityTarget, IsEntityInstance } from 'packages/common';

export function getConstructorForInstance<Entity>(
  entity: unknown
): EntityTarget<Entity> {
  if (!IsEntityInstance(entity)) {
    throw new Error('Cannot transform Class to dynamo object');
  }
  return entity.constructor;
}
