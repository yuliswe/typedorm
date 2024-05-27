import { Replace } from 'src/common';
import {
  ConnectionManager,
  ConnectionOptions,
  Container,
  createConnection,
} from 'src/core';
import { DocumentClient } from 'src/document-client';

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
