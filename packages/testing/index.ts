import { Replace } from 'packages/common';
import {
  createConnection,
  ConnectionOptions,
  Container,
  ConnectionManager,
} from 'packages/core';
import { DocumentClient } from 'packages/document-client';

export function createTestConnection<T = any>(
  connectionOptions: Replace<
    ConnectionOptions,
    'documentClient',
    {
      documentClient?:
        | {
            [key in keyof DocumentClient]?: jest.SpyInstance;
          }
        | T;
    }
  >
) {
  return createConnection(connectionOptions as ConnectionOptions);
}

export function resetTestConnection() {
  Container.get(ConnectionManager).clear();
}
