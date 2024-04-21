import { AUTO_GENERATE_ATTRIBUTE_STRATEGY } from '../enums';
import { MetadataManager } from '../metadata/metadata-manager';
import { AutoGenerateAttributeRawMetadataOptions } from '../metadata/metadata-storage';
import { MissingReflectMetadataError } from '../error';

export interface AutoGeneratedAttributeOptions {
  /**
   * Auto generate strategy to use
   */
  strategy: AUTO_GENERATE_ATTRIBUTE_STRATEGY;

  /**
   * Defines whether the attribute values should be auto updated when any write operation occurs
   * happens (i.e updatedAt on entities)
   * @default false
   */
  autoUpdate?: boolean;

  /**
   * Defines whether the attribute should be hidden from response returned to client
   * @default false
   */
  hidden?: boolean;
}

export function AutoGenerateAttribute(
  options: AutoGeneratedAttributeOptions
): PropertyDecorator {
  return (target, propertyKey) => {
    const reflectedMetadata = Reflect.getMetadata(
      'design:type',
      target,
      propertyKey
    );

    if (!reflectedMetadata) {
      throw new MissingReflectMetadataError('design:type');
    }

    const attributeProps: AutoGenerateAttributeRawMetadataOptions = {
      name: propertyKey.toString(),
      type: reflectedMetadata.name,
      strategy: options.strategy,
      autoUpdate: options.autoUpdate,
      hidden: options.hidden,
    };

    if (options.strategy)
      MetadataManager.metadataStorage.addRawAttribute(
        target.constructor,
        attributeProps
      );
  };
}
