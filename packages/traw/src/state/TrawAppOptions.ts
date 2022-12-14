import { Record, TrawDocument, TrawUser } from 'types';

export interface TrawAppOptions {
  /**
   * User
   */
  user: TrawUser;

  /**
   * Document
   */
  document: TrawDocument;

  /**
   * Initial records
   */
  records?: Record[];
}
