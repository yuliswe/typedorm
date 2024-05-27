import { ScalarType, UpdateType } from 'packages/common';
import { Update } from 'packages/core/src/classes/expression/update/update';

export class AddUpdate extends Update {
  protected prefix: UpdateType.Action = 'ADD';

  addTo(key: string, value: number | ScalarType[]): this {
    const attrExpName = this.addExpressionName(key);
    const attrExpValue = this.addExpressionValue(key, value);

    this.appendToExpression(`${attrExpName} ${attrExpValue}`);
    return this;
  }
}
