import { Connection } from 'packages/core/classes/connection/connection';
import { ExpressionBuilder } from 'packages/core/classes/expression/expression-builder';
import { ExpressionInputParser } from 'packages/core/classes/expression/expression-input-parser';
import { BaseTransformer } from 'packages/core/classes/transformer/base-transformer';
import { DocumentClientRequestTransformer } from 'packages/core/classes/transformer/document-client-request-transformer';
import { EntityTransformer } from 'packages/core/classes/transformer/entity-transformer';
import { applyMixins } from 'packages/core/helpers/apply-mixins';

export interface LowOrderTransformers
  extends DocumentClientRequestTransformer,
    EntityTransformer {}

export class LowOrderTransformers {
  constructor(public connection: Connection) {
    /**
     * running mixins over extended classes does not roll over expressions
     */
    this._expressionBuilder = new ExpressionBuilder();
    this._expressionInputParser = new ExpressionInputParser();
  }
}

// dynamically extend both low order transformers
applyMixins(LowOrderTransformers, [
  BaseTransformer,
  EntityTransformer,
  DocumentClientRequestTransformer,
]);
