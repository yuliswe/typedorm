import { Connection } from 'src/core/classes/connection/connection';
import { ExpressionBuilder } from 'src/core/classes/expression/expression-builder';
import { ExpressionInputParser } from 'src/core/classes/expression/expression-input-parser';
import { BaseTransformer } from 'src/core/classes/transformer/base-transformer';
import { DocumentClientRequestTransformer } from 'src/core/classes/transformer/document-client-request-transformer';
import { EntityTransformer } from 'src/core/classes/transformer/entity-transformer';
import { applyMixins } from 'src/core/helpers/apply-mixins';

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
