import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import React from 'react';

import { AlignStyle, ColorStyle, DashStyle, FontStyle, ShapeStyles, SizeStyle } from '@tldraw/tldraw';
import { DMContent, DMRadioItem } from 'components/Primitives/DropdownMenu';
import { ToolButton } from 'components/Primitives/ToolButton';
import {
  ALIGN_ICONS,
  ColorGrid,
  currentStyleSelector,
  DASH_ICONS,
  FontIcon,
  optionsSelector,
  selectedIdsSelector,
  SIZE_ICONS,
  StyledGroup,
  STYLE_KEYS,
  themeSelector,
} from 'components/ToolsPanel/StyleMenu';
import { useTldrawApp } from 'hooks/useTldrawApp';
import { CircleIcon } from 'icons/CircleIcon';
import SvgTransparency from 'icons/Transparency';
import SvgTrash from 'icons/Trash';
import { fills, strokes } from 'state/shapes/shared';
import { breakpoints } from 'utils/breakpoints';
import { preventEvent } from 'utils/preventEvent';
import { useTrawApp } from 'hooks';

interface EditWidgetProps {
  camera: {
    point: number[];
    zoom: number;
  };
  top: number;
  left: number;
}

const EditWidget = ({ camera, top, left }: EditWidgetProps) => {
  const trawApp = useTrawApp();
  const app = useTldrawApp();

  const theme = app.useStore(themeSelector);

  const options = app.useStore(optionsSelector);

  const currentStyle = app.useStore(currentStyleSelector);

  const selectedIds = app.useStore(selectedIdsSelector);

  const [displayedStyle, setDisplayedStyle] = React.useState(currentStyle);
  const rDisplayedStyle = React.useRef(currentStyle);

  React.useEffect(() => {
    const {
      appState: { currentStyle },
      page,
      selectedIds,
    } = app;
    let commonStyle = {} as ShapeStyles;
    if (selectedIds.length <= 0) {
      commonStyle = currentStyle;
    } else {
      const overrides = new Set<string>([]);
      app.selectedIds
        .map((id) => page.shapes[id])
        .forEach((shape) => {
          STYLE_KEYS.forEach((key) => {
            if (overrides.has(key)) return;
            if (commonStyle[key] === undefined) {
              // @ts-ignore
              commonStyle[key] = shape.style[key];
            } else {
              if (commonStyle[key] === shape.style[key]) return;
              // @ts-ignore
              commonStyle[key] = shape.style[key];
              overrides.add(key);
            }
          });
        });
    }
    // Until we can work out the correct logic for deciding whether or not to
    // update the selected style, do a string comparison. Yuck!
    if (JSON.stringify(commonStyle) !== JSON.stringify(rDisplayedStyle.current)) {
      rDisplayedStyle.current = commonStyle;
      setDisplayedStyle(commonStyle);
    }
  }, [currentStyle, selectedIds, app]);

  const handleDashChange = React.useCallback(
    (value: string) => {
      app.style({ dash: value as DashStyle });
    },
    [app],
  );

  const handleSizeChange = React.useCallback(
    (value: string) => {
      app.style({ size: value as SizeStyle });
    },
    [app],
  );

  const handleFontChange = React.useCallback(
    (value: string) => {
      app.style({ font: value as FontStyle });
    },
    [app],
  );

  const handleTextAlignChange = React.useCallback(
    (value: string) => {
      app.style({ textAlign: value as AlignStyle });
    },
    [app],
  );

  const handleToggleFilled = React.useCallback(() => {
    app.style({ isFilled: rDisplayedStyle.current.isFilled ? false : true });
  }, [app]);

  const handleDelete = React.useCallback(() => {
    app.delete();
  }, [app]);

  const handleFitScreen = React.useCallback(() => {
    trawApp.zoomToFit();
  }, [trawApp]);

  return (
    <div
      style={{
        top: (top + camera.point[1]) * camera.zoom,
        left: (left + camera.point[0]) * camera.zoom,
      }}
      className={`z-10 absolute`}
    >
      <div className="absolute -top-[52px] bg-white rounded-xl shadow-[0_10px_60px_rgba(189,188,249,0.5)]">
        <ul className="flex p-2 gap-2 items-center">
          <li>
            <ToolButton variant="icon" onClick={handleFitScreen}>
              <MagnifyingGlassIcon />
            </ToolButton>
          </li>
          <li>
            <DropdownMenu.Root dir="ltr" modal={false}>
              <DropdownMenu.Trigger asChild id="TD-Styles">
                <ToolButton variant="icon">
                  <CircleIcon
                    size={18}
                    strokeWidth={2.5}
                    fill="transparent"
                    stroke={strokes.light[rDisplayedStyle.current.color as ColorStyle]}
                  />
                </ToolButton>
              </DropdownMenu.Trigger>
              <DMContent id="language-menu" side="top" align="center" sideOffset={10} alignOffset={0}>
                <ColorGrid>
                  {Object.keys(strokes.light).map((style: string) => (
                    <DropdownMenu.Item
                      key={style}
                      onSelect={preventEvent}
                      asChild
                      id={`TD-Styles-Color-Swatch-${style}`}
                    >
                      <ToolButton
                        variant="icon"
                        isActive={displayedStyle.color === style}
                        onClick={() => app.style({ color: style as ColorStyle })}
                      >
                        <CircleIcon
                          size={18}
                          strokeWidth={2.5}
                          fill={displayedStyle.isFilled ? fills[theme][style as ColorStyle] : 'transparent'}
                          stroke={strokes.light[style as ColorStyle]}
                        />
                      </ToolButton>
                    </DropdownMenu.Item>
                  ))}
                </ColorGrid>
              </DMContent>
            </DropdownMenu.Root>
          </li>
          {options !== 'text' && (
            <li>
              <ToolButton variant="icon" onClick={handleToggleFilled}>
                {displayedStyle.isFilled ? (
                  <CircleIcon
                    size={18}
                    strokeWidth={2.5}
                    fill={
                      displayedStyle.isFilled
                        ? fills[theme][rDisplayedStyle.current.color as ColorStyle]
                        : 'transparent'
                    }
                    stroke={strokes.light[rDisplayedStyle.current.color as ColorStyle]}
                  />
                ) : (
                  <SvgTransparency />
                )}
              </ToolButton>
            </li>
          )}
          {options !== 'text' && options !== 'label' && (
            <li>
              <DropdownMenu.Root dir="ltr" modal={false}>
                <DropdownMenu.Trigger asChild id="TD-Styles">
                  <ToolButton variant="icon">{DASH_ICONS[rDisplayedStyle.current.dash as DashStyle]}</ToolButton>
                </DropdownMenu.Trigger>
                <DMContent id="language-menu" side="top" align="center" sideOffset={10} alignOffset={0}>
                  <StyledGroup dir="ltr" value={displayedStyle.dash} onValueChange={handleDashChange}>
                    {Object.values(DashStyle).map((style) => (
                      <DMRadioItem
                        key={style}
                        isActive={style === displayedStyle.dash}
                        value={style}
                        onSelect={preventEvent}
                        bp={breakpoints}
                        id={`TD-Styles-Dash-${style}`}
                      >
                        {DASH_ICONS[style as DashStyle]}
                      </DMRadioItem>
                    ))}
                  </StyledGroup>
                </DMContent>
              </DropdownMenu.Root>
            </li>
          )}

          <li>
            <DropdownMenu.Root dir="ltr" modal={false}>
              <DropdownMenu.Trigger asChild id="TD-Styles">
                <ToolButton variant="icon">{SIZE_ICONS[rDisplayedStyle.current.size as SizeStyle]}</ToolButton>
              </DropdownMenu.Trigger>
              <DMContent id="language-menu" side="top" align="center" sideOffset={10} alignOffset={0}>
                <StyledGroup dir="ltr" value={displayedStyle.size} onValueChange={handleSizeChange}>
                  {Object.values(SizeStyle).map((sizeStyle) => (
                    <DMRadioItem
                      key={sizeStyle}
                      isActive={sizeStyle === displayedStyle.size}
                      value={sizeStyle}
                      onSelect={preventEvent}
                      bp={breakpoints}
                      id={`TD-Styles-Dash-${sizeStyle}`}
                    >
                      {SIZE_ICONS[sizeStyle as SizeStyle]}
                    </DMRadioItem>
                  ))}
                </StyledGroup>
              </DMContent>
            </DropdownMenu.Root>
          </li>
          {(options === 'text' || options === 'label') && (
            <>
              <li id="TD-Styles-Font-Container">
                <DropdownMenu.Root dir="ltr" modal={false}>
                  <DropdownMenu.Trigger asChild id="TD-Styles">
                    <ToolButton variant="icon">
                      <FontIcon fontStyle={rDisplayedStyle.current.font}>Aa</FontIcon>
                    </ToolButton>
                  </DropdownMenu.Trigger>
                  <DMContent id="language-menu" side="top" align="center" sideOffset={10} alignOffset={0}>
                    <StyledGroup dir="ltr" value={displayedStyle.font} onValueChange={handleFontChange}>
                      {Object.values(FontStyle).map((fontStyle) => (
                        <DMRadioItem
                          key={fontStyle}
                          isActive={fontStyle === displayedStyle.font}
                          value={fontStyle}
                          onSelect={preventEvent}
                          bp={breakpoints}
                          id={`TD-Styles-Font-${fontStyle}`}
                        >
                          <FontIcon fontStyle={fontStyle}>Aa</FontIcon>
                        </DMRadioItem>
                      ))}
                    </StyledGroup>
                  </DMContent>
                </DropdownMenu.Root>
              </li>
              {options === 'text' && rDisplayedStyle.current.textAlign && (
                <li>
                  <DropdownMenu.Root dir="ltr" modal={false}>
                    <DropdownMenu.Trigger asChild id="TD-Styles">
                      <ToolButton variant="icon">{ALIGN_ICONS[rDisplayedStyle.current.textAlign]}</ToolButton>
                    </DropdownMenu.Trigger>
                    <DMContent id="language-menu" side="top" align="center" sideOffset={10} alignOffset={0}>
                      <StyledGroup dir="ltr" value={displayedStyle.textAlign} onValueChange={handleTextAlignChange}>
                        {Object.values(AlignStyle).map((style) => (
                          <DMRadioItem
                            key={style}
                            isActive={style === displayedStyle.textAlign}
                            value={style}
                            onSelect={preventEvent}
                            bp={breakpoints}
                            id={`TD-Styles-Align-${style}`}
                          >
                            {ALIGN_ICONS[style]}
                          </DMRadioItem>
                        ))}
                      </StyledGroup>
                    </DMContent>
                  </DropdownMenu.Root>
                </li>
              )}
            </>
          )}
          <li>
            <ToolButton variant="icon" onClick={handleDelete}>
              <SvgTrash />
            </ToolButton>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default EditWidget;
