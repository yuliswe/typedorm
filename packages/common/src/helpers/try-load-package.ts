import { MissingRequiredDependencyError } from 'packages/common/src/error/missing-required-dep';
import { loadPackage } from 'packages/common/src/helpers/load-package';

export function tryLoadPackage(packageName: string) {
  try {
    return loadPackage(packageName);
  } catch (err) {
    if (err instanceof MissingRequiredDependencyError) {
      return null;
    } else {
      throw err;
    }
  }
}
