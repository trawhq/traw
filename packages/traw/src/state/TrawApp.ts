import { TDAsset, TDToolType, TDUser, TldrawApp, TldrawCommand, TldrawPatch } from '@tldraw/tldraw';
import debounce from 'lodash/debounce';
import { nanoid } from 'nanoid';
import {
  ActionType,
  PlayModeType,
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
import { DEFAULT_CAMERA, DELETE_ID, SLIDE_HEIGHT, SLIDE_RATIO, SLIDE_WIDTH } from '../constants';
import { mountStoreDevtool } from 'simple-zustand-devtools';

import produce from 'immer';
import { CreateRecordsEvent, EventTypeHandlerMap, TrawEventHandler, TrawEventType } from 'state/events';
import create, { UseBoundStore } from 'zustand';
import { TrawAppOptions } from './TrawAppOptions';
import { TrawRecorder } from 'recorder/TrawRecorder';
import { Howl } from 'howler';
import { encodeFile } from 'utils/base64';
import { isChrome } from 'utils/common';
import { cloneDeepWith } from 'lodash';

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

export class TrawDrawApp extends TldrawApp {
  /**
   * Move backward in the undo/redo stack.
   */
  getStack = () => {
    return {
      stack: this.stack,
      pointer: this.pointer,
    };
  };
}
export class TrawApp {
  /**
   * The Tldraw app. (https://tldraw.com)
   * This is used to create and edit slides.
   */
  app: TrawDrawApp;

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

  protected pointer = -1;

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

    const recordMap: Record<string, TRRecord> = {};
    records.forEach((record) => {
      recordMap[record.id] = record;
    });

    this._state = {
      player: {
        mode: PlayModeType.EDIT,
        isLimit: true,
        start: 0,
        end: Infinity,
        current: 0,
        volume: 1,
        loop: false,
      },
      editor: {
        isPanelOpen: true,
      },
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
      records: recordMap,
      blocks: {},
    };
    this.store = createVanilla<TrawSnapshot>(() => this._state);
    if (process.env.NODE_ENV === 'development') {
      mountStoreDevtool(`Traw Store - ${document.id}`, this.store);
    }

    this.useStore = create(this.store);

    this.app = new TrawDrawApp();

    this.registerApp(this.app);

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
          this.createBlock(block);
        },
        onVoiceCreated: async ({ voiceId, file, blockId, ext }) => {
          let url: string | false;
          if (this.onAssetCreate) {
            url = await this.onAssetCreate(this.app, file, voiceId);
          } else {
            url = await encodeFile(file);
          }

          if (url) {
            this.createBlockVoice(blockId, {
              blockId,
              voiceId,
              ext,
              url: url as string,
            });
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

  registerApp(app: TrawDrawApp) {
    app.callbacks = {
      onCommand: this.recordCommand,
      onAssetCreate: this.handleAssetCreate,
      onPatch: this.onPatch,
      onChangePresence: this.onChangePresence,
      onUndo: this.handleUndo,
      onRedo: this.handleRedo,
      onSessionStart: this.setActionStartTime,
    };

    this.app = app;
    this.applyRecordsFromFirst();
    this.emit(TrawEventType.TldrawAppChange, { tldrawApp: app });
  }

  private convertUndefinedToDelete = function handleDel<T>(patch: T): T {
    return cloneDeepWith(patch, (value) => {
      if (value === undefined) {
        return DELETE_ID;
      }
    });
  };

  private convertDeleteToUndefined = function handleUndefined<T>(patch: T): T {
    return cloneDeepWith(patch, (value) => {
      if (value === DELETE_ID) {
        return null;
      }
    });
  };

  private handleUndo = (app: TldrawApp) => {
    const trawDrawApp = app as TrawDrawApp;
    const { stack, pointer } = trawDrawApp.getStack();
    const command = stack[pointer + 1];
    if (!command) return;
    this.recordCommand(app, {
      id: 'edit',
      before: command.after,
      after: command.before,
    });
  };

  private handleRedo = (app: TldrawApp) => {
    const trawDrawApp = app as TrawDrawApp;
    const { stack, pointer } = trawDrawApp.getStack();
    const command = stack[pointer];
    if (!command) return;
    this.recordCommand(app, {
      id: 'edit',
      before: command.before,
      after: command.after,
    });
  };

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
    const document = this.store.getState().document;
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
      origin: document.id,
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
    this._actionStartTime = 0;
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

  protected recordCommand = (app: TldrawApp, command: TldrawCommand) => {
    const user = this.store.getState().user;
    const document = this.store.getState().document;
    const tlDocument = app.document;
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
            start: Date.now(),
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
      case 'delete':
      default: {
        const patch = this.convertUndefinedToDelete(command.after);
        if (!patch.document || !patch.document.pages) break;
        const pageId = Object.keys(patch.document.pages)[0];
        if (!pageId) break;

        const shapes = patch.document.pages[pageId]?.shapes;
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

        const bindings = patch.document.pages[pageId]?.bindings;

        records.push({
          type: command.id as ActionType,
          id: nanoid(),
          user: user.id,
          data: bindings ? { shapes, assets, bindings } : { shapes, assets },
          slideId: pageId,
          start: this._actionStartTime || Date.now(),
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
          default: {
            const { data, slideId } = record;
            if (!slideId) break;
            if (this.app.selectedIds) {
              // deselect deleted shapes
              const nextIds = this.app.selectedIds.filter((id) => record.data.shapes[id] !== DELETE_ID);
              this.app.patchState(
                {
                  appState: {
                    activeTool: 'select',
                  },
                  document: {
                    pageStates: {
                      [this.app.currentPageId]: {
                        selectedIds: nextIds,
                      },
                    },
                  },
                },
                `selected`,
              );
            }
            if (data.bindings) {
              this.app.patchState({
                document: {
                  pages: {
                    [slideId]: {
                      shapes: {
                        ...this.convertDeleteToUndefined(data.shapes),
                      },
                      bindings: data.bindings ? { ...this.convertDeleteToUndefined(data.bindings) } : undefined,
                    },
                  },
                  assets: {
                    ...this.convertDeleteToUndefined(data.assets),
                  },
                },
              });
            } else {
              this.app.patchState({
                document: {
                  pages: {
                    [slideId]: {
                      shapes: {
                        ...this.convertDeleteToUndefined(data.shapes),
                      },
                    },
                  },
                  assets: {
                    ...this.convertDeleteToUndefined(data.assets),
                  },
                },
              });
            }
            break;
          }
        }
      });

    this.removeDefaultPage();
    this.pointer += records.length;
    if (isCameraChanged) {
      this.syncCamera();
    }
  };

  private removeDefaultPage = () => {
    if (this.app.document.pageStates.page && Object.keys(this.app.document.pageStates).length > 1) {
      if (this.app.state.appState.currentPageId === 'page') {
        this.app.patchState({
          appState: {
            currentPageId: Object.keys(this.app.document.pageStates).filter((p) => p !== 'page')[0],
          },
        });
      }
      this.app.patchState({
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

  createBlock = (block: TRBlock) => {
    this.store.setState(
      produce((state) => {
        state.blocks[block.id] = block;
      }),
    );
    this.emit(TrawEventType.CreateBlock, { tldrawApp: this.app, block });
  };

  createBlockVoice = (blockId: string, voice: TRBlockVoice) => {
    this.store.setState((state) =>
      produce(state, (draft) => {
        draft.blocks[blockId]?.voices.push(voice);
      }),
    );
    this.emit(TrawEventType.CreateBlockVoice, { tldrawApp: this.app, voice });
  };

  addBlocks = (blocks: TRBlock[]) => {
    this.store.setState(
      produce((state) => {
        blocks.forEach((block) => {
          state.blocks[block.id] = block;
        });
      }),
    );
  };

  private getPlayableVoice = (block: TRBlock | undefined): TRBlockVoice | undefined => {
    if (!block || block.voices.length === 0) return undefined;

    const webmVoice = block.voices.find(({ ext }) => ext === 'webm');
    const mp4Voice = block.voices.find(({ ext }) => ext === 'mp4');

    if (isChrome()) {
      return webmVoice ?? mp4Voice;
    } else {
      return mp4Voice;
    }
  };

  private audioInstance: Howl | undefined;

  public playBlock(blockId: string) {
    const block = this.store.getState().blocks[blockId || ''];
    if (!block) return;
    if (block.voices.length === 0) return;

    const playableVoice = this.getPlayableVoice(block);
    if (!playableVoice) return;

    if (this.audioInstance) {
      this.audioInstance.stop();
    }

    this.app.resetDocument();
    this.pointer = -1;
    // TODO (Changje, 2022-12-24) - Reimplement it to support preloading
    const howl = new Howl({
      src: [playableVoice.url],
      format: playableVoice.ext,
    });
    howl.seek(block.voiceStart / 1000);
    howl.play();
    this.audioInstance = howl;

    this.store.setState(
      produce((state) => {
        state.player = {
          ...state.player,
          targetBlockId: blockId,
          mode: PlayModeType.PLAYING,
          start: Date.now(),
          end: Date.now() + (block.voiceEnd - block.voiceStart),
        };
      }),
    );
    this._handlePlay();
  }

  private playInterval: number | undefined;

  private stopPlay = () => {
    if (this.playInterval) cancelAnimationFrame(this.playInterval);
    if (this.audioInstance) {
      this.audioInstance.stop();
    }

    this.store.setState(
      produce((state) => {
        state.player = {
          mode: PlayModeType.EDIT,
          isLimit: true,
          start: 0,
          end: Infinity,
          current: 0,
          volume: 1,
          loop: false,
        };
      }),
    );
    this.app.resetDocument();

    this.applyRecordsFromFirst();
  };

  private _handlePlay = () => {
    const { player } = this.store.getState();
    if (player.mode !== PlayModeType.PLAYING) {
      if (this.playInterval) cancelAnimationFrame(this.playInterval);
      return;
    } else {
      if (Date.now() > player.end) {
        this.stopPlay();
        return;
      } else {
        // update to current time
        const fromBlockStart = Date.now() - player.start;
        const targetBlock = this.store.getState().blocks[player.targetBlockId || ''];
        if (!targetBlock) return;
        const currentTime = targetBlock.time + fromBlockStart;
        const records = Object.values(this.store.getState().records)
          .sort((a, b) => a.start - b.start)
          .filter((r) => r.start <= currentTime);
        const afterPointer = records.length;
        this.applyRecords(records.slice(this.pointer + 1));
        this.pointer = afterPointer - 1;

        this.playInterval = requestAnimationFrame(this._handlePlay);
      }
    }
  };

  togglePanel = () => {
    this.store.setState(
      produce((state) => {
        state.editor.isPanelOpen = !state.editor.isPanelOpen;
      }),
    );
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
