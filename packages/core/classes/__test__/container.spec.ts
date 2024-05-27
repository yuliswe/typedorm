import { ConnectionManager } from 'packages/core/classes/connection/connection-manager';
import { Container } from 'packages/core/classes/container';

test('returns default connection', () => {
  const connectionInstance = Container.get(ConnectionManager);
  expect(connectionInstance instanceof ConnectionManager).toBeTruthy();
});
