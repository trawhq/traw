import { ArrowTopRightIcon, ImageIcon } from '@radix-ui/react-icons';
import * as React from 'react';
import { breakpoints } from 'utils/breakpoints';

import * as Separator from '@radix-ui/react-separator';
import { useTldrawApp } from 'hooks/useTldrawApp';

import { TDShapeType, TDSnapshot } from '@tldraw/tldraw';
import { ToolButtonWithTooltip } from 'components/Primitives/ToolButton';
import SvgEraser from 'icons/eraser';
import SvgPencil from 'icons/pencil';
import SvgRedo from 'icons/redo';
import SvgSelector from 'icons/selector';
import SvgText from 'icons/Text';
import SvgUndo from 'icons/undo';
import { styled } from 'stitches.config';
import { ShapesMenu } from './ShapesMenu';
import { Panel } from 'components/Primitives/Panel';
import SvgShape from 'icons/shape';

const activeToolSelector = (s: TDSnapshot) => s.appState.activeTool;
const toolLockedSelector = (s: TDSnapshot) => s.appState.isToolLocked;
const dockPositionState = (s: TDSnapshot) => s.settings.dockPosition;

export const PrimaryTools = React.memo(function PrimaryTools() {
  const app = useTldrawApp();

  const activeTool = app.useStore(activeToolSelector);

  const isToolLocked = app.useStore(toolLockedSelector);
  const dockPosition = app.useStore(dockPositionState);

  const selectSelectTool = React.useCallback(() => {
    app.selectTool('select');
  }, [app]);

  const selectEraseTool = React.useCallback(() => {
    app.selectTool('erase');
  }, [app]);

  const selectDrawTool = React.useCallback(() => {
    app.selectTool(TDShapeType.Draw);
  }, [app]);

  const selectArrowTool = React.useCallback(() => {
    app.selectTool(TDShapeType.Arrow);
  }, [app]);

  const selectTextTool = React.useCallback(() => {
    app.selectTool(TDShapeType.Text);
  }, [app]);

  const selectStickyTool = React.useCallback(() => {
    app.selectTool(TDShapeType.Sticky);
  }, [app]);

  const uploadMedias = React.useCallback(async () => {
    app.openAsset();
  }, [app]);

  const undo = React.useCallback(() => {
    app.undo();
  }, [app]);

  const redo = React.useCallback(() => {
    app.redo();
  }, [app]);

  const panelStyle = dockPosition === 'bottom' || dockPosition === 'top' ? 'row' : 'column';

  return (
    <StyledPanel side="center" id="TD-PrimaryTools" style={{ flexDirection: panelStyle }} bp={breakpoints}>
      <ToolButtonWithTooltip
        kbd={'1'}
        label={'select'}
        onClick={selectSelectTool}
        isActive={activeTool === 'select'}
        id="TD-PrimaryTools-CursorArrow"
      >
        <SvgSelector />
      </ToolButtonWithTooltip>
      <ToolButtonWithTooltip
        kbd={'2'}
        label={'draw'}
        onClick={selectDrawTool}
        isActive={activeTool === TDShapeType.Draw}
        id="TD-PrimaryTools-Pencil"
      >
        <SvgPencil />
      </ToolButtonWithTooltip>
      <ToolButtonWithTooltip
        kbd={'3'}
        label={'eraser'}
        onClick={selectEraseTool}
        isActive={activeTool === 'erase'}
        id="TD-PrimaryTools-Eraser"
      >
        <SvgEraser />
      </ToolButtonWithTooltip>
      <ShapesMenu activeTool={activeTool} isToolLocked={isToolLocked} />
      <ToolButtonWithTooltip
        kbd={'8'}
        label={'arrow'}
        onClick={selectArrowTool}
        isLocked={isToolLocked}
        isActive={activeTool === TDShapeType.Arrow}
        id="TD-PrimaryTools-ArrowTopRight"
      >
        <ArrowTopRightIcon />
      </ToolButtonWithTooltip>
      <ToolButtonWithTooltip
        kbd={'9'}
        label={'text'}
        onClick={selectTextTool}
        isLocked={isToolLocked}
        isActive={activeTool === TDShapeType.Text}
        id="TD-PrimaryTools-Text"
      >
        <SvgText />
      </ToolButtonWithTooltip>
      <ToolButtonWithTooltip
        kbd={'0'}
        label={'sticky'}
        onClick={selectStickyTool}
        isActive={activeTool === TDShapeType.Sticky}
        id="TD-PrimaryTools-Pencil2"
      >
        <SvgShape />
      </ToolButtonWithTooltip>
      <ToolButtonWithTooltip label={'image'} onClick={uploadMedias} id="TD-PrimaryTools-Image">
        <ImageIcon />
      </ToolButtonWithTooltip>
      <Separator.Root className="SeparatorRoot mx-2 my-1 w-[2px]  bg-traw-grey" decorative orientation="vertical" />
      <ToolButtonWithTooltip label={'undo'} onClick={undo} id="TD-PrimaryTools-Undo">
        <SvgUndo />
      </ToolButtonWithTooltip>
      <ToolButtonWithTooltip label={'redo'} onClick={redo} id="TD-PrimaryTools-Redo">
        <SvgRedo />
      </ToolButtonWithTooltip>
    </StyledPanel>
  );
});

const StyledPanel = styled(Panel, {
  borderRadius: '20px',
  variants: {
    bp: {
      small: {
        padding: '$2 $5',
      },
    },
  },
});
