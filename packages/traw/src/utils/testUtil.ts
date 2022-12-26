import { TrawDocument, TrawUser, TRRecord } from 'types';

export const TEST_USER_1: TrawUser = {
  id: 'user-1',
  name: 'Test User 1',
};

export const TEST_USER_2: TrawUser = {
  id: 'user-2',
  name: 'Test User 2',
};

export const TEST_DOCUMENT_1: TrawDocument = {
  id: 'document-1',
  name: 'Test Document 1',
};

export const EXAMPLE_RECORDS: TRRecord[] = [
  {
    id: 'record-1',
    type: 'create_page',
    user: TEST_USER_1.id,
    slideId: 'slide-1',
    start: 0,
    end: 0,
    data: {
      id: 'slide-1',
    },
    origin: TEST_DOCUMENT_1.id,
  },
  {
    id: 'record-2',
    type: 'change_page',
    user: TEST_USER_1.id,
    slideId: 'slide-1',
    start: 0,
    end: 0,
    data: {
      id: 'slide-1',
    },
    origin: TEST_DOCUMENT_1.id,
  },
];
