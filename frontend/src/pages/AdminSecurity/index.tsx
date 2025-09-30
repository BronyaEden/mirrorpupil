import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Table,
  Space,
  Button,
  Form,
  Input,
  Select,
  Avatar,
  Tag,
  Divider,
  Alert,
  Typography,
  Tooltip,
  Popconfirm,
  InputNumber,
  Switch,
  DatePicker,
  Row,
  Col,
  Badge,
  message,
  List,
  Descriptions
} from 'antd';
import {
  SafetyOutlined,
  EyeOutlined,
  DeleteOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  FilterOutlined,
  UserOutlined,
  LockOutlined,
  KeyOutlined,
  AuditOutlined,
  CloseCircleOutlined,
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

const { Option } = Select;

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

const ActionButton = styled(Button)`
  margin: 0 4px;
  
  // 移动端优化 - 更紧凑
  @media (max-width: 768px) {
    margin: 0 2px;
    padding: 0 8px;
    font-size: 12px;
  }
  
  @media (max-width: 480px) {
    margin: 0 1px;
    padding: 0 6px;
    font-size: 11px;
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

const SearchCard = styled(Card)`
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  
  // 移动端优化 - 更紧凑
  @media (max-width: 768px) {
    margin-bottom: 16px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 12px;
  }
`;

const SecurityCard = styled(Card)`
  margin-bottom: 24px;
  
  // 移动端优化 - 更紧凑
  @media (max-width: 768px) {
    margin-bottom: 16px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 12px;
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

// 移动端列表优化
const MobileList = styled(List)`
  @media (max-width: 768px) {
    .ant-list-item {
      padding: 8px 12px;
    }
    
    .ant-list-item-meta-title {
      font-size: 14px;
    }
    
    .ant-list-item-meta-description {
      font-size: 12px;
    }
  }
  
  @media (max-width: 480px) {
    .ant-list-item {
      padding: 6px 8px;
    }
    
    .ant-list-item-meta-title {
      font-size: 13px;
    }
    
    .ant-list-item-meta-description {
      font-size: 11px;
    }
  }
`;

// 接口定义
interface SecurityLog {
  _id: string;
  timestamp: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  userId?: string;
  username?: string;
  ip: string;
  userAgent: string;
  action: string;
}

interface SecuritySetting {
  name: string;
  value: string | boolean | number;
  description: string;
  type: 'boolean' | 'string' | 'number';
}

const AdminSecurity: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [searchForm] = Form.useForm();
  const [settings, setSettings] = useState<SecuritySetting[]>([
    {
      name: 'enableTwoFactor',
      value: false,
      description: '启用双因素认证',
      type: 'boolean'
    },
    {
      name: 'maxLoginAttempts',
      value: 5,
      description: '最大登录尝试次数',
      type: 'number'
    },
    {
      name: 'lockoutDuration',
      value: 30,
      description: '账户锁定时长（分钟）',
      type: 'number'
    },
    {
      name: 'passwordMinLength',
      value: 8,
      description: '密码最小长度',
      type: 'number'
    },
    {
      name: 'requireSpecialChars',
      value: true,
      description: '密码必须包含特殊字符',
      type: 'boolean'
    }
  ]);
  
  // 检测是否为移动端
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 加载安全日志
  useEffect(() => {
    loadSecurityLogs();
  }, []);

  const loadSecurityLogs = async (page: number = 1, filters: any = {}) => {
    setLoading(true);
    try {
      // 注意：这里需要实现安全日志API
      // 暂时使用模拟数据
      const mockLogs: SecurityLog[] = [
        {
          _id: '1',
          timestamp: new Date().toISOString(),
          level: 'warn',
          message: '用户登录失败',
          username: 'testuser',
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0...',
          action: 'login_failed'
        },
        {
          _id: '2',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          level: 'info',
          message: '用户登录成功',
          username: 'admin',
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          action: 'login_success'
        }
      ];
      
      setLogs(mockLogs);
      setPagination({
        page: 1,
        limit: 10,
        total: mockLogs.length,
        pages: 1
      });
    } catch (error) {
      console.error('加载安全日志失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 搜索日志
  const handleSearch = (values: any) => {
    loadSecurityLogs(1, values);
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    loadSecurityLogs(1);
  };

  // 获取日志级别标签
  const getLogLevelTag = (level: string) => {
    const levelMap = {
      error: { color: 'red', icon: <CloseCircleOutlined /> },
      warn: { color: 'orange', icon: <WarningOutlined /> },
      info: { color: 'blue', icon: <InfoCircleOutlined /> },
      debug: { color: 'gray', icon: <BugOutlined /> }
    };
    
    const levelInfo = levelMap[level as keyof typeof levelMap] || { color: 'default', icon: null };
    return (
      <Tag 
        color={levelInfo.color} 
        icon={levelInfo.icon}
        style={{ 
          fontSize: isMobile ? '11px' : '12px' 
        }}
      >
        {level}
      </Tag>
    );
  };

  // 更新安全设置
  const updateSetting = (name: string, value: string | boolean | number) => {
    setSettings(settings.map(setting => 
      setting.name === name ? { ...setting, value } : setting
    ));
    message.success('设置已更新');
  };

  // 安全日志表格列定义 - 移动端优化
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
        title: '用户',
        dataIndex: 'username',
        key: 'username',
        render: (username: string) => username || '系统'
      },
      {
        title: 'IP地址',
        dataIndex: 'ip',
        key: 'ip'
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action'
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
          <SafetyOutlined style={{ marginRight: 8 }} />
          安全管理
        </Typography.Title>

        {/* 安全设置 - 移动端优化 */}
        <SecurityCard 
          title="安全设置" 
          extra={
            <Button 
              icon={<ReloadOutlined />} 
              size={isMobile ? "small" : "middle"}
            >
              刷新
            </Button>
          }
        >
          <MobileList
            dataSource={settings}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <span style={{ 
                      fontSize: isMobile ? '14px' : '16px' 
                    }}>
                      {item.description}
                    </span>
                  }
                  description={
                    item.type === 'boolean' ? (
                      <Switch
                        checked={item.value as boolean}
                        onChange={(checked) => updateSetting(item.name, checked)}
                        checkedChildren="启用"
                        unCheckedChildren="禁用"
                        size={isMobile ? "small" : "default"}
                      />
                    ) : item.type === 'number' ? (
                      <InputNumber
                        value={item.value as number}
                        onChange={(value) => updateSetting(item.name, value || 0)}
                        min={1}
                        size={isMobile ? "small" : "middle"}
                        style={{ width: isMobile ? 80 : 100 }}
                      />
                    ) : (
                      <Input
                        value={item.value as string}
                        onChange={(e) => updateSetting(item.name, e.target.value)}
                        size={isMobile ? "small" : "middle"}
                        style={{ width: isMobile ? 120 : 150 }}
                      />
                    )
                  }
                />
                <Typography.Text 
                  type="secondary" 
                  style={{ 
                    fontSize: isMobile ? '11px' : '12px' 
                  }}
                >
                  {item.name}
                </Typography.Text>
              </List.Item>
            )}
          />
        </SecurityCard>

        {/* 安全日志 - 移动端优化 */}
        <Card 
          title="安全日志" 
          extra={
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => loadSecurityLogs(pagination.page)}
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
            rowKey="_id"
            loading={loading}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
              onChange: (page) => loadSecurityLogs(page),
              size: isMobile ? "small" : "default"
            }}
            size={isMobile ? "small" : "middle"}
            scroll={isMobile ? undefined : { x: 1000 }}
          />
        </Card>
      </motion.div>
    </AdminContainer>
  );
};

export default AdminSecurity;