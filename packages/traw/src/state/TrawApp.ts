import { TDSnapshot, TDToolType, TldrawApp, TldrawCommand } from '@tldraw/tldraw';
import createVanilla, { StoreApi } from 'zustand/vanilla';
import { migrateRecords } from 'components/utils/migrate';
import { Record, TrawSnapshot, TDCamera, TRCamera, TRViewport } from 'types';
import { DEFAULT_CAMERA, SLIDE_HEIGHT, SLIDE_RATIO, SLIDE_WIDTH } from '../constants';
import { nanoid } from 'nanoid';
import debounce from 'lodash/debounce';

export interface TRCallbacks {
  /**
   * Called when a new record is created.
   * @param app The Traw app.
   * @param record The record that was created.
   */
  onRecordsCreate?: (app: TldrawApp, records: Record[]) => void;
}

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

  callbacks: TRCallbacks;

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
   * The time the current action started.
   * This is used to calculate the duration of the record.
   */
  private _actionStartTime: number | undefined;

  constructor(editorId: string, callbacks = {} as TRCallbacks) {
    // dummy app
    this.app = new TldrawApp();

    this.editorId = editorId || 'editor';

    this._state = {
      records: [],
      viewport: {
        width: 0,
        height: 0,
      },
      camera: {
        [this.editorId]: {
          page: DEFAULT_CAMERA,
        },
      },
    };
    this.store = createVanilla(() => this._state);

    this.callbacks = callbacks;
  }

  registerApp(app: TldrawApp) {
    app.callbacks = {
      onCommand: this.recordCommand,
      onPatch: (app, patch, reason) => {
        if (reason === 'sync_camera') return;
        const camera = patch.document?.pageStates?.page?.camera as TDCamera;
        if (camera) {
          this.handleCameraChange(camera);
        }
      },
    };

    this.app = app;
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

  handleCameraChange = (camera: TDCamera) => {
    const trawCamera = convertCameraTDtoTR(camera, this.store.getState().viewport);
    const currentPageId = this.app.appState.currentPageId;

    this.store.setState((state) => {
      return {
        ...state,
        camera: {
          ...state.camera,
          [this.editorId]: {
            ...state.camera[this.editorId],
            [currentPageId]: trawCamera,
          },
        },
      };
    });

    if (this._actionStartTime === 0) {
      this._actionStartTime = Date.now();
    }
    this.handleCameraRecord(trawCamera);
  };

  handleCameraRecord = debounce((camera: TRCamera) => {
    const currentPageId = this.app.appState.currentPageId;
    // create record
    const record: Record = {
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
    this.callbacks.onRecordsCreate?.(this.app, [record]);
    this.store.setState((state) => {
      return {
        ...state,
        records: [...state.records, record],
      };
    });
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

  private recordCommand = (state: TDSnapshot, command: TldrawCommand) => {
    const records: Record[] = [];
    switch (command.id) {
      case 'change_page':
        if (command.after.appState)
          records.push({
            type: command.id,
            data: {
              id: command.after.appState.currentPageId,
            },
            start: this._actionStartTime ? this._actionStartTime : 0,
            end: Date.now(),
          } as Record);
        break;
      case 'create_page': {
        if (!command.after.document || !command.after.document.pages) break;
        const pageId = Object.keys(command.after.document.pages)[0];
        records.push({
          type: command.id,
          data: {
            id: pageId,
          },
          start: Date.now() - 1, // Create page must be before select page
          end: Date.now() - 1,
        } as Record);
        records.push({
          type: 'change_page',
          data: {
            id: pageId,
          },
          start: Date.now(),
          end: Date.now(),
        } as Record);
        break;
      }
      case 'delete_page':
        break;
      default: {
        if (!command.after.document || !command.after.document.pages) break;
        const pageId = Object.keys(command.after.document.pages)[0];

        records.push({
          type: command.id,
          data: command.after.document.pages[pageId],
          slideId: pageId,
          start: this._actionStartTime ? this._actionStartTime : 0,
          end: Date.now(),
        } as Record);
        break;
      }
    }

    if (!records.length) return;

    this.callbacks.onRecordsCreate?.(this.app, records);
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
          this.store.setState((state) => {
            return {
              ...state,
              camera: {
                ...state.camera,
                [this.editorId]: {
                  ...state.camera[this.editorId],
                  [record.data.id]: DEFAULT_CAMERA,
                },
              },
            };
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
        case 'zoom':
          if (!record.slideId) break;
          this.store.setState((state) => {
            return {
              ...state,
              camera: {
                ...state.camera,
                [record.user]: {
                  ...state.camera[record.user],
                  [record.slideId || '']: record.data.camera,
                },
              },
            };
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

  // setCamera = (camera: TDCamera, slideId: string) => {};

  createSlide = () => {
    const pageId = nanoid();
    this.store.setState((state) => {
      return {
        ...state,
        camera: {
          ...state.camera,
          [this.editorId]: {
            ...state.camera[this.editorId],
            [pageId]: DEFAULT_CAMERA,
          },
        },
      };
    });
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
}
