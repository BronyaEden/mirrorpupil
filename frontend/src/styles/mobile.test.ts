import { mobileStyles, safeArea, gestureSupport } from './mobile';

describe('Mobile Styles', () => {
  test('mobileStyles object is defined', () => {
    expect(mobileStyles).toBeDefined();
    expect(mobileStyles.buttonOptimized).toBeDefined();
    expect(mobileStyles.inputOptimized).toBeDefined();
  });

  test('safeArea object is defined', () => {
    expect(safeArea).toBeDefined();
    expect(safeArea.top).toBeDefined();
    expect(safeArea.bottom).toBeDefined();
  });

  test('gestureSupport object is defined', () => {
    expect(gestureSupport).toBeDefined();
    expect(gestureSupport.preventDefault).toBeDefined();
    expect(gestureSupport.scrollContainer).toBeDefined();
  });
});