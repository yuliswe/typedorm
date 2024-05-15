import { DocumentClientV3 } from '@typedorm/document-client';
import { Connection } from 'packages/core/src/classes/connection/connection';

test('correctly instantiates documentClient v3', () => {
  const connection = new Connection({ entities: [] }, () => {});

  const { documentClient } = connection;
  expect(documentClient).toBeInstanceOf(DocumentClientV3);
});
