import {
  AutoGenerateAttributeRawMetadataOptions,
  EntityRawMetadataOptions,
  IsAutoGenerateAttributeRawMetadataOptions,
  MetadataManager,
  Table,
} from 'packages/common';
import { isUsedForPrimaryKey } from 'packages/core/src/helpers/is-used-for-primary-key';
import { AttributeMetadata } from 'packages/core/src/classes/metadata/attribute-metadata';
import { AutoGeneratedAttributeMetadata } from 'packages/core/src/classes/metadata/auto-generated-attribute-metadata';

export class AttributesMetadataBuilder {
  constructor() {}

  build(
    table: Table,
    attributeTargetEntityClass: Function,
    decoratedEntityClass: Function
  ) {
    const getRawAttributesForEntity =
      MetadataManager.metadataStorage.getRawAttributesForEntity(
        attributeTargetEntityClass
      );

    return getRawAttributesForEntity.map(attr => {
      const entityMetadata = this.tryGetEntityMetadata(
        attributeTargetEntityClass,
        decoratedEntityClass
      );

      if (IsAutoGenerateAttributeRawMetadataOptions(attr)) {
        return this.validateAndBuildAutoGeneratedAttributeMetadata(
          attr,
          entityMetadata
        );
      }

      return new AttributeMetadata({
        table,
        // when working with entity with multiple inheritance, use class with @Entity() if available
        entityClass: decoratedEntityClass ?? attributeTargetEntityClass,
        ...attr,
      });
    });
  }

  private validateAndBuildAutoGeneratedAttributeMetadata(
    attr: AutoGenerateAttributeRawMetadataOptions,
    entityMetadata: EntityRawMetadataOptions
  ) {
    if (attr.autoUpdate) {
      if (isUsedForPrimaryKey(entityMetadata.primaryKey, attr.name)) {
        throw new Error(
          `Failed to build metadata for "${attr.name}", attributes referenced in primary key cannot be auto updated.`
        );
      }
    }

    return new AutoGeneratedAttributeMetadata({
      ...attr,
    });
  }

  private tryGetEntityMetadata(
    attributeTargetEntityClass: Function,
    decoratedEntityClass: Function
  ) {
    let entityMetadata: EntityRawMetadataOptions;

    try {
      // check if attribute target entity has metadata
      entityMetadata = MetadataManager.metadataStorage.getRawEntityByTarget(
        attributeTargetEntityClass
      );
    } catch (err) {
      // fall back to using derived class metadata
      entityMetadata =
        MetadataManager.metadataStorage.getRawEntityByTarget(
          decoratedEntityClass
        );
    }

    return entityMetadata;
  }
}
