import 'styled-components';
import { theme } from '../styles/theme';

// 扩展 styled-components 的 DefaultTheme 接口
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: typeof theme.colors;
    spacing: typeof theme.spacing;
    borderRadius: typeof theme.borderRadius;
    shadows: typeof theme.shadows;
    transitions: typeof theme.transitions;
    zIndex: typeof theme.zIndex;
    breakpoints: typeof theme.breakpoints;
    animations: typeof theme.animations;
  }
}