import { TDAsset, TDToolType, TldrawApp, TldrawCommand } from '@tldraw/tldraw';
import debounce from 'lodash/debounce';
import { nanoid } from 'nanoid';
import { ActionType, TDCamera, TrawSnapshot, TRCamera, TRRecord, TRViewport } from 'types';
import createVanilla, { StoreApi } from 'zustand/vanilla';
import { DEFAULT_CAMERA, SLIDE_HEIGHT, SLIDE_RATIO, SLIDE_WIDTH } from '../constants';

import produce from 'immer';
import { CreateRecordsEvent, EventTypeHandlerMap, TrawEventHandler, TrawEventType } from 'state/events';
import create, { UseBoundStore } from 'zustand';
import { TrawAppOptions } from './TrawAppOptions';

export const convertCameraTRtoTD = (camera: TRCamera, viewport: TRViewport): TDCamera => {
  const ratio = viewport.width / viewport.height;
  if (ratio > SLIDE_RATIO) {
    // wider than slide
    const absoluteHeight = SLIDE_HEIGHT / camera.zoom;
    const zoom = viewport.height / absoluteHeight;
    return {
      point: [-camera.center.x + viewport.width / zoom / 2, -camera.center.y + viewport.height / zoom / 2],
      zoom,
    };
  } else {
    // taller than slide
    const absoluteWidth = SLIDE_WIDTH / camera.zoom;
    const zoom = viewport.width / absoluteWidth;
    return {
      point: [-camera.center.x + viewport.width / zoom / 2, -camera.center.y + viewport.height / zoom / 2],
      zoom: zoom,
    };
  }
};

export const convertCameraTDtoTR = (camera: TDCamera, viewport: TRViewport): TRCamera => {
  const ratio = viewport.width / viewport.height;
  if (ratio > SLIDE_RATIO) {
    // wider than slide
    const absoluteHeight = viewport.height / camera.zoom;
    const zoom = SLIDE_HEIGHT / absoluteHeight;
    return {
      center: {
        x: -camera.point[0] + viewport.width / camera.zoom / 2,
        y: -camera.point[1] + viewport.height / camera.zoom / 2,
      },
      zoom,
    };
  } else {
    // taller than slide
    const absoluteWidth = viewport.width / camera.zoom;
    const zoom = SLIDE_WIDTH / absoluteWidth;
    return {
      center: {
        x: -camera.point[0] + viewport.width / camera.zoom / 2,
        y: -camera.point[1] + viewport.height / camera.zoom / 2,
      },
      zoom: zoom,
    };
  }
};

export class TrawApp {
  /**
   * The Tldraw app. (https://tldraw.com)
   * This is used to create and edit slides.
   */
  app: TldrawApp;

  editorId: string;

  viewportSize = {
    width: 0,
    height: 0,
  };

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

  /**
   * A React hook for accessing the zustand store.
   */
  public readonly useStore: UseBoundStore<StoreApi<TrawSnapshot>>;

  /**
   * Handle asset creation. Preprocess the file and upload it to the remote. Should return the asset URL.
   *
   * @returns - The asset URL
   */
  public onAssetCreate?: (app: TldrawApp, file: File, id: string) => Promise<string | false>;

  constructor({ user, document, records = [] }: TrawAppOptions) {
    // dummy app
    this.app = new TldrawApp();

    this.editorId = user.id;

    const recordMap: Record<string, TRRecord> = {};
    records.forEach((record) => {
      recordMap[record.id] = record;
    });

    this._state = {
      viewport: {
        width: 0,
        height: 0,
      },
      camera: {
        [this.editorId]: {
          [this.app.appState.currentPageId]: DEFAULT_CAMERA,
        },
      },
      user,
      document,
      records: {},
    };
    this.store = createVanilla(() => this._state);

    this.useStore = create(this.store);
  }

  registerApp(app: TldrawApp) {
    app.callbacks = {
      onCommand: this.recordCommand,
      onAssetCreate: this.handleAssetCreate,
      onPatch: (app, patch, reason) => {
        if (reason === 'sync_camera') return;
        const pageStates = patch.document?.pageStates;
        const currentPageId = app.appState.currentPageId;
        if (pageStates && pageStates[currentPageId]) {
          const camera = pageStates[currentPageId]?.camera as TDCamera;
          if (camera) {
            this.handleCameraChange(camera);
          }
        }
      },
      // onSessionEnd: () => {
      //   console.log('Session ended');
      // },
      // onPatch: () => {
      //   console.log('onPatch');
      // },
    };

    this.app = app;
    this.applyRecordsFromFirst();
    this.emit(TrawEventType.TldrawAppChange, { tldrawApp: app });
  }

  updateViewportSize = (width: number, height: number) => {
    this.store.setState((state) => {
      return {
        ...state,
        viewport: {
          width,
          height,
        },
      };
    });
    this.syncCamera();
  };

  syncCamera = () => {
    const currentPageId = this.app.appState.currentPageId;
    const { viewport, camera } = this.store.getState();
    const trCamera = camera[this.editorId][currentPageId];
    if (!trCamera) return;

    const tdCamera = convertCameraTRtoTD(trCamera, viewport);
    this.app.setCamera(tdCamera.point, tdCamera.zoom, 'sync_camera');
  };

  getCamera = (slideId: string) => {
    const { camera } = this.store.getState();
    return camera[this.editorId][slideId];
  };

  handleCameraChange = (camera: TDCamera) => {
    const trawCamera = convertCameraTDtoTR(camera, this.store.getState().viewport);
    const currentPageId = this.app.appState.currentPageId;

    this.store.setState(
      produce((state) => {
        state.camera[this.editorId][currentPageId] = trawCamera;
      }),
    );

    if (this._actionStartTime === 0) {
      this._actionStartTime = Date.now();
    }
    this.handleCameraRecord(trawCamera);
  };

  handleCameraRecord = debounce((camera: TRCamera) => {
    const currentPageId = this.app.appState.currentPageId;
    // create record
    const record: TRRecord = {
      id: nanoid(),
      type: 'zoom',
      slideId: currentPageId,
      start: this._actionStartTime || Date.now(),
      end: Date.now(),
      user: this.editorId,
      data: {
        camera,
      },
      origin: '',
    };

    const createRecordsEvent: CreateRecordsEvent = {
      tldrawApp: this.app,
      records: [record],
    };
    this.emit(TrawEventType.CreateRecords, createRecordsEvent);
    this.store.setState(
      produce((state) => {
        state.records[record.id] = record;
      }),
    );
  }, 400);

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

  private recordCommand = (app: TldrawApp, command: TldrawCommand) => {
    const user = this.store.getState().user;
    const document = this.store.getState().document;
    const records: TRRecord[] = [];
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

        const shapes = command.after.document.pages[pageId]?.shapes;
        if (!shapes) break;

        const assetIds = Object.values(shapes)
          .map((shape) => shape?.assetId)
          .filter((assetId: string | undefined): assetId is string => !!assetId);

        const assets = app.assets
          .filter((asset) => assetIds.includes(asset.id))
          .reduce<{ [key: string]: TDAsset }>((acc, asset) => {
            acc[asset.id] = asset;
            return acc;
          }, {});

        records.push({
          type: command.id as ActionType,
          id: nanoid(),
          user: user.id,
          data: {
            shapes,
            assets,
          },
          slideId: pageId,
          start: this._actionStartTime || new Date().getTime(),
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

    this.store.setState(
      produce((state) => {
        records.forEach((record) => {
          state.records[record.id] = record;
        });
      }),
    );
    this._actionStartTime = 0;
  };

  addRecords = (records: TRRecord[]) => {
    records = records.sort((a, b) => a.start - b.start);
    const newRecords = records.filter((record) => !this.store.getState().records[record.id]);
    this.store.setState(
      produce((state) => {
        newRecords.forEach((record) => {
          state.records[record.id] = record;
        });
      }),
    );
    this.applyRecords(newRecords);
  };

  applyRecordsFromFirst = () => {
    const records = Object.values(this.store.getState().records).sort((a, b) => a.start - b.start);
    this.applyRecords(records);
  };

  applyRecords = (records: TRRecord[]) => {
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
          this.store.setState(
            produce((state) => {
              state.camera[record.user][record.data.id] = DEFAULT_CAMERA;
              state.camera[this.editorId][record.data.id] = DEFAULT_CAMERA;
            }),
          );
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
        case 'zoom':
          if (!record.slideId) break;
          this.store.setState(
            produce((state) => {
              state.camera[record.user][record.slideId || ''] = record.data.camera;
            }),
          );
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

  // setCamera = (camera: TDCamera, slideId: string) => {};

  createSlide = () => {
    const pageId = nanoid();
    this.store.setState(
      produce((state) => {
        state.camera[this.editorId][pageId] = DEFAULT_CAMERA;
      }),
    );
    this.app.createPage(pageId);
    this.syncCamera();
  };

  deleteSlide = () => {
    this.app.deletePage();
  };

  selectSlide = (id: string) => {
    this.app.changePage(id);
    this.syncCamera();
  };

  private handleAssetCreate = async (app: TldrawApp, file: File, id: string): Promise<string | false> => {
    if (this.onAssetCreate) {
      return await this.onAssetCreate(app, file, id);
    }
    return false;
  };

  /*
   * Event handlers
   */
  on<K extends TrawEventType>(eventType: K, handler: EventTypeHandlerMap[K]) {
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

  private emit<K extends keyof EventTypeHandlerMap>(eventType: K, event: Parameters<EventTypeHandlerMap[K]>[0]) {
    const handlers = this.eventHandlersMap.get(eventType) || [];
    handlers.forEach((h: TrawEventHandler) => h(event as any));
  }
}
