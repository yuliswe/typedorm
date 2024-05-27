import { Connection } from 'src/core/classes/connection/connection';

export abstract class BaseMetadata {
  constructor(public connection: Connection) {}
}
