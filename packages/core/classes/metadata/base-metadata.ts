import { Connection } from 'packages/core/classes/connection/connection';

export abstract class BaseMetadata {
  constructor(public connection: Connection) {}
}
