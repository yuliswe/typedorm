import { isObject } from 'src/common/helpers/is-object';

export function isEmptyObject(item: any) {
  return isObject(item) && !Object.keys(item).length;
}
