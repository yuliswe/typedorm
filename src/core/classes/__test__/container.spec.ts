import { ConnectionManager } from 'src/core/classes/connection/connection-manager';
import { Container } from 'src/core/classes/container';

test('returns default connection', () => {
  const connectionInstance = Container.get(ConnectionManager);
  expect(connectionInstance instanceof ConnectionManager).toBeTruthy();
});
