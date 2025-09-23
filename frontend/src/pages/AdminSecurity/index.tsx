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

const ActionButton = styled(Button)`
  margin: 0 4px;
`;

const StatusTag = styled(Tag)`
  border-radius: 12px;
  padding: 2px 8px;
  font-weight: 500;
`;

const SearchCard = styled(Card)`
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
`;

const SecurityCard = styled(Card)`
  margin-bottom: 24px;
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
    return <Tag color={levelInfo.color} icon={levelInfo.icon}>{level}</Tag>;
  };

  // 更新安全设置
  const updateSetting = (name: string, value: string | boolean | number) => {
    setSettings(settings.map(setting => 
      setting.name === name ? { ...setting, value } : setting
    ));
    message.success('设置已更新');
  };

  return (
    <AdminContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography.Title level={2} style={{ marginBottom: 24, color: '#1a365d' }}>
          <SafetyOutlined style={{ marginRight: 8 }} />
          安全管理
        </Typography.Title>

        {/* 安全设置 */}
        <SecurityCard title="安全设置" extra={<Button icon={<ReloadOutlined />}>刷新</Button>}>
          <List
            dataSource={settings}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  title={item.description}
                  description={
                    item.type === 'boolean' ? (
                      <Switch
                        checked={item.value as boolean}
                        onChange={(checked) => updateSetting(item.name, checked)}
                        checkedChildren="启用"
                        unCheckedChildren="禁用"
                      />
                    ) : item.type === 'number' ? (
                      <InputNumber
                        value={item.value as number}
                        onChange={(value) => updateSetting(item.name, value || 0)}
                        min={1}
                      />
                    ) : (
                      <Input
                        value={item.value as string}
                        onChange={(e) => updateSetting(item.name, e.target.value)}
                      />
                    )
                  }
                />
                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                  {item.name}
                </Typography.Text>
              </List.Item>
            )}
          />
        </SecurityCard>

        {/* 安全日志 */}
        <Card 
          title="安全日志" 
          extra={
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => loadSecurityLogs(pagination.page)}
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
                  <Typography.Text ellipsis={{ tooltip: message }} style={{ maxWidth: 200 }}>
                    {message}
                  </Typography.Text>
                )
              }
            ]}
            rowKey="_id"
            loading={loading}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
              onChange: (page) => loadSecurityLogs(page)
            }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </motion.div>
    </AdminContainer>
  );
};

export default AdminSecurity;