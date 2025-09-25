import React from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import type { Container, Engine } from '@tsparticles/engine';
import { loadSlim } from '@tsparticles/slim';

interface ParticleBackgroundProps {
  className?: string;
  style?: React.CSSProperties;
  performanceMode?: 'high' | 'low';
}

const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ className, style, performanceMode = 'high' }) => {
  const [init, setInit] = React.useState(false);

  // 只在组件挂载时初始化粒子引擎
  React.useEffect(() => {
    if (!init) {
      initParticlesEngine(async (engine: Engine) => {
        await loadSlim(engine);
      }).then(() => {
        setInit(true);
      });
    }
  }, []); // 移除init依赖，确保只在组件挂载时执行一次

  const particlesLoaded = React.useCallback(async (container?: Container): Promise<void> => {
    // 移除日志输出，避免产生过多日志
    // console.log('Particles container loaded', container);
  }, []);

  // 根据性能模式调整参数
  const getParticleOptions = React.useMemo(() => {
    return performanceMode === 'high' ? {
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: "push" as const,
          },
          onHover: {
            enable: true,
            mode: "repulse" as const,
          },
        },
        modes: {
          push: {
            quantity: 4,
          },
          repulse: {
            distance: 150,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#feca57", "#ff9ff3", "#667eea"],
        },
        links: {
          color: "#ffffff",
          distance: 150,
          enable: true,
          opacity: 0.4,
          width: 1,
        },
        move: {
          direction: "none" as const,
          enable: true,
          outModes: {
            default: "bounce" as const,
          },
          random: true,
          speed: 2,
          straight: false,
        },
        number: {
          density: {
            enable: true,
            area: 800,
          },
          value: 50,
        },
        opacity: {
          value: 0.5,
          random: true,
          anim: {
            enable: true,
            speed: 0.05,
            opacity_min: 0.2,
            sync: false,
          },
        },
        shape: {
          type: "circle" as const,
        },
        size: {
          value: { min: 2, max: 3 },
          random: true,
          anim: {
            enable: true,
            speed: 0.1,
            size_min: 1.5,
            sync: false,
          },
        },
      },
      detectRetina: true,
    } : {
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 30,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: "push" as const,
          },
          onHover: {
            enable: true,
            mode: "repulse" as const,
          },
        },
        modes: {
          push: {
            quantity: 2,
          },
          repulse: {
            distance: 100,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: ["#ff6b6b", "#4ecdc4", "#667eea"],
        },
        links: {
          color: "#ffffff",
          distance: 150,
          enable: true,
          opacity: 0.3,
          width: 1,
        },
        move: {
          direction: "none" as const,
          enable: true,
          outModes: {
            default: "bounce" as const,
          },
          random: true,
          speed: 0.1,
          straight: false,
        },
        number: {
          density: {
            enable: true,
            area: 1000,
          },
          value: 25,
        },
        opacity: {
          value: 0.5,
          random: true,
          anim: {
            enable: true,
            speed: 0.02,
            opacity_min: 0.1,
            sync: false,
          },
        },
        shape: {
          type: "circle" as const,
        },
        size: {
          value: { min: 1.5, max: 2.5 },
          random: true,
          anim: {
            enable: true,
            speed: 0.05,
            size_min: 1,
            sync: false,
          },
        },
      },
      detectRetina: true,
    };
  }, [performanceMode]);

  if (!init) {
    return null;
  }

  return (
    <Particles
      className={className}
      style={style}
      particlesLoaded={particlesLoaded}
      options={getParticleOptions}
    />
  );
};

export default ParticleBackground;