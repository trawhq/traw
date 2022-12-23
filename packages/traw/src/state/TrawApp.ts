import { TDAsset, TDToolType, TDUser, TldrawApp, TldrawCommand, TldrawPatch } from '@tldraw/tldraw';
import debounce from 'lodash/debounce';
import { nanoid } from 'nanoid';
import {
  ActionType,
  TDCamera,
  TrawSnapshot,
  TRBlock,
  TRBlockType,
  TRBlockVoice,
  TRCamera,
  TRRecord,
  TRViewport,
} from 'types';
import createVanilla, { StoreApi } from 'zustand/vanilla';
import { DEFAULT_CAMERA, SLIDE_HEIGHT, SLIDE_RATIO, SLIDE_WIDTH } from '../constants';
import { mountStoreDevtool } from 'simple-zustand-devtools';

import produce from 'immer';
import { CreateRecordsEvent, EventTypeHandlerMap, TrawEventHandler, TrawEventType } from 'state/events';
import create, { UseBoundStore } from 'zustand';
import { TrawAppOptions } from './TrawAppOptions';
import { TrawRecorder } from 'recorder/TrawRecorder';
import { Howl } from 'howler';
import { encodeFile } from 'utils/base64';

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
   * Traw recorder
   */
  private _trawRecorder?: TrawRecorder;

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
    this.editorId = user.id;

    this._state = {
      viewport: {
        width: 0,
        height: 0,
      },
      recording: {
        isRecording: false,
        isTalking: false,
        recognizedText: '',
        startedAt: 0,
      },
      camera: {
        [this.editorId]: {
          targetSlideId: 'page',
          cameras: {
            ['page']: DEFAULT_CAMERA,
          },
        },
      },
      user,
      document,
      records: {},
      blocks:
        process.env.NODE_ENV === 'development'
          ? {
              'example-1': {
                id: 'example-1',
                type: TRBlockType.TALK,
                userId: 'example-1',
                text: '동해물과 백두산이 마르고 닳도록 하느님이 보우하사 우리 나라 만세',
                time: Date.now(),
                isActive: true,
                voices: [
                  {
                    blockId: 'example-1',
                    voiceId: 'example-1-1',
                    ext: 'mp4',
                    url: '',
                  },
                ],
                voiceStart: 0,
                voiceEnd: 0,
              },
              'example-2': {
                id: 'example-2',
                type: TRBlockType.TALK,
                userId: 'example-2',
                text: '무궁화 삼천리 화려강산 대한 사람 대한으로 길이 보전하세',
                time: Date.now() + 1000,
                isActive: true,
                voices: [
                  {
                    blockId: 'example-2',
                    voiceId: 'example-2-1',
                    ext: 'mp4',
                    url: '',
                  },
                ],
                voiceStart: 0,
                voiceEnd: 0,
              },
            }
          : {},
    };
    this.store = createVanilla<TrawSnapshot>(() => this._state);
    if (process.env.NODE_ENV === 'development') {
      mountStoreDevtool(`Traw Store - ${document.id}`, this.store);
    }

    this.useStore = create(this.store);

    this.app = new TldrawApp();

    this.registerApp(this.app);

    const recordMap: Record<string, TRRecord> = {};
    records.forEach((record) => {
      recordMap[record.id] = record;
    });
    this.applyRecordsFromFirst();

    if (TrawRecorder.isSupported()) {
      this._trawRecorder = new TrawRecorder({
        lang: 'ko-KR',
        onCreatingBlockUpdate: (text) => {
          this.store.setState(
            produce((state) => {
              state.recording.recognizedText = text;
            }),
          );
        },
        onBlockCreated: ({ blockId, text, time, voiceStart, voiceEnd }) => {
          this.store.setState((state) =>
            produce(state, (draft) => {
              const block: TRBlock = {
                id: blockId,
                time,
                voiceStart,
                voiceEnd,
                text,
                isActive: true,
                type: TRBlockType.TALK,
                userId: this.editorId,
                voices: [],
              };

              draft.blocks[block.id] = block;
            }),
          );
        },
        onVoiceCreated: async ({ voiceId, file, blockId, ext }) => {
          let url: string | false;
          if (this.onAssetCreate) {
            url = await this.onAssetCreate(this.app, file, voiceId);
          } else {
            url = await encodeFile(file);
          }

          if (url) {
            this.store.setState((state) =>
              produce(state, (draft) => {
                const blockVoice: TRBlockVoice = {
                  blockId,
                  voiceId,
                  ext,
                  url: url as string,
                };

                draft.blocks[blockId]?.voices.push(blockVoice);
              }),
            );
          } else {
            console.log('Failed to get voice URL');
          }
        },
        onTalking: (isTalking: boolean) => {
          this.store.setState(
            produce((state: TrawSnapshot) => {
              state.recording.isTalking = isTalking;
            }),
          );
        },
      });
    }
  }

  registerApp(app: TldrawApp) {
    app.callbacks = {
      onCommand: this.recordCommand,
      onAssetCreate: this.handleAssetCreate,
      onPatch: this.onPatch,
      onChangePresence: this.onChangePresence,
    };

    this.app = app;
    this.applyRecordsFromFirst();
    this.emit(TrawEventType.TldrawAppChange, { tldrawApp: app });
  }

  private onPatch = (app: TldrawApp, patch: TldrawPatch, reason?: string) => {
    if (reason === 'sync_camera') return;
    const pageStates = patch.document?.pageStates;
    const currentPageId = app.appState.currentPageId;
    if (pageStates && pageStates[currentPageId]) {
      const camera = pageStates[currentPageId]?.camera as TDCamera;
      if (camera) {
        this.handleCameraChange(camera);
      }
    }
  };

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
    const { viewport, camera } = this.store.getState();
    const currentPageId = camera[this.editorId].targetSlideId;
    if (!currentPageId) return;

    if (currentPageId !== this.app.appState.currentPageId) {
      this.app.patchState({
        appState: {
          currentPageId,
        },
      });
    }

    const trCamera = camera[this.editorId].cameras[currentPageId];
    if (!trCamera) return;

    const tdCamera = convertCameraTRtoTD(trCamera, viewport);
    this.app.setCamera(tdCamera.point, tdCamera.zoom, 'sync_camera');
  };

  getCamera = (slideId: string) => {
    const { camera } = this.store.getState();
    return camera[this.editorId].cameras[slideId];
  };

  handleCameraChange = (camera: TDCamera) => {
    if (this.store.getState().viewport.width === 0) return;
    const trawCamera = convertCameraTDtoTR(camera, this.store.getState().viewport);
    const currentPageId = this.app.appState.currentPageId;

    this.store.setState(
      produce((state) => {
        state.camera[this.editorId].cameras[currentPageId] = trawCamera;
      }),
    );

    if (this._actionStartTime === 0) {
      this._actionStartTime = Date.now();
    }
    this.handleCameraRecord(trawCamera);
    this.emit(TrawEventType.CameraChange, { tldrawApp: this.app, targetSlide: currentPageId, camera: trawCamera });
  };

  updateCameraFromOthers = (slideId: string, camera: TRCamera) => {
    this.store.setState(
      produce((state) => {
        state.camera[this.editorId].cameras[slideId] = camera;
        if (state.camera[this.editorId].targetSlideId !== slideId) {
          state.camera[this.editorId].targetSlideId = slideId;
        }
      }),
    );
    this.syncCamera();

    if (this._actionStartTime === 0) {
      this._actionStartTime = Date.now();
    }
    this.handleCameraRecord(camera);
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
      case 'erase':
      case 'delete': {
        if (!command.after.document || !command.after.document.pages) break;
        const pageId = Object.keys(command.after.document.pages)[0];

        const shapes = command.after.document.pages[pageId]?.shapes;
        if (!shapes) break;

        const shapeIds = Object.keys(shapes);
        if (shapeIds.length === 0) break;

        records.push({
          type: 'delete',
          id: nanoid(),
          user: user.id,
          data: {
            shapes: shapeIds,
          },
          slideId: pageId,
          start: this._actionStartTime || new Date().getTime(),
          end: Date.now(),
          origin: document.id,
        });
        break;
      }
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
    let isCameraChanged = false;

    records
      .sort((a, b) => a.start - b.start)
      .forEach((record) => {
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
                if (state.camera[record.user]) {
                  state.camera[record.user].cameras[record.data.id] = DEFAULT_CAMERA;
                } else {
                  state.camera[record.user] = {
                    targetSlideId: record.data.id,
                    cameras: {
                      [record.data.id]: DEFAULT_CAMERA,
                    },
                  };
                }
                state.camera[this.editorId].cameras[record.data.id] = DEFAULT_CAMERA;
              }),
            );
            isCameraChanged = true;
            break;
          case 'change_page':
            this.store.setState(
              produce((state) => {
                if (state.camera[record.user]) {
                  state.camera[record.user].targetSlideId = record.data.id;
                } else {
                  state.camera[record.user] = {
                    targetSlideId: record.data.id,
                    cameras: {
                      [record.data.id]: DEFAULT_CAMERA,
                    },
                  };
                }
              }),
            );
            if (this.editorId === record.user) {
              isCameraChanged = true;
            }
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
            if (!this.app.state.document.pageStates[record.slideId]) break;
            this.store.setState(
              produce((state) => {
                if (state.camera[record.user]) {
                  state.camera[record.user].cameras = {
                    ...state.camera[record.user].cameras,
                    [record.slideId || '']: record.data.camera,
                  };
                } else {
                  state.camera[record.user] = {
                    targetSlideId: record.slideId,
                    cameras: {
                      [record.slideId || '']: record.data.camera,
                    },
                  };
                }
              }),
            );
            isCameraChanged = true;
            break;
          case 'delete': {
            if (!record.slideId) break;
            this.app.patchState({
              document: {
                pages: {
                  [record.slideId]: {
                    shapes: record.data.shapes.reduce((acc: Record<string, undefined>, shapeId: string) => {
                      acc[shapeId] = undefined;
                      return acc;
                    }, {}),
                  },
                },
              },
            });
            break;
          }
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

    this.removeDefaultPage();
    if (isCameraChanged) {
      this.syncCamera();
    }
  };

  private removeDefaultPage = () => {
    if (this.app.document.pageStates.page && Object.keys(this.app.document.pageStates).length > 1) {
      this.app.patchState({
        appState: {
          currentPageId: Object.keys(this.app.document.pageStates)[0],
        },
        document: {
          pageStates: {
            page: undefined,
          },
          pages: {
            page: undefined,
          },
        },
      });
    }
    if (this._state.camera[this.editorId].cameras.page) {
      this.store.setState(
        produce((state) => {
          if (state.camera[this.editorId].targetSlideId === 'page')
            state.camera[this.editorId].targetSlideId = Object.keys(this.app.document.pageStates)[0];
          delete state.camera[this.editorId].cameras.page;
        }),
      );
    }
  };

  // setCamera = (camera: TDCamera, slideId: string) => {};

  createSlide = () => {
    const pageId = nanoid();
    this.store.setState(
      produce((state) => {
        state.camera[this.editorId].targetSlideId = pageId;
        state.camera[this.editorId].cameras[pageId] = DEFAULT_CAMERA;
      }),
    );
    this.app.createPage(pageId);
    this.syncCamera();
  };

  deleteSlide = () => {
    this.app.deletePage();
  };

  selectSlide = (id: string) => {
    this.store.setState(
      produce((state) => {
        state.camera[this.editorId].targetSlideId = id;
      }),
    );
    this.app.changePage(id);
    this.syncCamera();
  };

  startRecording = async (): Promise<void> => {
    if (!this._trawRecorder) return;

    await this._trawRecorder.startRecording();

    this.store.setState(
      produce((state: TrawSnapshot) => {
        state.recording.isRecording = true;
        state.recording.startedAt = Date.now();
      }),
    );
  };

  stopRecording = () => {
    if (!this._trawRecorder) return;

    this._trawRecorder?.stopRecording();
    this.store.setState(
      produce((state: TrawSnapshot) => {
        state.recording.isRecording = false;
        state.recording.startedAt = 0;
      }),
    );
  };

  private handleAssetCreate = async (app: TldrawApp, file: File, id: string): Promise<string | false> => {
    if (this.onAssetCreate) {
      return await this.onAssetCreate(app, file, id);
    }
    return false;
  };

  /*
   * Realtime room
   */
  private onChangePresence = (tldrawApp: TldrawApp, presence: TDUser) => {
    const [x, y] = presence.point;
    this.emit(TrawEventType.PointerMove, { tldrawApp, x, y });
  };

  public readonly initializeRoom = (roomId: string, color: string) => {
    this.app.patchState({
      room: {
        id: roomId,
        userId: this.editorId,
        users: {
          [this.editorId]: {
            id: this.editorId,
            color,
            point: [100, 100],
            selectedIds: [],
            activeShapes: [],
          },
        },
      },
    });
  };

  public readonly updateOthers = (others: TDUser[]) => {
    this.app.patchState({
      room: {
        users: Object.fromEntries(others.map((user) => [user.id, user])),
      },
    });
  };

  public playBlock(blockId: string) {
    const block = this.store.getState().blocks[blockId || ''];
    if (!block) return;
    if (block.voices.length === 0) return;

    const playableVoice = block.voices[0];
    // TODO (Changje, 2022-12-24) - Reimplement it to support preloading
    const howl = new Howl({
      src: [playableVoice.url],
      format: playableVoice.ext,
    });
    howl.seek(block.voiceStart / 1000);
    howl.play();
  }

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
