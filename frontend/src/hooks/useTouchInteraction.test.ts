import { renderHook, act } from '@testing-library/react';
import { useTouchInteraction, useLongPress, useDoubleTap, useSwipe } from './useTouchInteraction';

describe('useTouchInteraction', () => {
  test('should initialize with correct default values', () => {
    const { result } = renderHook(() => useTouchInteraction());
    
    expect(result.current.isPressed).toBe(false);
    expect(result.current.isHovered).toBe(false);
  });

  test('should update isPressed on touchStart and touchEnd', () => {
    const { result } = renderHook(() => useTouchInteraction());
    
    act(() => {
      result.current.touchStart({} as React.TouchEvent | React.MouseEvent);
    });
    
    expect(result.current.isPressed).toBe(true);
    
    act(() => {
      result.current.touchEnd({} as React.TouchEvent | React.MouseEvent);
    });
    
    expect(result.current.isPressed).toBe(false);
  });
});

describe('useLongPress', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should call callback after delay', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useLongPress(callback, 500));
    
    act(() => {
      result.current.startPress();
    });
    
    act(() => {
      jest.advanceTimersByTime(500);
    });
    
    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.isLongPress).toBe(true);
  });

  test('should not call callback if cancelled', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useLongPress(callback, 500));
    
    act(() => {
      result.current.startPress();
    });
    
    act(() => {
      jest.advanceTimersByTime(250);
      result.current.cancelPress();
    });
    
    expect(callback).toHaveBeenCalledTimes(0);
    expect(result.current.isLongPress).toBe(false);
  });
});

describe('useDoubleTap', () => {
  test('should call callback on double tap', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDoubleTap(callback, 300));
    
    // Mock Date.now to control timing
    const now = Date.now();
    jest.spyOn(global.Date, 'now').mockImplementation(() => now);
    
    act(() => {
      result.current.handleTap();
    });
    
    // Advance time and tap again
    jest.spyOn(global.Date, 'now').mockImplementation(() => now + 200);
    
    act(() => {
      result.current.handleTap();
    });
    
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe('useSwipe', () => {
  test('should call swipeLeft callback', () => {
    const onSwipeLeft = jest.fn();
    const { result } = renderHook(() => useSwipe(onSwipeLeft));
    
    const touchStartEvent = {
      touches: [{ clientX: 100, clientY: 50 }]
    } as unknown as React.TouchEvent;
    
    const touchEndEvent = {
      changedTouches: [{ clientX: 50, clientY: 50 }]
    } as unknown as React.TouchEvent;
    
    act(() => {
      result.current.swipeEvents.onTouchStart(touchStartEvent);
      result.current.swipeEvents.onTouchEnd(touchEndEvent);
    });
    
    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
  });
});