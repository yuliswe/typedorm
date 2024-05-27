import { RequireOnlyOne, type KeyConditionType } from 'packages/common';

export type KeyConditionOptions<V> = RequireOnlyOne<
  {
    [key in KeyConditionType.SimpleOperator]: V;
  } & {
    [key in KeyConditionType.FunctionOperator]: string;
  } & {
    [key in KeyConditionType.RangeOperator]: [V, V];
  }
>;
