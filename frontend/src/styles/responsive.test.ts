import { breakpoints, mediaQuery } from './responsive';

describe('Responsive Utilities', () => {
  test('breakpoints are defined correctly', () => {
    expect(breakpoints).toEqual({
      xs: '480px',
      sm: '768px',
      md: '1024px',
      lg: '1280px',
      xl: '1920px',
    });
  });

  test('mediaQuery functions generate correct CSS', () => {
    const testStyles = 'color: red;';
    const mobileQuery = mediaQuery.mobile(testStyles);
    expect(mobileQuery).toContain('@media (max-width: 768px)');
    expect(mobileQuery).toContain('color: red;');
  });

  test('mediaQuery touch function generates correct CSS', () => {
    const testStyles = 'padding: 12px;';
    const touchQuery = mediaQuery.touch(testStyles);
    expect(touchQuery).toContain('@media (hover: none) and (pointer: coarse)');
    expect(touchQuery).toContain('padding: 12px;');
  });
});