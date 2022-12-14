import { TDToolType } from '@tldraw/tldraw';

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
  | 'create';

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

export type TrawSnapshot = {
  document: TrawDocument;
  user: TrawUser;
  records: Record[];
};

export type TrawUser = {
  id: string;
  name: string;
  profileUrl?: string;
};

export type TrawDocument = {
  id: string;
  name: string;
};
