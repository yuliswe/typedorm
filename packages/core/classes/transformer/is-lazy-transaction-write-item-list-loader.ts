import { EntityTarget } from 'packages/common';
import { DocumentClientTypes } from 'packages/document-client';

export type LazyTransactionWriteItemListLoader = {
  lazyLoadTransactionWriteItems: (
    previousItemBody: any
  ) => DocumentClientTypes.TransactWriteItemList;
  entityClass: EntityTarget<any>;
  primaryKeyAttributes: any;
};

export const isLazyTransactionWriteItemListLoader = (
  response: any
): response is LazyTransactionWriteItemListLoader =>
  !!(
    (response as LazyTransactionWriteItemListLoader)
      .lazyLoadTransactionWriteItems &&
    typeof (response as LazyTransactionWriteItemListLoader)
      .lazyLoadTransactionWriteItems === 'function'
  );
