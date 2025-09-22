import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: React.ReactNode;
}

// 页面过渡动画变体
export const pageVariants = {
  initial: {
    opacity: 0,
    x: -20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    x: 20,
    scale: 0.98
  }
};

export const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3
};

// 淡入淡出动画
export const fadeVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};

// 滑动动画
export const slideVariants = {
  initial: { x: '100%' },
  in: { x: 0 },
  out: { x: '-100%' }
};

// 缩放动画
export const scaleVariants = {
  initial: { scale: 0.8, opacity: 0 },
  in: { scale: 1, opacity: 1 },
  out: { scale: 1.1, opacity: 0 }
};

// 弹性动画
export const bounceVariants = {
  initial: { y: -100, opacity: 0 },
  in: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20
    }
  },
  out: { y: 100, opacity: 0 }
};

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%'
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// 高阶组件，用于包装页面组件
export const withPageTransition = (Component: React.ComponentType<any>) => {
  return (props: any) => (
    <PageTransition>
      <Component {...props} />
    </PageTransition>
  );
};

// 卡片动画组件
export const AnimatedCard: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{
      duration: 0.3,
      delay,
      ease: 'easeOut'
    }}
    whileHover={{
      scale: 1.02,
      transition: { duration: 0.2 }
    }}
    whileTap={{ scale: 0.98 }}
  >
    {children}
  </motion.div>
);

// 列表项动画组件
export const AnimatedListItem: React.FC<{
  children: React.ReactNode;
  index: number;
  className?: string;
}> = ({ children, index, className }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    transition={{
      duration: 0.3,
      delay: index * 0.1,
      ease: 'easeOut'
    }}
    layout
  >
    {children}
  </motion.div>
);

// 浮动按钮动画组件
export const AnimatedFloatingButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({ children, onClick, className }) => (
  <motion.button
    className={className}
    onClick={onClick}
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    exit={{ scale: 0 }}
    whileHover={{ 
      scale: 1.1,
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
    }}
    whileTap={{ scale: 0.9 }}
    transition={{
      type: 'spring',
      stiffness: 400,
      damping: 17
    }}
  >
    {children}
  </motion.button>
);

// 模态框动画组件
export const AnimatedModal: React.FC<{
  children: React.ReactNode;
  isVisible: boolean;
  onClose?: () => void;
  className?: string;
}> = ({ children, isVisible, onClose, className }) => (
  <AnimatePresence>
    {isVisible && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000
          }}
          onClick={onClose}
        />
        <motion.div
          className={className}
          initial={{ opacity: 0, scale: 0.8, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30
          }}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1001
          }}
        >
          {children}
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export default PageTransition;