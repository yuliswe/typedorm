import { MissingRequiredDependencyError } from 'packages/common/src/error/missing-required-dep';
export function loadPackage(packageName: string) {
  try {
    return require(packageName);
  } catch (err) {
    throw new MissingRequiredDependencyError(packageName);
  }
}
