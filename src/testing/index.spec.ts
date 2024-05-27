import {
  BatchManager,
  EntityManager,
  ScanManager,
  TransactionManager,
  getBatchManager,
  getEntityManager,
  getScanManager,
  getTransactionManger,
} from 'src/core';
import { createTestConnection, resetTestConnection } from 'src/testing/index';

beforeEach(() => {
  createTestConnection({
    entities: [],
    documentClient: {},
  });
});

afterEach(() => {
  resetTestConnection();
});

test('gets entity manager', () => {
  const entityManager = getEntityManager();
  expect(entityManager).toBeInstanceOf(EntityManager);
});

test('gets transaction manager', () => {
  const transactionManager = getTransactionManger();
  expect(transactionManager).toBeInstanceOf(TransactionManager);
});

test('gets batch manager', () => {
  const batchManager = getBatchManager();
  expect(batchManager).toBeInstanceOf(BatchManager);
});

test('gets scan manager', () => {
  const scanManager = getScanManager();
  expect(scanManager).toBeInstanceOf(ScanManager);
});
