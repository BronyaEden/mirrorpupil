import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/authSlice';

interface GlobalHeaderProps {
  onMenuClick?: () => void;
}

const GlobalHeader: React.FC<GlobalHeaderProps> = ({ onMenuClick }) => {
  const headerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
  };

  const handleFileSearch = (value: string) => {
    if (value.trim()) {
      navigate(`/files?search=${encodeURIComponent(value)}`);
    }
  };

  const handleUserSearch = () => {
    navigate('/search');
  };

  // 创建固定Header的内容
  const headerContent = (
    <div
      ref={headerRef}
      style={{
        /* 强制固定定位，绕过所有可能的干扰 */
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        zIndex: '999999', // 极高的z-index
        width: '100%',
        height: '64px',
        padding: '0 24px',
        
        /* 美化样式 */
        background: 'linear-gradient(135deg, rgba(26, 35, 50, 0.95) 0%, rgba(42, 52, 65, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 217, 255, 0.2)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 40px rgba(0, 217, 255, 0.1)',
        
        /* 布局 */
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        
        /* 防止被其他元素影响 */
        isolation: 'isolate',
        transform: 'translateZ(0)', // 创建新的层叠上下文
      }}
    >
      {/* 左侧：Logo和导航 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: '0 0 auto' }}>
        <div 
          onClick={() => navigate('/')}
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #FF0080 0%, #00FFFF 50%, #FFFF00 100%)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            cursor: 'pointer',
            textShadow: '0 0 20px rgba(0, 217, 255, 0.5)',
            animation: 'logo-glow 3s ease-in-out infinite',
          }}
        >
          镜瞳OVO
        </div>
        
        {/* 导航链接 */}
        <div style={{ display: 'flex', gap: '24px' }}>
          {[
            { path: '/', label: '首页', icon: '🏠' },
            { path: '/files', label: '文件', icon: '📁' },
            ...(isAuthenticated ? [
              { path: '/upload', label: '上传', icon: '☁️' },
              { path: '/messages', label: '消息', icon: '💬' }  // 添加消息链接
            ] : []),
            { path: '/profile', label: '个人中心', icon: '👤' }
          ].map(item => (
            <a
              key={item.path}
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                navigate(item.path);
              }}
              style={{
                color: location.pathname === item.path ? '#00FFFF' : 'rgba(255, 255, 255, 0.8)',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                padding: '8px 16px',
                borderRadius: '8px',
                background: location.pathname === item.path ? 'rgba(0, 255, 255, 0.15)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#00FFFF';
                e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)';
                e.currentTarget.style.textShadow = '0 0 10px rgba(0, 255, 255, 0.5)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                if (location.pathname !== item.path) {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.textShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </a>
          ))}
        </div>
      </div>

      {/* 中间：搜索框 */}
      <div style={{ flex: '1', maxWidth: '400px', margin: '0 24px', display: 'flex', gap: '12px' }}>
        <input
          type="text"
          placeholder="搜索文件..."
          style={{
            flex: 1,
            padding: '8px 16px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(0, 217, 255, 0.3)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            outline: 'none',
            transition: 'all 0.3s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.borderColor = '#00FFFF';
            e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.3)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleFileSearch(e.currentTarget.value);
            }
          }}
        />
        <button
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(0, 217, 255, 0.3)',
            color: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '8px',
            padding: '8px 12px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)';
            e.currentTarget.style.borderColor = '#00FFFF';
            e.currentTarget.style.color = '#00FFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
          }}
          onClick={handleUserSearch}
        >
          <span>👤</span>
          搜索用户
        </button>
      </div>

      {/* 右侧：用户操作 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '0 0 auto' }}>
        {isAuthenticated ? (
          <>
            <button
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(0, 217, 255, 0.3)',
                color: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 255, 0.2)';
                e.currentTarget.style.borderColor = '#00FFFF';
                e.currentTarget.style.color = '#00FFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.3)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
              }}
              onClick={handleLogout}
            >
              退出
            </button>
          </>
        ) : (
          <button
            style={{
              background: 'linear-gradient(45deg, #00FFFF, #FF0080)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              color: '#fff',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0, 255, 255, 0.3)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(45deg, #FF0080, #00FFFF)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 0, 128, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(45deg, #00FFFF, #FF0080)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 255, 255, 0.3)';
            }}
            onClick={() => navigate('/auth')}
          >
            登录
          </button>
        )}
      </div>
    </div>
  );

  // 使用Portal将Header渲染到body
  useEffect(() => {
    // 添加logo动画样式
    const style = document.createElement('style');
    style.textContent = `
      @keyframes logo-glow {
        0%, 100% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  // 直接使用Portal渲染到body，绕过所有React容器
  return ReactDOM.createPortal(headerContent, document.body);
};

export default GlobalHeader;