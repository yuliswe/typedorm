import {
  InvalidTransactionReadItemError,
  InvalidTransactionWriteItemError,
  TRANSFORM_TRANSACTION_TYPE,
} from 'packages/common';
import { DocumentClientTypes } from 'packages/document-client';
import { Connection } from 'packages/core/src/classes/connection/connection';
import {
  ReadTransaction,
  ReadTransactionItem,
} from 'packages/core/src/classes/transaction/read-transaction';
import {
  isTransactionAddCreateItem,
  isTransactionAddDeleteItem,
  isTransactionAddGetItem,
  isTransactionAddUpdateItem,
  isWriteTransactionItemList,
} from 'packages/core/src/classes/transaction/type-guards';
import {
  WriteTransaction,
  WriteTransactionItem,
} from 'packages/core/src/classes/transaction/write-transaction';
import { MetadataOptions } from 'packages/core/src/classes/transformer/base-transformer';
import {
  LazyTransactionWriteItemListLoader,
  isLazyTransactionWriteItemListLoader,
} from 'packages/core/src/classes/transformer/is-lazy-transaction-write-item-list-loader';
import { LowOrderTransformers } from 'packages/core/src/classes/transformer/low-order-transformers';
import { dropProp } from 'packages/core/src/helpers/drop-prop';

export class DocumentClientTransactionTransformer extends LowOrderTransformers {
  constructor(connection: Connection) {
    super(connection);
  }

  toDynamoWriteTransactionItems(
    writeTransaction: WriteTransaction,
    metadataOptions?: MetadataOptions
  ) {
    const { items } = writeTransaction;

    this.connection.logger.logTransformTransaction({
      requestId: metadataOptions?.requestId,
      operation: TRANSFORM_TRANSACTION_TYPE.TRANSACTION_WRITE,
      prefix: 'Before',
      body: items,
    });

    const transformed = this.innerTransformTransactionWriteItems(items);

    this.connection.logger.logTransformTransaction({
      requestId: metadataOptions?.requestId,
      operation: TRANSFORM_TRANSACTION_TYPE.TRANSACTION_WRITE,
      prefix: 'After',
      body: transformed,
    });
    return transformed;
  }

  toDynamoReadTransactionItems(
    readTransaction: ReadTransaction,
    metadataOptions?: MetadataOptions
  ) {
    const { items } = readTransaction;

    this.connection.logger.logTransformTransaction({
      requestId: metadataOptions?.requestId,
      operation: TRANSFORM_TRANSACTION_TYPE.TRANSACTION_READ,
      prefix: 'Before',
      body: items,
    });

    const transformed = this.innerTransformTransactionReadItems(items);

    this.connection.logger.logTransformTransaction({
      requestId: metadataOptions?.requestId,
      operation: TRANSFORM_TRANSACTION_TYPE.TRANSACTION_READ,
      prefix: 'After',
      body: transformed,
    });

    return transformed;
  }

  /**
   * Parse each item in the request to be in one of the following collections
   * - transactionItemList: items that must be processed in a transaction
   */
  private innerTransformTransactionReadItems(
    transactionItems: ReadTransactionItem<any, any>[],
    metadataOptions?: MetadataOptions
  ) {
    return transactionItems.reduce(
      (acc, transactionItem) => {
        if (isTransactionAddGetItem(transactionItem)) {
          const {
            get: { item, primaryKey, options },
          } = transactionItem;

          const dynamoGetItemInput = this.toDynamoGetItem(
            item,
            primaryKey,
            options,
            metadataOptions
          );

          acc.transactionItemList.push({
            Get: dynamoGetItemInput,
          });
        } else {
          throw new InvalidTransactionReadItemError(transactionItem);
        }
        return acc;
      },
      {
        transactionItemList: [] as DocumentClientTypes.TransactGetItemList,
      }
    );
  }

  /**
   * Parse each item in the request to be in one of the following collections
   * - transactionItemList: items that must be processed in a transaction
   * - lazyTransactionWriteItemListLoaderItems: items that are must be processed in transaction but also requires other requests to be made first (i.e delete of unique items)
   */
  private innerTransformTransactionWriteItems(
    transactionItems: WriteTransactionItem<any, any, any>[],
    metadataOptions?: MetadataOptions
  ) {
    return transactionItems.reduce(
      (acc, transactionItem) => {
        if (isTransactionAddCreateItem(transactionItem)) {
          const {
            create: { item, options },
          } = transactionItem;

          const dynamoPutItemInput = this.toDynamoPutItem(
            item,
            options,
            metadataOptions
          ); // update

          if (!isWriteTransactionItemList(dynamoPutItemInput)) {
            acc.transactionItemList.push({
              Put: dynamoPutItemInput,
            });
          } else {
            acc.transactionItemList.push(...dynamoPutItemInput);
          }
        } else if (isTransactionAddUpdateItem(transactionItem)) {
          const {
            update: { item, primaryKey, body, options },
          } = transactionItem;

          const dynamoUpdateItemInput = this.toDynamoUpdateItem(
            item,
            primaryKey,
            body,
            options,
            metadataOptions
          );
          if (!isLazyTransactionWriteItemListLoader(dynamoUpdateItemInput)) {
            acc.transactionItemList.push({
              Update: dropProp(
                dynamoUpdateItemInput,
                'ReturnValues'
              ) as DocumentClientTypes.Update,
            });
          } else {
            acc.lazyTransactionWriteItemListLoader.push(dynamoUpdateItemInput);
          }
        } else if (isTransactionAddDeleteItem(transactionItem)) {
          const {
            delete: { item, primaryKey, options },
          } = transactionItem;

          const dynamoDeleteItemInput = this.toDynamoDeleteItem(
            item,
            primaryKey,
            options,
            metadataOptions
          );
          if (!isLazyTransactionWriteItemListLoader(dynamoDeleteItemInput)) {
            acc.transactionItemList.push({
              Delete: dynamoDeleteItemInput,
            });
          } else {
            acc.lazyTransactionWriteItemListLoader.push(dynamoDeleteItemInput);
          }
        } else {
          throw new InvalidTransactionWriteItemError(transactionItem);
        }
        return acc;
      },
      {
        transactionItemList: [] as DocumentClientTypes.TransactWriteItemList,
        lazyTransactionWriteItemListLoader:
          [] as LazyTransactionWriteItemListLoader[],
      }
    );
  }
}
