import { Connection } from 'packages/core/classes/connection/connection';
import { DocumentClientV3 } from 'packages/document-client';

test('correctly instantiates documentClient v3', () => {
  const connection = new Connection({ entities: [] }, () => {});

  const { documentClient } = connection;
  expect(documentClient).toBeInstanceOf(DocumentClientV3);
});
