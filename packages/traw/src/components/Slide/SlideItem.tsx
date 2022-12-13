import { Renderer } from '@tldraw/core';
import React, { useCallback, useEffect } from 'react';
import { useTrawApp } from '../../hooks/useTrawApp';
import { shapeUtils, TLDR, TDStatus } from '@tldraw/tldraw';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { SLIDE_HEIGHT, SLIDE_WIDTH } from '../../constants';

const SlideItem = () => {
  const app = useTrawApp();
  const tldrawApp = app.useTldrawApp();
  const state = app.useSlidesStore();
  const id = 'traw';
  useKeyboardShortcuts();
  const slideDomRef = React.useRef<HTMLDivElement>(null);

  const { document, settings, appState, room } = state;

  const page = document.pages[appState.currentPageId];
  const { currentPageId } = appState;

  const handleResize = useCallback(() => {
    if (!slideDomRef.current) return;
    const width = slideDomRef.current.clientWidth;
    const zoom = width / SLIDE_WIDTH;
    tldrawApp.setCamera([SLIDE_WIDTH / 2, SLIDE_HEIGHT / 2], zoom, 'fixCamera');
  }, [tldrawApp]);

  useEffect(() => {
    handleResize();
  }, [currentPageId, handleResize]);

  useEffect(() => {
    handleResize();
    addEventListener('resize', handleResize);
    return () => {
      removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  const pageState = document.pageStates[page.id];
  const assets = document.assets;
  const { selectedIds } = pageState;

  const isSelecting = state.appState.activeTool === 'select';

  const isHideBoundsShape =
    selectedIds.length === 1 &&
    page.shapes[selectedIds[0]] &&
    TLDR.getShapeUtil(page.shapes[selectedIds[0]].type).hideBounds;

  const isHideResizeHandlesShape =
    selectedIds.length === 1 &&
    page.shapes[selectedIds[0]] &&
    TLDR.getShapeUtil(page.shapes[selectedIds[0]].type).hideResizeHandles;

  // Custom rendering meta, with dark mode for shapes
  const meta = React.useMemo(() => {
    return { isDarkMode: settings.isDarkMode };
  }, [settings.isDarkMode]);

  const showDashedBrush = settings.isCadSelectMode ? !appState.selectByContain : appState.selectByContain;

  const isInSession = tldrawApp.session !== undefined;

  // Hide bounds when not using the select tool, or when the only selected shape has handles
  const hideBounds =
    (isInSession && tldrawApp.session?.constructor.name !== 'BrushSession') ||
    !isSelecting ||
    isHideBoundsShape ||
    !!pageState.editingId;

  // Hide bounds when not using the select tool, or when in session
  const hideHandles = isInSession || !isSelecting;

  // Hide indicators when not using the select tool, or when in session
  const hideIndicators = (isInSession && state.appState.status !== TDStatus.Brushing) || !isSelecting;

  return (
    <div
      className="w-full aspect-video rounded-2xl relative overflow-hidden shadow-[0_10px_50px_rgba(189,188,249,0.5)]"
      ref={slideDomRef}
    >
      <Renderer
        id={id}
        shapeUtils={shapeUtils}
        page={page}
        pageState={pageState}
        assets={assets}
        snapLines={appState.snapLines}
        eraseLine={appState.eraseLine}
        users={room?.users}
        userId={room?.userId}
        meta={meta}
        hideBounds={hideBounds}
        hideHandles={hideHandles}
        hideResizeHandles={isHideResizeHandlesShape}
        hideIndicators={hideIndicators}
        hideBindingHandles={!settings.showBindingHandles}
        hideRotateHandles={!settings.showRotateHandles}
        hideGrid={!settings.showGrid}
        showDashedBrush={showDashedBrush}
        performanceMode={tldrawApp.session?.performanceMode}
        onPinchStart={tldrawApp.onPinchStart}
        onPinchEnd={tldrawApp.onPinchEnd}
        onPinch={tldrawApp.onPinch}
        onPan={tldrawApp.onPan}
        onZoom={tldrawApp.onZoom}
        onPointerDown={tldrawApp.onPointerDown}
        onPointerMove={tldrawApp.onPointerMove}
        onPointerUp={tldrawApp.onPointerUp}
        onPointCanvas={tldrawApp.onPointCanvas}
        onDoubleClickCanvas={tldrawApp.onDoubleClickCanvas}
        onRightPointCanvas={tldrawApp.onRightPointCanvas}
        onDragCanvas={tldrawApp.onDragCanvas}
        onReleaseCanvas={tldrawApp.onReleaseCanvas}
        onPointShape={tldrawApp.onPointShape}
        onDoubleClickShape={tldrawApp.onDoubleClickShape}
        onRightPointShape={tldrawApp.onRightPointShape}
        onDragShape={tldrawApp.onDragShape}
        onHoverShape={tldrawApp.onHoverShape}
        onUnhoverShape={tldrawApp.onUnhoverShape}
        onReleaseShape={tldrawApp.onReleaseShape}
        onPointBounds={tldrawApp.onPointBounds}
        onDoubleClickBounds={tldrawApp.onDoubleClickBounds}
        onRightPointBounds={tldrawApp.onRightPointBounds}
        onDragBounds={tldrawApp.onDragBounds}
        onHoverBounds={tldrawApp.onHoverBounds}
        onUnhoverBounds={tldrawApp.onUnhoverBounds}
        onReleaseBounds={tldrawApp.onReleaseBounds}
        onPointBoundsHandle={tldrawApp.onPointBoundsHandle}
        onDoubleClickBoundsHandle={tldrawApp.onDoubleClickBoundsHandle}
        onRightPointBoundsHandle={tldrawApp.onRightPointBoundsHandle}
        onDragBoundsHandle={tldrawApp.onDragBoundsHandle}
        onHoverBoundsHandle={tldrawApp.onHoverBoundsHandle}
        onUnhoverBoundsHandle={tldrawApp.onUnhoverBoundsHandle}
        onReleaseBoundsHandle={tldrawApp.onReleaseBoundsHandle}
        onPointHandle={tldrawApp.onPointHandle}
        onDoubleClickHandle={tldrawApp.onDoubleClickHandle}
        onRightPointHandle={tldrawApp.onRightPointHandle}
        onDragHandle={tldrawApp.onDragHandle}
        onHoverHandle={tldrawApp.onHoverHandle}
        onUnhoverHandle={tldrawApp.onUnhoverHandle}
        onReleaseHandle={tldrawApp.onReleaseHandle}
        onError={tldrawApp.onError}
        onRenderCountChange={tldrawApp.onRenderCountChange}
        onShapeChange={tldrawApp.onShapeChange}
        onShapeBlur={tldrawApp.onShapeBlur}
        onShapeClone={tldrawApp.onShapeClone}
        onBoundsChange={tldrawApp.updateBounds}
        onKeyDown={tldrawApp.onKeyDown}
        onKeyUp={tldrawApp.onKeyUp}
        onDragOver={tldrawApp.onDragOver}
        onDrop={tldrawApp.onDrop}
      />
    </div>
  );
};

export { SlideItem };
