import { BaseExpressionInput } from 'src/core/classes/expression/base-expression-input';

export class KeyCondition extends BaseExpressionInput {
  constructor() {
    super();
  }

  getExpNameKey(key: string): string {
    return `#KY_CE_${key}`;
  }
  getExpValueKey(key: string): string {
    return `:KY_CE_${key}`;
  }
}
