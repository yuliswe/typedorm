import { InvalidType } from 'src/common/helpers/invalid-type';
import { ScalarType } from 'src/common/helpers/scalar-type';

export type ResolveScalarType<T> = T extends ScalarType
  ? T
  : T extends any[]
    ? T[0] extends ScalarType
      ? T[0]
      : InvalidType<[T[0], 'can not be resolved to a scalar type']>
    : InvalidType<[T, 'can not be resolved to a scalar type']>;
