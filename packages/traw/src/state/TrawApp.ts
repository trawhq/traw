import { TDSnapshot, TDToolType, TldrawApp, TldrawCommand } from '@tldraw/tldraw';
import createVanilla, { StoreApi } from 'zustand/vanilla';
import { migrateRecords } from 'components/utils/migrate';
import { ActionType, Record, TrawSnapshot } from 'types';
import { CreateRecordsEvent, EventTypeHandlerMap, TrawEventHandler, TrawEventType } from 'state/events';
import { nanoid } from 'nanoid';
import { TrawAppOptions } from 'state/TrawAppOptions';

export class TrawApp {
  /**
   * The Tldraw app. (https://tldraw.com)
   * This is used to create and edit slides.
   */
  app: TldrawApp;

  /**
   * A zustand store that also holds the state.
   */
  private store: StoreApi<TrawSnapshot>;

  /**
   * The current state.
   */
  private _state: TrawSnapshot;

  /**
   * Event handlers
   * @private
   */
  private eventHandlersMap = new Map<TrawEventType, TrawEventHandler[]>();

  /**
   * The time the current action started.
   * This is used to calculate the duration of the record.
   */
  private _actionStartTime: number | undefined;

  constructor({ user, document, records = [] }: TrawAppOptions) {
    // dummy app
    this.app = new TldrawApp();

    this._state = {
      user,
      document,
      records,
    };
    this.store = createVanilla(() => this._state);
  }

  registerApp(app: TldrawApp) {
    app.callbacks = {
      onCommand: this.recordCommand,
      // onSessionEnd: () => {
      //   console.log('Session ended');
      // },
      // onPatch: () => {
      //   console.log('onPatch');
      // },
    };

    this.app = app;
  }

  selectTool(tool: TDToolType) {
    this.app.selectTool(tool);
  }

  useSlidesStore() {
    return this.app.useStore();
  }

  useTldrawApp() {
    return this.app;
  }

  setActionStartTime = () => {
    this._actionStartTime = Date.now();
  };

  // private handleZoom = (state: TDSnapshot) => {};

  private recordCommand = (state: TDSnapshot, command: TldrawCommand) => {
    const user = this.store.getState().user;
    const document = this.store.getState().document;
    const records: Record[] = [];
    console.log(command);
    switch (command.id) {
      case 'change_page':
        if (command.after.appState)
          records.push({
            type: command.id,
            id: nanoid(),
            user: user.id,
            data: {
              id: command.after.appState.currentPageId,
            },
            start: this._actionStartTime ? this._actionStartTime : 0,
            end: Date.now(),
            origin: document.id,
          });
        break;
      case 'create_page': {
        if (!command.after.document || !command.after.document.pages) break;
        const pageId = Object.keys(command.after.document.pages)[0];
        records.push({
          type: command.id,
          id: nanoid(),
          user: user.id,
          data: {
            id: pageId,
          },
          start: Date.now() - 1, // Create page must be before select page
          end: Date.now() - 1,
          origin: document.id,
        });
        records.push({
          type: 'change_page',
          id: nanoid(),
          user: user.id,
          data: {
            id: pageId,
          },
          start: Date.now(),
          end: Date.now(),
          origin: document.id,
        });
        break;
      }
      case 'delete_page':
        break;
      default: {
        if (!command.after.document || !command.after.document.pages) break;
        const pageId = Object.keys(command.after.document.pages)[0];

        records.push({
          type: command.id as ActionType,
          id: nanoid(),
          user: user.id,
          data: command.after.document.pages[pageId],
          slideId: pageId,
          start: this._actionStartTime ? this._actionStartTime : 0,
          end: Date.now(),
          origin: document.id,
        });
        break;
      }
    }

    if (!records.length) return;

    const createRecordsEvent: CreateRecordsEvent = {
      tldrawApp: this.app,
      records,
    };
    this.emit(TrawEventType.CreateRecords, createRecordsEvent);

    this.store.setState((state) => {
      return {
        ...state,
        records: [...state.records, ...records],
      };
    });
    this._actionStartTime = 0;
  };

  addRecords = (records: Record[]) => {
    records = migrateRecords(records);

    records.forEach((record) => {
      switch (record.type) {
        case 'create_page':
          this.app.patchState({
            document: {
              pageStates: {
                [record.data.id]: {
                  id: record.data.id,
                  selectedIds: [],
                  camera: { point: [0, 0], zoom: 1 },
                },
              },
              pages: {
                [record.data.id]: {
                  id: record.data.id,
                  name: 'Page',
                  childIndex: 2,
                  shapes: {},
                  bindings: {},
                },
              },
            },
          });
          break;
        case 'change_page':
          this.app.patchState({
            appState: {
              currentPageId: record.data.id,
            },
          });
          break;
        case 'delete_page':
          this.app.patchState({
            document: {
              pageStates: {
                [record.data.id]: undefined,
              },
              pages: {
                [record.data.id]: undefined,
              },
            },
          });
          break;
        default: {
          const { data, slideId } = record;
          if (!slideId) break;
          this.app.patchState({
            document: {
              pages: {
                [slideId]: {
                  shapes: {
                    ...data.shapes,
                  },
                },
              },
              assets: {
                ...data.assets,
              },
            },
          });
          break;
        }
      }
    });
  };

  createSlide = () => {
    this.app.createPage();
  };

  deleteSlide = () => {
    this.app.deletePage();
  };

  selectSlide = (id: string) => {
    this.app.changePage(id);
  };

  /*
   * Event handlers
   */
  on<K extends keyof EventTypeHandlerMap>(eventType: K, handler: EventTypeHandlerMap[K]) {
    const handlers = this.eventHandlersMap.get(eventType) || [];
    handlers.push(handler);
    this.eventHandlersMap.set(eventType, handlers);
  }

  off<K extends keyof EventTypeHandlerMap>(eventType: K, handler: EventTypeHandlerMap[K]) {
    const handlers = this.eventHandlersMap.get(eventType) || [];
    this.eventHandlersMap.set(
      eventType,
      handlers.filter((h: TrawEventHandler) => h !== handler),
    );
  }

  emit<K extends keyof EventTypeHandlerMap>(eventType: K, event: Parameters<EventTypeHandlerMap[K]>[0]) {
    const handlers = this.eventHandlersMap.get(eventType) || [];
    handlers.forEach((h: TrawEventHandler) => h(event));
  }
}
