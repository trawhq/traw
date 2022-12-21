import { TRRecord } from 'types';
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
  records: TRRecord[];
}

export type CreateRecordsHandler = (event: CreateRecordsEvent) => void;

/**
 * Event triggered when TldrawApp is changed.
 */
export type TldrawAppChangeEvent = TrawBaseEvent;

export type TldrawAppChangeHandler = (event: TldrawAppChangeEvent) => void;

export interface PointerMoveEvent extends TrawBaseEvent {
  x: number;
  y: number;
}

export type PointerMoveHandler = (event: PointerMoveEvent) => void;

/**
 * Traw Event Types
 */
export enum TrawEventType {
  CreateRecords = 'createRecords',
  TldrawAppChange = 'tldrawAppChange',
  PointerMove = 'pointerMove',
}

/**
 * Map of event types to their handlers
 */
export interface EventTypeHandlerMap {
  [TrawEventType.CreateRecords]: CreateRecordsHandler;
  [TrawEventType.TldrawAppChange]: TldrawAppChangeHandler;
  [TrawEventType.PointerMove]: PointerMoveHandler;
}

/**
 * Union type of event handlers
 */
export type TrawEventHandler = CreateRecordsHandler | TldrawAppChangeHandler | PointerMoveHandler;
