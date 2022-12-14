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

export type Record = {
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

export type TrawSnapshot = {
  viewport: TRViewport;
  records: Record[];
  camera: {
    [userId: string]: {
      [slideId: string]: TRCamera;
    };
  };
};
