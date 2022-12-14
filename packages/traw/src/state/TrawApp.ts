import { TDSnapshot, TDToolType, TldrawApp, TldrawCommand } from '@tldraw/tldraw';
import createVanilla, { StoreApi } from 'zustand/vanilla';
import { migrateRecords } from 'components/utils/migrate';
import { Record, TrawSnapshot, TDCamera, TRCamera, TRViewport } from 'types';
import { SLIDE_HEIGHT, SLIDE_RATIO, SLIDE_WIDTH } from '../constants';

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
    const zoom = viewport.width / absoluteHeight;
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
        [this.editorId]: {},
      },
    };
    this.store = createVanilla(() => this._state);

    this.callbacks = callbacks;
  }

  registerApp(app: TldrawApp) {
    app.callbacks = {
      onCommand: this.recordCommand,
      onPatch: (app, patch) => {
        const camera = patch.document?.pageStates?.page?.camera as TDCamera;
        if (camera) {
          this.handleViewportChange(camera);
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
    const camera = convertCameraTRtoTD({ center: { x: 0, y: 0 }, zoom: 1 }, { width, height });
    this.app.setCamera(camera.point, camera.zoom, 'viewport_change');
  };

  handleViewportChange = (camera: TDCamera) => {
    console.log(camera);
  };

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
    console.log(command);
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
}
