import { shapeUtils, TDDocument, TDStatus, TLDR } from '@tldraw/tldraw';
import { ToolsPanel } from 'components/ToolsPanel';
import { useKeyboardShortcuts, useTrawApp } from 'hooks';
import React, { useCallback, useEffect } from 'react';

import { styled } from '@stitches/react';
import { CursorComponent, Renderer } from '@tldraw/core';
import { TDCallbacks } from '@tldraw/tldraw/dist/state';
import { useTldrawApp } from 'hooks/useTldrawApp';
import { ErrorBoundary as _Errorboundary } from 'react-error-boundary';

const ErrorBoundary = _Errorboundary as any;

export interface TldrawProps extends TDCallbacks {
  /**
   * (optional) If provided, the component will load / persist state under this key.
   */
  id?: string;

  /**
   * (optional) The document to load or update from.
   */
  document?: TDDocument;

  /**
   * (optional) The current page id.
   */
  currentPageId?: string;

  /**
   * (optional) Whether the editor should immediately receive focus. Defaults to true.
   */
  autofocus?: boolean;

  /**
   * (optional) Whether to show the menu UI.
   */
  showMenu?: boolean;

  /**
   * (optional) Whether to show the multiplayer menu.
   */
  showMultiplayerMenu?: boolean;

  /**
   * (optional) Whether to show the pages UI.
   */
  showPages?: boolean;

  /**
   * (optional) Whether to show the styles UI.
   */
  showStyles?: boolean;

  /**
   * (optional) Whether to show the zoom UI.
   */
  showZoom?: boolean;

  /**
   * (optional) Whether to show the tools UI.
   */
  showTools?: boolean;

  /**
   * (optional) Whether to show the UI.
   */
  showUI?: boolean;

  /**
   * (optional) Whether to the document should be read only.
   */
  readOnly?: boolean;

  /**
   * (optional) Whether to to show the app's dark mode UI.
   */
  darkMode?: boolean;

  /**
   * (optional) If provided, image/video componnets will be disabled.
   *
   * Warning: Keeping this enabled for multiplayer applications without provifing a storage
   * bucket based solution will cause massive base64 string to be written to the liveblocks room.
   */
  disableAssets?: boolean;

  /**
   * (optional) Custom components to override parts of the default UI.
   */
  components?: {
    /**
     * The component to render for multiplayer cursors.
     */
    Cursor?: CursorComponent;
  };

  /**
   * (optional) To hide cursors
   */
  hideCursors?: boolean;
}

const isSystemDarkMode = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;

export function Tldraw({
  document,
  currentPageId,
  autofocus = true,
  showMenu = true,
  showMultiplayerMenu = true,
  showPages = true,
  showTools = true,
  showZoom = true,
  showStyles = true,
  showUI = true,
  readOnly = false,
  disableAssets = false,
  darkMode = isSystemDarkMode,
  components,
  hideCursors,
}: TldrawProps) {
  const app = useTldrawApp();

  // Update the document if the `document` prop changes but the ids,
  // are the same, or else load a new document if the ids are different.
  React.useEffect(() => {
    if (!document) return;

    if (document.id === app.document.id) {
      app.updateDocument(document);
    } else {
      app.loadDocument(document);
    }
  }, [document, app]);

  // Disable assets when the `disableAssets` prop changes.
  React.useEffect(() => {
    app.setDisableAssets(disableAssets);
  }, [app, disableAssets]);

  // Change the page when the `currentPageId` prop changes.
  React.useEffect(() => {
    if (!currentPageId) return;
    app.changePage(currentPageId);
  }, [currentPageId, app]);

  // Toggle the app's readOnly mode when the `readOnly` prop changes.
  React.useEffect(() => {
    app.readOnly = readOnly;
    if (!readOnly) {
      app.selectNone();
      app.cancelSession();
      app.setEditingId();
    }
  }, [app, readOnly]);

  // Toggle the app's darkMode when the `darkMode` prop changes.
  React.useEffect(() => {
    if (darkMode !== app.settings.isDarkMode) {
      app.toggleDarkMode();
    }
  }, [app, darkMode]);

  React.useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.document?.fonts) return;

    function refreshBoundingBoxes() {
      app.refreshBoundingBoxes();
    }
    window.document.fonts.addEventListener('loadingdone', refreshBoundingBoxes);
    return () => {
      window.document.fonts.removeEventListener('loadingdone', refreshBoundingBoxes);
    };
  }, [app]);

  // Use the `key` to ensure that new selector hooks are made when the id changes
  return (
    <>
      {/* <AlertDialogContext.Provider value={{ onYes, onCancel, onNo, dialogState, setDialogState, openDialog }}> */}
      <InnerTldraw
        key={'Tldraw'}
        autofocus={autofocus}
        showPages={showPages}
        showMenu={showMenu}
        showMultiplayerMenu={showMultiplayerMenu}
        showStyles={showStyles}
        showZoom={showZoom}
        showTools={showTools}
        showUI={showUI}
        readOnly={readOnly}
        components={components}
        hideCursors={hideCursors}
      />
      {/* </AlertDialogContext.Provider> */}
    </>
  );
}

interface InnerTldrawProps {
  id?: string;
  autofocus: boolean;
  readOnly: boolean;
  showPages: boolean;
  showMenu: boolean;
  showMultiplayerMenu: boolean;
  showZoom: boolean;
  showStyles: boolean;
  showUI: boolean;
  showTools: boolean;
  components?: {
    Cursor?: CursorComponent;
  };
  hideCursors?: boolean;
}

const InnerTldraw = React.memo(function InnerTldraw({ id, autofocus, components, hideCursors }: InnerTldrawProps) {
  const app = useTldrawApp();
  const rWrapper = React.useRef<HTMLDivElement>(null);

  const state = app.useStore();

  const { document, settings, appState, room } = state;

  const isSelecting = state.appState.activeTool === 'select';

  const page = document.pages[appState.currentPageId];
  if (!page) return null;
  const pageState = document.pageStates[page.id];
  const assets = document.assets;
  const { selectedIds } = pageState;

  const isHideBoundsShape =
    selectedIds.length === 1 &&
    page.shapes[selectedIds[0]] &&
    TLDR.getShapeUtil(page.shapes[selectedIds[0]].type).hideBounds;

  const isHideResizeHandlesShape =
    selectedIds.length === 1 &&
    page.shapes[selectedIds[0]] &&
    TLDR.getShapeUtil(page.shapes[selectedIds[0]].type).hideResizeHandles;

  const showDashedBrush = settings.isCadSelectMode ? !appState.selectByContain : appState.selectByContain;

  const isInSession = app.session !== undefined;

  // Hide bounds when not using the select tool, or when the only selected shape has handles
  const hideBounds =
    (isInSession && app.session?.constructor.name !== 'BrushSession') ||
    !isSelecting ||
    isHideBoundsShape ||
    !!pageState.editingId;

  // Hide bounds when not using the select tool, or when in session
  const hideHandles = isInSession || !isSelecting;

  // Hide indicators when not using the select tool, or when in session
  const hideIndicators = (isInSession && state.appState.status !== TDStatus.Brushing) || !isSelecting;

  const hideCloneHandles = isInSession || !isSelecting || pageState.camera.zoom < 0.2;

  return (
    <StyledLayout ref={rWrapper} tabIndex={-0}>
      {/* <AlertDialog container={dialogContainer} /> */}
      {/* <Loading /> */}
      <OneOff focusableRef={rWrapper} autofocus={autofocus} />
      {/* <ContextMenu> */}
      <ErrorBoundary FallbackComponent={() => <div>Error!</div>}>
        <Renderer
          id={id}
          containerRef={rWrapper}
          shapeUtils={shapeUtils}
          page={page}
          pageState={pageState}
          assets={assets}
          snapLines={appState.snapLines}
          eraseLine={appState.eraseLine}
          users={room?.users}
          userId={room?.userId}
          meta={{ isDarkMode: false }}
          components={components}
          hideCursors={hideCursors}
          hideBounds={hideBounds}
          hideHandles={hideHandles}
          hideResizeHandles={isHideResizeHandlesShape}
          hideIndicators={hideIndicators}
          hideBindingHandles={!settings.showBindingHandles}
          hideCloneHandles={hideCloneHandles}
          hideRotateHandles={!settings.showRotateHandles}
          hideGrid={!settings.showGrid}
          showDashedBrush={showDashedBrush}
          performanceMode={app.session?.performanceMode}
          onPinchStart={app.onPinchStart}
          onPinchEnd={app.onPinchEnd}
          onPinch={app.onPinch}
          onPan={app.onPan}
          onZoom={app.onZoom}
          onPointerDown={app.onPointerDown}
          onPointerMove={app.onPointerMove}
          onPointerUp={app.onPointerUp}
          onPointCanvas={app.onPointCanvas}
          onDoubleClickCanvas={app.onDoubleClickCanvas}
          onRightPointCanvas={app.onRightPointCanvas}
          onDragCanvas={app.onDragCanvas}
          onReleaseCanvas={app.onReleaseCanvas}
          onPointShape={app.onPointShape}
          onDoubleClickShape={app.onDoubleClickShape}
          onRightPointShape={app.onRightPointShape}
          onDragShape={app.onDragShape}
          onHoverShape={app.onHoverShape}
          onUnhoverShape={app.onUnhoverShape}
          onReleaseShape={app.onReleaseShape}
          onPointBounds={app.onPointBounds}
          onDoubleClickBounds={app.onDoubleClickBounds}
          onRightPointBounds={app.onRightPointBounds}
          onDragBounds={app.onDragBounds}
          onHoverBounds={app.onHoverBounds}
          onUnhoverBounds={app.onUnhoverBounds}
          onReleaseBounds={app.onReleaseBounds}
          onPointBoundsHandle={app.onPointBoundsHandle}
          onDoubleClickBoundsHandle={app.onDoubleClickBoundsHandle}
          onRightPointBoundsHandle={app.onRightPointBoundsHandle}
          onDragBoundsHandle={app.onDragBoundsHandle}
          onHoverBoundsHandle={app.onHoverBoundsHandle}
          onUnhoverBoundsHandle={app.onUnhoverBoundsHandle}
          onReleaseBoundsHandle={app.onReleaseBoundsHandle}
          onPointHandle={app.onPointHandle}
          onDoubleClickHandle={app.onDoubleClickHandle}
          onRightPointHandle={app.onRightPointHandle}
          onDragHandle={app.onDragHandle}
          onHoverHandle={app.onHoverHandle}
          onUnhoverHandle={app.onUnhoverHandle}
          onReleaseHandle={app.onReleaseHandle}
          onError={app.onError}
          onRenderCountChange={app.onRenderCountChange}
          onShapeChange={app.onShapeChange}
          onShapeBlur={app.onShapeBlur}
          onShapeClone={app.onShapeClone}
          onBoundsChange={app.updateBounds}
          onKeyDown={app.onKeyDown}
          onKeyUp={app.onKeyUp}
          onDragOver={app.onDragOver}
          onDrop={app.onDrop}
        />
      </ErrorBoundary>
      {/* </ContextMenu> */}
    </StyledLayout>
  );
});

const StyledLayout = styled('div', {
  position: 'absolute',
  height: '100%',
  width: '100%',
  minHeight: 0,
  minWidth: 0,
  maxHeight: '100%',
  maxWidth: '100%',
  overflow: 'hidden',
  boxSizing: 'border-box',
  outline: 'none',

  '& .tl-container': {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    zIndex: 1,
  },

  '& input, textarea, button, select, label, button': {
    webkitTouchCallout: 'none',
    webkitUserSelect: 'none',
    '-webkit-tap-highlight-color': 'transparent',
    'tap-highlight-color': 'transparent',
  },
});

const OneOff = React.memo(function OneOff({
  focusableRef,
  autofocus,
}: {
  autofocus?: boolean;
  focusableRef: React.RefObject<HTMLDivElement>;
}) {
  useKeyboardShortcuts(focusableRef);
  // useStylesheet();

  React.useEffect(() => {
    if (autofocus) {
      focusableRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autofocus]);

  return null;
});

export const Editor = () => {
  const TrawApp = useTrawApp();
  const slideDomRef = React.useRef<HTMLDivElement>(null);

  const handleResize = useCallback(() => {
    if (!slideDomRef.current) return;
    const width = slideDomRef.current.clientWidth;
    const height = slideDomRef.current.clientHeight;
    TrawApp.updateViewportSize(width, height);
  }, [TrawApp]);

  useEffect(() => {
    handleResize();
    addEventListener('resize', handleResize);
    return () => {
      removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  return (
    <div id="traw-editor" className="flex-1 relative" ref={slideDomRef}>
      <Tldraw showMultiplayerMenu={false} darkMode={false} showMenu={false} showPages={false} />
      <div>
        <ToolsPanel />
      </div>
    </div>
  );
};
