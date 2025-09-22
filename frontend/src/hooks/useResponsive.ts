import { useState, useEffect } from 'react';
import { breakpoints } from '../styles/responsive';

// 设备类型检测
export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type ScreenSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// 检测设备类型
export const useDeviceType = (): DeviceType => {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      
      if (width < parseInt(breakpoints.sm)) {
        setDeviceType('mobile');
      } else if (width < parseInt(breakpoints.md)) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  return deviceType;
};

// 屏幕尺寸检测
export const useScreenSize = (): ScreenSize => {
  const [screenSize, setScreenSize] = useState<ScreenSize>('lg');

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      
      if (width < parseInt(breakpoints.xs)) {
        setScreenSize('xs');
      } else if (width < parseInt(breakpoints.sm)) {
        setScreenSize('sm');
      } else if (width < parseInt(breakpoints.md)) {
        setScreenSize('md');
      } else if (width < parseInt(breakpoints.lg)) {
        setScreenSize('lg');
      } else {
        setScreenSize('xl');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return screenSize;
};

// 媒体查询Hook
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const updateMatch = () => setMatches(media.matches);
    
    updateMatch();
    media.addEventListener('change', updateMatch);
    
    return () => media.removeEventListener('change', updateMatch);
  }, [query]);

  return matches;
};

// 常用媒体查询Hook
export const useBreakpoint = () => {
  const isMobile = useMediaQuery(`(max-width: ${breakpoints.sm})`);
  const isTablet = useMediaQuery(`(min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.md})`);
  const isDesktop = useMediaQuery(`(min-width: ${breakpoints.md})`);
  const isLargeScreen = useMediaQuery(`(min-width: ${breakpoints.lg})`);
  const isXLargeScreen = useMediaQuery(`(min-width: ${breakpoints.xl})`);
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeScreen,
    isXLargeScreen,
  };
};

// 触摸设备检测
export const useTouchDevice = (): boolean => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
      );
    };

    checkTouchDevice();
  }, []);

  return isTouchDevice;
};

// 屏幕方向检测
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');

  useEffect(() => {
    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return orientation;
};

// 窗口尺寸Hook
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// 滚动位置Hook
export const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState({
    x: window.pageXOffset,
    y: window.pageYOffset,
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition({
        x: window.pageXOffset,
        y: window.pageYOffset,
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollPosition;
};

// 视口检测Hook
export const useViewport = () => {
  const windowSize = useWindowSize();
  const scrollPosition = useScrollPosition();
  const deviceType = useDeviceType();
  const screenSize = useScreenSize();
  const orientation = useOrientation();
  const isTouchDevice = useTouchDevice();
  const breakpoint = useBreakpoint();

  return {
    ...windowSize,
    ...scrollPosition,
    deviceType,
    screenSize,
    orientation,
    isTouchDevice,
    ...breakpoint,
  };
};

// 响应式值Hook
export const useResponsiveValue = <T>(values: {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  default?: T;
}): T => {
  const screenSize = useScreenSize();
  
  return values[screenSize] || values.default || values.xl || values.lg || values.md || values.sm || values.xs as T;
};

// PWA相关Hook
export const usePWA = () => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    // 检测是否为独立应用模式
    setIsStandalone(
      // @ts-ignore
      window.navigator.standalone ||
      window.matchMedia('(display-mode: standalone)').matches
    );

    // 监听安装提示事件
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const promptInstall = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const result = await installPrompt.userChoice;
      setInstallPrompt(null);
      return result;
    }
    return null;
  };

  return {
    isStandalone,
    canInstall: !!installPrompt,
    promptInstall,
  };
};

// 网络状态检测
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 检测连接类型
    // @ts-ignore
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      setConnectionType(connection.effectiveType || 'unknown');
      
      const handleConnectionChange = () => {
        setConnectionType(connection.effectiveType || 'unknown');
      };
      
      connection.addEventListener('change', handleConnectionChange);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        connection.removeEventListener('change', handleConnectionChange);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    connectionType,
    isSlowConnection: connectionType === 'slow-2g' || connectionType === '2g',
  };
};

// 设备信息检测
export const useDeviceInfo = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    javaEnabled: navigator.javaEnabled(),
  });

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
  const isChrome = /Chrome/.test(navigator.userAgent);
  const isFirefox = /Firefox/.test(navigator.userAgent);
  const isEdge = /Edge/.test(navigator.userAgent);

  return {
    ...deviceInfo,
    isIOS,
    isAndroid,
    isSafari,
    isChrome,
    isFirefox,
    isEdge,
    isMobile: isIOS || isAndroid,
  };
};