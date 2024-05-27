import { MissingReflectMetadataError } from 'packages/common/error';
import { MetadataManager } from 'packages/common/metadata/metadata-manager';
import {
  AttributeRawMetadataOptions,
  PrimaryKey,
} from 'packages/common/metadata/metadata-storage';
import 'reflect-metadata';

export type AttributeOptionsUniqueType<Entity = any> =
  | boolean
  | PrimaryKey<Entity>;

export interface AttributeOptions<Entity> {
  /**
   * Item will be managed using transaction to ensure it's consistency
   * When value of unique is of type boolean, entity name is used to auto generated unique prefix
   * @default false
   *
   */
  unique?: AttributeOptionsUniqueType<Entity>;
  /**
   * Mark property as enum
   * @required when property of type enum is referenced in key
   * @default false
   */
  isEnum?: boolean;
  /**
   * Assign default value to attribute
   */
  default?: any | ((entity: Entity) => any);
  /**
   * Defines whether the attribute should be hidden from response returned to client
   * @default false
   */
  hidden?: boolean;
  /**
   * Defines a function to generate value for attribute whenever the entity is updated
   */
  autoUpdate?: (entity: Entity) => any;
}

export function Attribute<Entity = any>(
  options?: AttributeOptions<Entity>
): PropertyDecorator {
  return (target, propertyKey): void => {
    const reflectedMetadata = Reflect.getMetadata(
      'design:type',
      target,
      propertyKey
    );

    if (!reflectedMetadata) {
      throw new MissingReflectMetadataError('design:type');
    }

    let type = reflectedMetadata.name;

    if (options?.isEnum) {
      // default to "String" when attribute is marked as enum
      type = 'String';
    }

    const attributeProps = {
      name: propertyKey.toString(),
      type,
      unique: options?.unique,
      default: options?.default,
      hidden: options?.hidden,
    } as AttributeRawMetadataOptions;

    MetadataManager.metadataStorage.addRawAttribute(
      target.constructor,
      attributeProps
    );
  };
}
