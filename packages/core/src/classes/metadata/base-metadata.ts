import { Connection } from 'packages/core/src/classes/connection/connection';

export abstract class BaseMetadata {
  constructor(public connection: Connection) {}
}
