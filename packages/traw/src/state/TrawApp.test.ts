import { SLIDE_WIDTH } from '../constants';
import { convertCameraTRtoTD } from './TrawApp';

describe('TrawApp', () => {
  it('should convert TR camera to TD camera correctly', () => {
    const tldrawCamera = convertCameraTRtoTD({ center: { x: 0, y: 0 }, zoom: 1 }, { width: 1000, height: 1000 });

    expect(tldrawCamera).toEqual({
      point: [800, 800],
      zoom: 1000 / SLIDE_WIDTH,
    });
  });
});
