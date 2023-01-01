import {
  Arrow,
  Draw,
  Ellipse,
  Group,
  Rectangle,
  Sticky,
  TDShapeType,
  Triangle,
  Video,
  Text,
  Image,
} from '@tldraw/tldraw';

export const shapeUtils = {
  [TDShapeType.Rectangle]: Rectangle,
  [TDShapeType.Triangle]: Triangle,
  [TDShapeType.Ellipse]: Ellipse,
  [TDShapeType.Draw]: Draw,
  [TDShapeType.Arrow]: Arrow,
  [TDShapeType.Text]: Text,
  [TDShapeType.Group]: Group,
  [TDShapeType.Sticky]: Sticky,
  [TDShapeType.Image]: Image,
  [TDShapeType.Video]: Video,
};
