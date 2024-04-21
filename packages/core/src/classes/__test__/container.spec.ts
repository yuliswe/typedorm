import { Container } from 'packages/core/src/classes/container';
import { ConnectionManager } from 'packages/core/src/classes/connection/connection-manager';

test('returns default connection', () => {
  const connectionInstance = Container.get(ConnectionManager);
  expect(connectionInstance instanceof ConnectionManager).toBeTruthy();
});
