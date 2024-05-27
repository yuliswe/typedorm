import {
  TransactionCanceledException,
  type DynamoDBClient,
} from '@aws-sdk/client-dynamodb';
import {
  BatchGetCommand,
  BatchWriteCommand,
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  TransactGetCommand,
  TransactWriteCommand,
  TranslateConfig,
  UpdateCommand,
  type BatchGetCommandInput,
  type BatchWriteCommandInput,
  type DeleteCommandInput,
  type GetCommandInput,
  type PutCommandInput,
  type QueryCommandInput,
  type ScanCommandInput,
  type UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { isEmptyObject } from 'packages/common';
import type { DocumentClientTypes } from 'packages/document-client';
import { DocumentClient } from 'packages/document-client/src/classes/base-document-client';
import { DEFAULT_TRANSLATE_CONFIG_V3 } from 'packages/document-client/src/constants/translate-config';
import { TransactionCancelledException } from 'packages/document-client/src/exceptions';

export class DocumentClientV3<
  DynamoDBDocumentClientType extends
    DynamoDBDocumentClient = DynamoDBDocumentClient,
> implements DocumentClient
{
  readonly documentClient: DynamoDBDocumentClientType;
  readonly version = 3;

  constructor(
    dynamoDBClient: DynamoDBClient,
    customTranslateConfig?: TranslateConfig
  ) {
    const translateConfig = {
      marshallOptions:
        (customTranslateConfig &&
          !isEmptyObject(customTranslateConfig.marshallOptions) && {
            ...DEFAULT_TRANSLATE_CONFIG_V3.marshallOptions,
            ...customTranslateConfig.marshallOptions,
          }) ||
        DEFAULT_TRANSLATE_CONFIG_V3.marshallOptions,
      unmarshallOptions:
        (customTranslateConfig &&
          !isEmptyObject(customTranslateConfig.marshallOptions) && {
            ...DEFAULT_TRANSLATE_CONFIG_V3.unmarshallOptions,
            ...customTranslateConfig.unmarshallOptions,
          }) ||
        DEFAULT_TRANSLATE_CONFIG_V3.unmarshallOptions,
    };

    this.documentClient = DynamoDBDocumentClient.from(
      dynamoDBClient,
      translateConfig
    ) as DynamoDBDocumentClientType;
  }

  async put(input: PutCommandInput) {
    return this.documentClient.send(new PutCommand(input));
  }

  async get(input: GetCommandInput) {
    return this.documentClient.send(new GetCommand(input));
  }

  async query(input: QueryCommandInput) {
    return this.documentClient.send(new QueryCommand(input));
  }

  async update(input: UpdateCommandInput) {
    return this.documentClient.send(new UpdateCommand(input));
  }

  async delete(input: DeleteCommandInput) {
    return this.documentClient.send(new DeleteCommand(input));
  }

  async batchWrite(input: BatchWriteCommandInput) {
    return this.documentClient.send(new BatchWriteCommand(input));
  }

  async batchGet(input: BatchGetCommandInput) {
    return this.documentClient.send(new BatchGetCommand(input));
  }

  async transactGet(input: DocumentClientTypes.TransactGetItemInput) {
    return this.documentClient.send(new TransactGetCommand(input));
  }

  async transactWrite(input: DocumentClientTypes.TransactWriteItemInput) {
    try {
      const response = await this.documentClient.send(
        new TransactWriteCommand(input)
      );
      return response;
    } catch (err) {
      if (err instanceof TransactionCanceledException) {
        // Remap TransactionCanceledException to unified TransactionCancelledException
        throw new TransactionCancelledException(
          err.Message || err.message,
          err.CancellationReasons?.map(reason => ({
            code: reason.Code,
            message: reason.Message,
            item: reason.Item,
          })) || []
        );
      }
      throw err;
    }
  }

  async scan(input: ScanCommandInput) {
    return this.documentClient.send(new ScanCommand(input));
  }
}
