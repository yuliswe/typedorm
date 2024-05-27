import { deepSortObject } from 'packages/core/helpers/deep-sort-object';
import { v5, validate } from 'uuid';

/**
 * Generates unique id from SHA1 hashed data and given namespaceId
 * @param namespaceId unique namespace id to generate scoped id
 * @param dataToHash object to hash
 * @returns string
 *
 */
export function getHashedIdForInput<T extends object>(
  namespaceId: string,
  dataToHash: T
) {
  if (!validate(namespaceId)) {
    throw new Error('Workspace id must be an uuid');
  }

  // since JSON.stringify doesn't guarantee order, we first sort them before creating hash of it
  const sortedObj = deepSortObject(dataToHash);

  const stringifiedData = JSON.stringify(sortedObj);
  return v5(stringifiedData, namespaceId);
}
