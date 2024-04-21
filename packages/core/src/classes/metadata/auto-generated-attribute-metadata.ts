import { AUTO_GENERATE_ATTRIBUTE_STRATEGY } from '@typedorm/common';
import { autoGenerateValue } from '../../helpers/auto-generate-attribute-value';
import {
  BaseAttributeMetadata,
  BaseAttributeMetadataOptions,
} from './base-attribute-metadata';

export const IsAutoGeneratedAttributeMetadata = (
  attr: any
): attr is AutoGeneratedAttributeMetadata => !!attr.strategy;

export interface AutoGeneratedAttributeMetadataOptions
  extends BaseAttributeMetadataOptions {
  strategy: AUTO_GENERATE_ATTRIBUTE_STRATEGY;
  autoUpdate?: boolean;
}

export class AutoGeneratedAttributeMetadata extends BaseAttributeMetadata {
  readonly strategy: AUTO_GENERATE_ATTRIBUTE_STRATEGY;
  readonly autoUpdate: boolean;
  readonly unique: boolean;

  constructor(options: AutoGeneratedAttributeMetadataOptions) {
    const { strategy, autoUpdate } = options;
    super(options);
    this.autoUpdate = !!autoUpdate;
    this.strategy = strategy;
  }

  get value() {
    return autoGenerateValue(this.strategy);
  }
}
