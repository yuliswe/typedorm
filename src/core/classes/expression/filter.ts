import { BaseExpressionInput } from 'src/core/classes/expression/base-expression-input';

export class Filter extends BaseExpressionInput {
  protected getExpNameKey(key: string): string {
    return `#FE_${key}`;
  }
  protected getExpValueKey(key: string): string {
    return `:FE_${key}`;
  }
}
