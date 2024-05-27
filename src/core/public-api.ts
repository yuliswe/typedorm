import { ConnectionManager } from 'src/core/classes/connection/connection-manager';
import { ConnectionOptions } from 'src/core/classes/connection/connection-options';
import { Container } from 'src/core/classes/container';

// options
export * from 'src/core/classes/connection/connection-options';

// models
export * from 'src/core/classes/batch/read-batch';
export * from 'src/core/classes/batch/write-batch';
export * from 'src/core/classes/expression/condition';
export * from 'src/core/classes/expression/key-condition';
export * from 'src/core/classes/transaction/read-transaction';
export * from 'src/core/classes/transaction/write-transaction';

// managers
export * from 'src/core/classes/manager/batch-manager';
export * from 'src/core/classes/manager/entity-manager';
export * from 'src/core/classes/manager/scan-manager';
export * from 'src/core/classes/manager/transaction-manager';

// classes
export { Connection } from 'src/core/classes/connection/connection';

// helpers
export { AutoGenerateAttributeValue } from 'src/core/helpers/auto-generate-attribute-value';

// public method exports

export function createConnection(options: ConnectionOptions) {
  const connection = connectionManager().create(options);

  const connected = connection.connect();

  if (!connected) {
    throw new Error(
      `Failed to create connection with options: ${JSON.stringify(options)}`
    );
  }

  return connected;
}

export function createConnections(optionsList: ConnectionOptions[]) {
  return optionsList.map(options => createConnection(options));
}

export function getConnection(connectionName?: string) {
  return connectionManager().get(connectionName);
}

export function getEntityManager(connectionName?: string) {
  return connectionManager().get(connectionName).entityManager;
}

export function getTransactionManger(connectionName?: string) {
  return connectionManager().get(connectionName).transactionManger;
}

export function getBatchManager(connectionName?: string) {
  return connectionManager().get(connectionName).batchManager;
}

export function getScanManager(connectionName?: string) {
  return connectionManager().get(connectionName).scanManager;
}

// private methods

function connectionManager() {
  return Container.get(ConnectionManager);
}
