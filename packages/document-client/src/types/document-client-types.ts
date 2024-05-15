import DynamoDBClientV3 from '@aws-sdk/client-dynamodb';
import type {
  BatchGetCommandInput,
  BatchGetCommandOutput,
  BatchWriteCommandInput,
  BatchWriteCommandOutput,
  DeleteCommandInput,
  DeleteCommandOutput,
  GetCommandInput,
  GetCommandOutput,
  NativeAttributeValue,
  PutCommandInput,
  PutCommandOutput,
  QueryCommandInput,
  QueryCommandOutput,
  ScanCommandInput,
  ScanCommandOutput,
  TransactGetCommandInput,
  TransactGetCommandOutput,
  TransactWriteCommandInput,
  TransactWriteCommandOutput,
  UpdateCommandInput,
  UpdateCommandOutput,
} from '@aws-sdk/lib-dynamodb';

/* eslint-disable @typescript-eslint/no-namespace */

type Replace<T, K extends keyof T, R> = Omit<T, K> & { [k in K]: R };

type ReplaceAndExcludeUndefined<T, K extends keyof T, R> = Replace<
  T,
  K,
  Exclude<R, undefined>
>;

type RemoveUndefined<T, K extends keyof T> = Replace<
  T,
  K,
  Exclude<T[K], undefined>
>;

type RemoveUndefined2<
  T,
  K extends keyof T,
  S extends keyof Exclude<T[K], undefined> & keyof T[K],
> = Replace<T, K, RemoveUndefined<T[K], S>>;

type DeepExpand<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: DeepExpand<O[K]> }
    : never
  : T;

export namespace DocumentClientTypes {
  /**
   * General
   */
  export type Key = {
    [key: string]: any;
  };

  export type AttributeMap = { [key: string]: any };

  export type ItemList = AttributeMap[];

  export type WriteRequest = DynamoDBClientV3.WriteRequest;

  export type ItemResponse = DynamoDBClientV3.ItemResponse;

  export type ItemResponseList = ItemResponse[];

  /**
   * Put
   */
  export type PutItemInput = RemoveUndefined<PutCommandInput, 'Item'>;

  export type PutItemOutput = PutCommandOutput;

  /**
   * Get
   */
  export type GetItemInput = RemoveUndefined<GetCommandInput, 'Key'>;

  export type GetItemOutput = GetCommandOutput;

  /**
   * Update
   */
  export type Update = TransactWriteItem['Update'];

  export type UpdateItemInput = RemoveUndefined<UpdateCommandInput, 'Key'>;

  export type UpdateItemOutput = UpdateCommandOutput;

  /**
   * Delete
   */
  export type DeleteItemInput = RemoveUndefined<DeleteCommandInput, 'Key'>;

  export type DeleteItemOutput = DeleteCommandOutput;

  /**
   * Query
   */
  export type QueryInput = QueryCommandInput;

  export type QueryOutput = QueryCommandOutput;

  /**
   * BatchWrite
   */
  export type BatchWriteItemRequestMap = {
    [key: string]: NativeAttributeValue;
  };

  export type BatchWriteItemRequestMapList = BatchWriteItemRequestMap[];

  export type BatchWriteItemInput = RemoveUndefined<
    BatchWriteCommandInput,
    'RequestItems'
  >;

  export type BatchWriteItemOutput = BatchWriteCommandOutput;

  export type BatchWriteItemOutputList = BatchWriteItemOutput[];

  /**
   * BatchGet
   */
  export type BatchGetRequestMap = {
    [key: string]: NativeAttributeValue;
    // & {
    //   // This fixes the type error from the original package? Why would Keys be
    //   // null-able?
    //   Keys: Record<string, DynamoDBClientV3.AttributeValue>[];
    // };
  };

  export type BatchGetRequestMapList = BatchGetRequestMap[];

  export type BatchGetItemInput = RemoveUndefined<
    BatchGetCommandInput,
    'RequestItems'
  >;

  export type BatchGetItemOutput = BatchGetCommandOutput;

  export type BatchGetItemOutputList = BatchGetItemOutput[];

  export type BatchGetResponseMap = { [key: string]: ItemList };

  /**
   * TransactWrite
   */
  type _TransactWriteItem = Exclude<
    TransactWriteCommandInput['TransactItems'],
    undefined
  >[0];
  export type TransactWriteItem = DeepExpand<
    Omit<_TransactWriteItem, 'ConditionCheck' | 'Delete' | 'Update' | 'Put'> & {
      ConditionCheck?: Omit<
        Exclude<_TransactWriteItem['ConditionCheck'], undefined>,
        'Key'
      > & {
        Key: Exclude<
          Exclude<_TransactWriteItem['ConditionCheck'], undefined>['Key'],
          undefined
        >;
      };
      Put?: Omit<Exclude<_TransactWriteItem['Put'], undefined>, 'Item'> & {
        Item: Exclude<
          Exclude<_TransactWriteItem['Put'], undefined>['Item'],
          undefined
        >;
      };
      Delete?: Omit<Exclude<_TransactWriteItem['Delete'], undefined>, 'Key'> & {
        Key: Exclude<
          Exclude<_TransactWriteItem['Delete'], undefined>['Key'],
          undefined
        >;
      };
      Update?: Omit<Exclude<_TransactWriteItem['Update'], undefined>, 'Key'> & {
        Key: Exclude<
          Exclude<_TransactWriteItem['Update'], undefined>['Key'],
          undefined
        >;
      };
    }
  >;

  export type TransactWriteItemList = TransactWriteItem[];

  export type TransactWriteItemInput = DeepExpand<
    Replace<TransactWriteCommandInput, 'TransactItems', TransactWriteItemList>
  >;

  export type TransactWriteItemOutput = TransactWriteCommandOutput;

  /**
   * TransactGet
   */
  type _TransactGetItem = Exclude<
    Exclude<TransactGetCommandInput['TransactItems'], undefined>[0],
    undefined
  >;
  export type TransactGetItem = Omit<_TransactGetItem, 'Get'> & {
    Get: Omit<Exclude<_TransactGetItem['Get'], undefined>, 'Key'> & {
      Key: Exclude<
        Exclude<_TransactGetItem['Get'], undefined>['Key'],
        undefined
      >;
    };
  };

  export type TransactGetItemList = TransactGetItem[];

  export type TransactGetItemInput = DeepExpand<
    Replace<TransactGetCommandInput, 'TransactItems', TransactGetItemList>
  >;

  export type TransactGetItemOutput = TransactGetCommandOutput;

  /**
   * Scan
   */
  export type ScanInput = ScanCommandInput;

  export type ScanOutput = ScanCommandOutput;
}
