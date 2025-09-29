import { useState, useEffect, useRef } from 'react';

// 触摸交互状态
export interface TouchInteractionState {
  isPressed: boolean;
  isHovered: boolean;
  touchStart: (e: React.TouchEvent | React.MouseEvent) => void;
  touchEnd: (e: React.TouchEvent | React.MouseEvent) => void;
  mouseEnter: (e: React.MouseEvent) => void;
  mouseLeave: (e: React.MouseEvent) => void;
}

// 触摸交互Hook
export const useTouchInteraction = (): TouchInteractionState => {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isTouchDevice = useRef(false);

  // 检测是否为触摸设备
  useEffect(() => {
    isTouchDevice.current = (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore
      navigator.msMaxTouchPoints > 0
    );
  }, []);

  // 触摸开始事件
  const touchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsPressed(true);
  };

  // 触摸结束事件
  const touchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    setIsPressed(false);
  };

  // 鼠标进入事件
  const mouseEnter = (e: React.MouseEvent) => {
    // 仅在非触摸设备上触发hover效果
    if (!isTouchDevice.current) {
      setIsHovered(true);
    }
  };

  // 鼠标离开事件
  const mouseLeave = (e: React.MouseEvent) => {
    // 仅在非触摸设备上触发hover效果
    if (!isTouchDevice.current) {
      setIsHovered(false);
    }
  };

  return {
    isPressed,
    isHovered,
    touchStart,
    touchEnd,
    mouseEnter,
    mouseLeave
  };
};

// 长按交互Hook
export const useLongPress = (callback: () => void, delay = 500) => {
  const [isLongPress, setIsLongPress] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startPress = () => {
    setIsLongPress(false);
    timeoutRef.current = setTimeout(() => {
      setIsLongPress(true);
      callback();
    }, delay);
  };

  const endPress = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const cancelPress = () => {
    endPress();
    setIsLongPress(false);
  };

  return {
    isLongPress,
    startPress,
    endPress,
    cancelPress,
    longPressEvents: {
      onTouchStart: startPress,
      onTouchEnd: endPress,
      onTouchCancel: cancelPress,
      onMouseDown: startPress,
      onMouseUp: endPress,
      onMouseLeave: cancelPress
    }
  };
};

// 双击交互Hook
export const useDoubleTap = (callback: () => void, delay = 300) => {
  const [lastTap, setLastTap] = useState<number>(0);

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTap < delay) {
      callback();
    }
    setLastTap(now);
  };

  return {
    handleTap,
    doubleTapEvents: {
      onClick: handleTap,
      onTouchEnd: handleTap
    }
  };
};

// 滑动手势Hook
export const useSwipe = (
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  threshold = 50
) => {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY
    });
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // 检查是否为有效的滑动（主要方向移动距离大于阈值）
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      // 水平滑动
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > threshold) {
      // 垂直滑动
      if (deltaY > 0) {
        onSwipeDown?.();
      } else {
        onSwipeUp?.();
      }
    }

    setTouchStart(null);
  };

  return {
    swipeEvents: {
      onTouchStart,
      onTouchEnd
    }
  };
};