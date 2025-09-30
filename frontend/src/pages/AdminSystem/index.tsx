import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Button,
  Table,
  Tag,
  Typography,
  Progress,
  Alert,
  Timeline,
  Badge,
  Spin
} from 'antd';
import {
  CloudServerOutlined,
  DatabaseOutlined,
  WifiOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  ClockCircleOutlined,
  ApiOutlined,
  MonitorOutlined,
  SecurityScanOutlined,
  InfoCircleOutlined,
  BugOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import adminAPI from '../../utils/api/admin';

// 初始化 dayjs
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

// 样式组件
const AdminContainer = styled.div`
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  
  // 移动端优化 - 更紧凑
  @media (max-width: 768px) {
    padding: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 8px;
  }
`;

const StatsCard = styled(Card)`
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  
  .ant-card-body {
    padding: 20px;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
  }
  
  // 移动端优化 - 更紧凑
  @media (max-width: 768px) {
    margin-bottom: 16px;
    
    .ant-card-body {
      padding: 16px 12px;
    }
  }
  
  @media (max-width: 480px) {
    margin-bottom: 12px;
    
    .ant-card-body {
      padding: 12px 8px;
    }
  }
`;

const StatusTag = styled(Tag)`
  border-radius: 12px;
  padding: 2px 8px;
  font-weight: 500;
  
  // 移动端优化 - 更紧凑
  @media (max-width: 768px) {
    padding: 1px 6px;
    font-size: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 0 4px;
    font-size: 11px;
  }
`;

const LogCard = styled(Card)`
  margin-top: 24px;
  
  // 移动端优化 - 更紧凑
  @media (max-width: 768px) {
    margin-top: 16px;
  }
  
  @media (max-width: 480px) {
    margin-top: 12px;
  }
`;

// 移动端统计卡片优化
const MobileStatsCard = styled(Card)`
  margin-bottom: 12px;
  
  .ant-card-body {
    padding: 12px 8px;
  }
  
  .ant-typography {
    font-size: 12px;
  }
  
  .stats-value {
    font-size: 14px !important;
  }
`;

// 移动端表格优化
const MobileTable = styled(Table)`
  // 移动端优化 - 更紧凑
  @media (max-width: 768px) {
    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td {
      padding: 8px 4px;
      font-size: 12px;
    }
  }
  
  @media (max-width: 480px) {
    .ant-table-thead > tr > th,
    .ant-table-tbody > tr > td {
      padding: 6px 3px;
      font-size: 11px;
    }
  }
`;

// 移动端进度条优化
const MobileProgress = styled(Progress)`
  @media (max-width: 768px) {
    .ant-progress-text {
      font-size: 12px;
    }
  }
  
  @media (max-width: 480px) {
    .ant-progress-text {
      font-size: 11px;
    }
  }
`;

// 接口定义
interface SystemStatus {
  server: {
    status: 'online' | 'offline' | 'warning' | 'unknown';
    uptime: number;
    memory: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    cpu: {
      user: number;
      system: number;
    };
  };
  database: {
    status: 'connected' | 'disconnected' | 'warning' | 'unknown';
    connections: number;
  };
  redis: {
    status: 'connected' | 'disconnected' | 'warning' | 'unknown';
    connections: number;
  };
}

interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  userId?: string;
  ip?: string;
}

const AdminSystem: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    server: {
      status: 'unknown',
      uptime: 0,
      memory: {
        rss: 0,
        heapTotal: 0,
        heapUsed: 0,
        external: 0
      },
      cpu: {
        user: 0,
        system: 0
      }
    },
    database: {
      status: 'unknown',
      connections: 0
    },
    redis: {
      status: 'unknown',
      connections: 0
    }
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  
  // 检测是否为移动端
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 加载系统状态
  useEffect(() => {
    console.log('AdminSystem - Component mounted, loading system status');
    loadSystemStatus();
    loadSystemLogs();
  }, []);

  const loadSystemStatus = async () => {
    console.log('AdminSystem - Loading system status');
    setLoading(true);
    setError(null);
    try {
      const response = await adminAPI.getSystemStatus();
      console.log('AdminSystem - System status response:', response);
      if (response.data.success) {
        setSystemStatus(response.data.data);
      } else {
        setError(response.data.message || '获取系统状态失败');
      }
    } catch (error: any) {
      console.error('加载系统状态失败:', error);
      setError(error.response?.data?.message || error.message || '加载系统状态失败');
    } finally {
      setLoading(false);
    }
  };

  const loadSystemLogs = async (page: number = 1) => {
    console.log('AdminSystem - Loading system logs, page:', page);
    try {
      const response = await adminAPI.getSystemLogs({
        page,
        limit: pagination.limit
      });
      console.log('AdminSystem - System logs response:', response);
      if (response.data.success) {
        const data = response.data.data;
        setLogs(data.logs);
        setPagination({
          page: data.pagination.page,
          limit: data.pagination.limit,
          total: data.pagination.total,
          pages: data.pagination.pages
        });
      } else {
        setError(response.data.message || '获取系统日志失败');
      }
    } catch (error: any) {
      console.error('加载系统日志失败:', error);
      setError(error.response?.data?.message || error.message || '加载系统日志失败');
    }
  };

  // 格式化内存大小
  const formatMemory = (bytes: number) => {
    // 添加安全检查
    if (bytes === undefined || bytes === null) return '0 Bytes';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // 格式化时间
  const formatUptime = (seconds: number) => {
    // 添加安全检查
    if (seconds === undefined || seconds === null) return '0分钟';
    
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}天 ${hours}小时 ${minutes}分钟`;
    } else if (hours > 0) {
      return `${hours}小时 ${minutes}分钟`;
    } else {
      return `${minutes}分钟`;
    }
  };

  // 获取状态标签
  const getStatusTag = (status: string, type: 'server' | 'database' | 'redis') => {
    const statusMap = {
      online: { color: 'green', text: '运行中' },
      connected: { color: 'green', text: '已连接' },
      warning: { color: 'orange', text: '警告' },
      offline: { color: 'red', text: '离线' },
      disconnected: { color: 'red', text: '断开' },
      unknown: { color: 'default', text: '未知' }
    };
    
    // 添加默认值处理，确保不会出现undefined
    const statusInfo = status && statusMap[status as keyof typeof statusMap] 
      ? statusMap[status as keyof typeof statusMap] 
      : { color: 'default', text: status || '未知' };
      
    return (
      <Tag 
        color={statusInfo.color}
        style={{ 
          fontSize: isMobile ? '11px' : '12px' 
        }}
      >
        {statusInfo.text}
      </Tag>
    );
  };

  // 获取日志级别标签
  const getLogLevelTag = (level: string) => {
    const levelMap = {
      error: { color: 'red', icon: <CloseCircleOutlined /> },
      warn: { color: 'orange', icon: <WarningOutlined /> },
      info: { color: 'blue', icon: <InfoCircleOutlined /> },
      debug: { color: 'gray', icon: <BugOutlined /> }
    };
    
    // 添加默认值处理
    const levelInfo = level && levelMap[level as keyof typeof levelMap] 
      ? levelMap[level as keyof typeof levelMap] 
      : { color: 'default', icon: null };
      
    return (
      <Tag 
        color={levelInfo.color} 
        icon={levelInfo.icon}
        style={{ 
          fontSize: isMobile ? '11px' : '12px' 
        }}
      >
        {level || 'unknown'}
      </Tag>
    );
  };

  // 系统日志表格列定义 - 移动端优化
  const getLogColumns = (isMobile: boolean) => {
    const columns = [
      {
        title: '时间',
        dataIndex: 'timestamp',
        key: 'timestamp',
        render: (timestamp: string) => dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
      },
      {
        title: '级别',
        dataIndex: 'level',
        key: 'level',
        render: (level: string) => getLogLevelTag(level)
      },
      {
        title: '消息',
        dataIndex: 'message',
        key: 'message',
        render: (message: string) => (
          <Typography.Text 
            ellipsis={{ tooltip: message }} 
            style={{ 
              maxWidth: 150,
              fontSize: '12px'
            }}
          >
            {message}
          </Typography.Text>
        )
      },
      {
        title: 'IP地址',
        dataIndex: 'ip',
        key: 'ip'
      }
    ];
    
    // 移动端只显示关键列
    if (isMobile) {
      return columns.filter(col => 
        col.key === 'timestamp' || 
        col.key === 'level' || 
        col.key === 'message'
      );
    }
    
    return columns;
  };

  return (
    <AdminContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography.Title 
          level={isMobile ? 4 : 2} 
          style={{ 
            marginBottom: isMobile ? 16 : 24, 
            color: '#1a365d',
            fontSize: isMobile ? '18px' : '30px'
          }}
        >
          <MonitorOutlined style={{ marginRight: 8 }} />
          系统监控
        </Typography.Title>

        {error && (
          <Alert 
            message="错误" 
            description={error} 
            type="error" 
            showIcon 
            style={{ 
              marginBottom: isMobile ? 16 : 24,
              fontSize: isMobile ? '12px' : '14px'
            }}
          />
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <Spin size="large" />
            <div style={{ 
              marginTop: 16,
              fontSize: isMobile ? '14px' : '16px'
            }}>
              正在加载系统状态...
            </div>
          </div>
        )}

        {!loading && (
          <>
            {/* 系统状态概览 - 移动端优化 */}
            {isMobile ? (
              <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
                <Col span={12}>
                  <MobileStatsCard>
                    <Space>
                      <CloudServerOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
                      <div>
                        <Typography.Text strong style={{ fontSize: '12px' }}>服务器</Typography.Text>
                        <div style={{ marginTop: 4 }}>
                          {getStatusTag(systemStatus?.server?.status || 'unknown', 'server')}
                        </div>
                        <Typography.Text type="secondary" style={{ fontSize: '10px' }}>
                          运行: {formatUptime(systemStatus?.server?.uptime || 0)}
                        </Typography.Text>
                      </div>
                    </Space>
                  </MobileStatsCard>
                </Col>
                <Col span={12}>
                  <MobileStatsCard>
                    <Space>
                      <DatabaseOutlined style={{ fontSize: '16px', color: '#52c41a' }} />
                      <div>
                        <Typography.Text strong style={{ fontSize: '12px' }}>数据库</Typography.Text>
                        <div style={{ marginTop: 4 }}>
                          {getStatusTag(systemStatus?.database?.status || 'unknown', 'database')}
                        </div>
                        <Typography.Text type="secondary" style={{ fontSize: '10px' }}>
                          连接: {systemStatus?.database?.connections || 0}
                        </Typography.Text>
                      </div>
                    </Space>
                  </MobileStatsCard>
                </Col>
                <Col span={12}>
                  <MobileStatsCard>
                    <Space>
                      <WifiOutlined style={{ fontSize: '16px', color: '#722ed1' }} />
                      <div>
                        <Typography.Text strong style={{ fontSize: '12px' }}>缓存</Typography.Text>
                        <div style={{ marginTop: 4 }}>
                          {getStatusTag(systemStatus?.redis?.status || 'unknown', 'redis')}
                        </div>
                        <Typography.Text type="secondary" style={{ fontSize: '10px' }}>
                          连接: {systemStatus?.redis?.connections || 0}
                        </Typography.Text>
                      </div>
                    </Space>
                  </MobileStatsCard>
                </Col>
              </Row>
            ) : (
              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={8}>
                  <StatsCard>
                    <Space>
                      <CloudServerOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                      <div>
                        <Typography.Text strong>服务器状态</Typography.Text>
                        <div style={{ marginTop: 8 }}>
                          {getStatusTag(systemStatus?.server?.status || 'unknown', 'server')}
                        </div>
                        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                          运行时间: {formatUptime(systemStatus?.server?.uptime || 0)}
                        </Typography.Text>
                      </div>
                    </Space>
                  </StatsCard>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <StatsCard>
                    <Space>
                      <DatabaseOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                      <div>
                        <Typography.Text strong>数据库状态</Typography.Text>
                        <div style={{ marginTop: 8 }}>
                          {getStatusTag(systemStatus?.database?.status || 'unknown', 'database')}
                        </div>
                        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                          连接数: {systemStatus?.database?.connections || 0}
                        </Typography.Text>
                      </div>
                    </Space>
                  </StatsCard>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <StatsCard>
                    <Space>
                      <WifiOutlined style={{ fontSize: '24px', color: '#722ed1' }} />
                      <div>
                        <Typography.Text strong>缓存状态</Typography.Text>
                        <div style={{ marginTop: 8 }}>
                          {getStatusTag(systemStatus?.redis?.status || 'unknown', 'redis')}
                        </div>
                        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                          连接数: {systemStatus?.redis?.connections || 0}
                        </Typography.Text>
                      </div>
                    </Space>
                  </StatsCard>
                </Col>
              </Row>
            )}

            {/* 内存和CPU使用情况 - 移动端优化 */}
            <Row gutter={[isMobile ? 8 : 16, isMobile ? 8 : 16]} style={{ marginBottom: isMobile ? 16 : 24 }}>
              <Col xs={24} lg={12}>
                <StatsCard 
                  title={
                    <span style={{ 
                      fontSize: isMobile ? '14px' : '16px' 
                    }}>
                      内存使用情况
                    </span>
                  }
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Typography.Text style={{ fontSize: isMobile ? '12px' : '14px' }}>
                        堆内存使用: {formatMemory(systemStatus?.server?.memory?.heapUsed || 0)} / {formatMemory(systemStatus?.server?.memory?.heapTotal || 0)}
                      </Typography.Text>
                      <MobileProgress 
                        percent={Math.round(((systemStatus?.server?.memory?.heapUsed || 0) / (systemStatus?.server?.memory?.heapTotal || 1)) * 100)} 
                        status="normal" 
                        size={isMobile ? "small" : "default"}
                      />
                    </div>
                    <div>
                      <Typography.Text style={{ fontSize: isMobile ? '12px' : '14px' }}>
                        总内存使用: {formatMemory(systemStatus?.server?.memory?.rss || 0)}
                      </Typography.Text>
                      <MobileProgress 
                        percent={Math.round(((systemStatus?.server?.memory?.rss || 0) / ((systemStatus?.server?.memory?.heapTotal || 1) * 2)) * 100)} 
                        status="normal" 
                        size={isMobile ? "small" : "default"}
                      />
                    </div>
                  </Space>
                </StatsCard>
              </Col>
              <Col xs={24} lg={12}>
                <StatsCard 
                  title={
                    <span style={{ 
                      fontSize: isMobile ? '14px' : '16px' 
                    }}>
                      CPU使用情况
                    </span>
                  }
                >
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Typography.Text style={{ fontSize: isMobile ? '12px' : '14px' }}>
                        用户CPU时间: {(systemStatus?.server?.cpu?.user || 0).toFixed(2)}
                      </Typography.Text>
                      <MobileProgress 
                        percent={Math.min(100, Math.round((systemStatus?.server?.cpu?.user || 0) / 1000000))} 
                        status="active" 
                        size={isMobile ? "small" : "default"}
                      />
                    </div>
                    <div>
                      <Typography.Text style={{ fontSize: isMobile ? '12px' : '14px' }}>
                        系统CPU时间: {(systemStatus?.server?.cpu?.system || 0).toFixed(2)}
                      </Typography.Text>
                      <MobileProgress 
                        percent={Math.min(100, Math.round((systemStatus?.server?.cpu?.system || 0) / 1000000))} 
                        status="active" 
                        size={isMobile ? "small" : "default"}
                      />
                    </div>
                  </Space>
                </StatsCard>
              </Col>
            </Row>

            {/* 系统日志 - 移动端优化 */}
            <LogCard 
              title={
                <span style={{ 
                  fontSize: isMobile ? '14px' : '16px' 
                }}>
                  系统日志
                </span>
              }
              extra={
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={() => loadSystemLogs(pagination.page)}
                  loading={loading}
                  size={isMobile ? "small" : "middle"}
                >
                  刷新
                </Button>
              }
            >
              <MobileTable
                dataSource={logs}
                columns={getLogColumns(isMobile)}
                rowKey={(record) => record.timestamp + record.message}
                pagination={{
                  current: pagination.page,
                  pageSize: pagination.limit,
                  total: pagination.total,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条记录`,
                  onChange: (page) => loadSystemLogs(page),
                  size: isMobile ? "small" : "default"
                }}
                size={isMobile ? "small" : "middle"}
                scroll={isMobile ? undefined : { x: 800 }}
              />
            </LogCard>
          </>
        )}
      </motion.div>
    </AdminContainer>
  );
};

export default AdminSystem;