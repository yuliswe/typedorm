import { isObject } from 'packages/common/src/helpers/is-object';

export function isEmptyObject(item: any) {
  return isObject(item) && !Object.keys(item).length;
}
