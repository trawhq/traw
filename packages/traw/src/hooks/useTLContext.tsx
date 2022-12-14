import * as React from 'react';
import { TLShapeUtilsMap, Inputs, TLBounds, TLCallbacks, TLPageState, TLShape } from '@tldraw/core';

export interface TLContextType<T extends TLShape> {
  id?: string;
  callbacks: Partial<TLCallbacks<T>>;
  shapeUtils: TLShapeUtilsMap<T>;
  rPageState: React.MutableRefObject<TLPageState>;
  rSelectionBounds: React.MutableRefObject<TLBounds | null>;
  inputs: Inputs;
  bounds: TLBounds;
}

export const TLContext = React.createContext({} as TLContextType<TLShape>);

export function useTLContext() {
  const context = React.useContext(TLContext);

  return context;
}
