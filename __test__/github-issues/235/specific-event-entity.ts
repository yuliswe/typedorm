import { Attribute, Entity, INDEX_TYPE } from 'packages/common';

export const ProductPrefix = 'PRD';
export const EventPrefix = 'EVT';

@Entity({
  name: 'Product',
  primaryKey: {
    partitionKey: 'ID#{{id}}',
    sortKey: ProductPrefix,
  },
  indexes: {
    GSI1: {
      partitionKey: `${EventPrefix}#{{eventId}}`,
      sortKey: `${ProductPrefix}#{{id}}`,
      type: INDEX_TYPE.GSI,
    },
  },
})
export class ProductEntity {
  @Attribute({
    default: (entity: ProductEntity) => entity.id,
  })
  id: string;

  @Attribute()
  eventId: string;

  @Attribute()
  title: string;
}
