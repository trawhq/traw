import { TDSnapshot, TDToolType } from '@tldraw/tldraw';

export type ActionType =
  | 'ADD'
  | 'REMOVE'
  | 'UPDATE'
  | 'ADD_SLIDE'
  | 'SORT_SLIDE'
  | 'DELETE_SLIDE'
  | 'SELECT_SLIDE'
  | 'SUBSCRIBE_SLIDE'
  | 'create_page'
  | 'change_page'
  | 'delete_page'
  | 'edit'
  | 'delete'
  | 'create_draw'
  | 'create'
  | 'zoom';

export type TrawToolInfo = {
  type: TDToolType | 'file';
  Icon: any;
  label: string;
  shortcut: (string | number)[];
};

export type TRRecord = {
  type: ActionType;
  data: any;
  id: string;
  slideId?: string;
  user: string;
  start: number;
  end: number;
  origin: string;
};

export type TDCamera = TDSnapshot['document']['pageStates']['page']['camera'];

export type TRViewport = {
  width: number;
  height: number;
};

export type TRCamera = {
  center: {
    x: number;
    y: number;
  };
  zoom: number;
};

export enum PlayModeType {
  EDIT = 'EDIT',
  PREPARE = 'PREPARE',
  PLAYING = 'PLAYING',
  PAUSE = 'PAUSE',
  STOP = 'STOP',
}

export type TrawSnapshot = {
  player: {
    mode: PlayModeType;
    targetBlockId?: string;
    start: number;
    end: number;
    current: number;
    playAs?: string;
    isLimit: boolean;
    loop: boolean;
    volume: number;
    fullTime: number;
  };
  editor: {
    isPanelOpen: boolean;
  };
  viewport: TRViewport;
  records: Record<string, TRRecord>;
  blocks: Record<string, TRBlock>;
  recording: {
    isRecording: boolean;
    isTalking: boolean;
    recognizedText: string;
    startedAt: number;
  };
  currentFollowTarget?: string;
  camera: {
    [userId: string]: {
      targetSlideId: string;
      cameras: {
        [slideId: string]: TRCamera;
      };
    };
  };
  document: TrawDocument;
  user: TrawUser;
  // participants
};

export type TrawUser = {
  id: string;
  name: string;
  profileUrl?: string;
};

export type TrawDocument = {
  id: string;
  name: string;
  channelName: string;
  canEdit: boolean;
};

export enum TRBlockType {
  TALK = 'TALK',
  START_RECORDING = 'START_RECORDING',
  END_RECORDING = 'END_RECORDING',
}

export type TRBlock = {
  id: string;
  type: TRBlockType;
  userId: string;
  time: number;
  text: string;
  isActive: boolean;
  voices: TRBlockVoice[];
  voiceStart: number;
  voiceEnd: number;
};

export type TRBlockVoice = {
  blockId: string;
  voiceId: string;
  ext: string;
  url: string;
};
