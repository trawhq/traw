import { Record } from 'types';
import { TldrawApp } from '@tldraw/tldraw';

export interface TrawBaseEvent {
  tldrawApp: TldrawApp;
}

/**
 * Event for newly created records
 *
 * Records added by TrawApp.addRecords will not trigger this event
 */
export interface CreateRecordsEvent extends TrawBaseEvent {
  records: Record[];
}

export type CreateRecordsHandler = (event: CreateRecordsEvent) => void;

/**
 * Traw Event Types
 */
export enum TrawEventType {
  CreateRecords = 'createRecords',
}

/**
 * Map of event types to their handlers
 */
export interface EventTypeHandlerMap {
  [TrawEventType.CreateRecords]: CreateRecordsHandler;
}

/**
 * Union type of event handlers
 */
export type TrawEventHandler = CreateRecordsHandler;
