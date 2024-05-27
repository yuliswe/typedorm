import { EntityTarget } from 'src/common';
import { DocumentClientTypes } from 'src/document-client';

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
