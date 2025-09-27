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
  Spin // 添加Spin组件的导入
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
`;

const StatusTag = styled(Tag)`
  border-radius: 12px;
  padding: 2px 8px;
  font-weight: 500;
`;

const LogCard = styled(Card)`
  margin-top: 24px;
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
      
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
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
      
    return <Tag color={levelInfo.color} icon={levelInfo.icon}>{level || 'unknown'}</Tag>;
  };

  return (
    <AdminContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography.Title level={2} style={{ marginBottom: 24, color: '#1a365d' }}>
          <MonitorOutlined style={{ marginRight: 8 }} />
          系统监控
        </Typography.Title>

        {error && (
          <Alert 
            message="错误" 
            description={error} 
            type="error" 
            showIcon 
            style={{ marginBottom: 24 }}
          />
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>正在加载系统状态...</div>
          </div>
        )}

        {!loading && (
          <>
            {/* 系统状态概览 */}
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

            {/* 内存和CPU使用情况 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} lg={12}>
                <StatsCard title="内存使用情况">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Typography.Text>堆内存使用: {formatMemory(systemStatus?.server?.memory?.heapUsed || 0)} / {formatMemory(systemStatus?.server?.memory?.heapTotal || 0)}</Typography.Text>
                      <Progress 
                        percent={Math.round(((systemStatus?.server?.memory?.heapUsed || 0) / (systemStatus?.server?.memory?.heapTotal || 1)) * 100)} 
                        status="normal" 
                      />
                    </div>
                    <div>
                      <Typography.Text>总内存使用: {formatMemory(systemStatus?.server?.memory?.rss || 0)}</Typography.Text>
                      <Progress 
                        percent={Math.round(((systemStatus?.server?.memory?.rss || 0) / ((systemStatus?.server?.memory?.heapTotal || 1) * 2)) * 100)} 
                        status="normal" 
                      />
                    </div>
                  </Space>
                </StatsCard>
              </Col>
              <Col xs={24} lg={12}>
                <StatsCard title="CPU使用情况">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Typography.Text>用户CPU时间: {(systemStatus?.server?.cpu?.user || 0).toFixed(2)}</Typography.Text>
                      <Progress 
                        percent={Math.min(100, Math.round((systemStatus?.server?.cpu?.user || 0) / 1000000))} 
                        status="active" 
                      />
                    </div>
                    <div>
                      <Typography.Text>系统CPU时间: {(systemStatus?.server?.cpu?.system || 0).toFixed(2)}</Typography.Text>
                      <Progress 
                        percent={Math.min(100, Math.round((systemStatus?.server?.cpu?.system || 0) / 1000000))} 
                        status="active" 
                      />
                    </div>
                  </Space>
                </StatsCard>
              </Col>
            </Row>

            {/* 系统日志 */}
            <LogCard 
              title="系统日志" 
              extra={
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={() => loadSystemLogs(pagination.page)}
                  loading={loading}
                >
                  刷新
                </Button>
              }
            >
              <Table
                dataSource={logs}
                columns={[
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
                      <Typography.Text ellipsis={{ tooltip: message }} style={{ maxWidth: 300 }}>
                        {message}
                      </Typography.Text>
                    )
                  },
                  {
                    title: 'IP地址',
                    dataIndex: 'ip',
                    key: 'ip'
                  }
                ]}
                rowKey={(record) => record.timestamp + record.message}
                pagination={{
                  current: pagination.page,
                  pageSize: pagination.limit,
                  total: pagination.total,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条记录`,
                  onChange: (page) => loadSystemLogs(page)
                }}
                scroll={{ x: 800 }}
              />
            </LogCard>
          </>
        )}
      </motion.div>
    </AdminContainer>
  );
};

export default AdminSystem;