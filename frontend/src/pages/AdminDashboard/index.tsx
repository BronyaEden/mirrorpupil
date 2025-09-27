import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Avatar,
  Tag,
  Divider,
  Progress,
  Alert,
  Tabs,
  Typography,
  Tooltip,
  Popconfirm
} from 'antd';
import {
  UserOutlined,
  FileOutlined,
  MessageOutlined,
  EyeOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EditOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  CloudServerOutlined,
  DatabaseOutlined,
  WifiOutlined
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

const { Content } = Layout;
const { TabPane } = Tabs;
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

// 接口定义
interface DashboardStats {
  totalUsers: number;
  totalFiles: number;
  totalMessages: number;
  totalViews: number;
  totalDownloads: number;
  activeUsers: number;
  storageUsed: number;
  serverStatus: 'online' | 'offline' | 'warning';
}

interface UserData {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin' | 'moderator';
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string;
  loginCount: number;
  fileCount: number;
}

interface FileData {
  _id: string;
  filename: string;
  displayName: string;
  fileType: string;
  fileSize: number;
  uploaderId: string;
  uploaderName: string;
  downloadCount: number;
  viewCount: number;
  likeCount: number;
  isPublic: boolean;
  createdAt: string;
}

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalFiles: 0,
    totalMessages: 0,
    totalViews: 0,
    totalDownloads: 0,
    activeUsers: 0,
    storageUsed: 0,
    serverStatus: 'online'
  });
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [files, setFiles] = useState<FileData[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [form] = Form.useForm();

  // 数据加载
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 调用真实的API获取数据
      const response = await adminAPI.getDashboardStats();
      console.log('Dashboard stats response:', response.data.data);
      const data = response.data.data;
      
      setDashboardStats({
        totalUsers: data.users.total,
        totalFiles: data.files.total,
        totalMessages: data.messages.total,
        totalViews: data.activity.totalViews,
        totalDownloads: data.activity.totalDownloads,
        activeUsers: data.users.active,
        storageUsed: data.files.totalSize / (1024 * 1024 * 1024), // 转换为GB
        serverStatus: data.serverStatus
      });

      // 加载真实的用户数据
      const userResponse = await adminAPI.getUsers({ page: 1, limit: 5 });
      console.log('Users response:', userResponse.data.data);
      setUsers(userResponse.data.data.users);

      // 加载真实的文件数据
      const fileResponse = await adminAPI.getFiles({ page: 1, limit: 5 });
      console.log('Files response:', fileResponse.data.data);
      setFiles(fileResponse.data.data.files);
    } catch (error) {
      console.error('加载数据失败:', error);
      // 如果API调用失败，显示错误信息
      setDashboardStats({
        totalUsers: 0,
        totalFiles: 0,
        totalMessages: 0,
        totalViews: 0,
        totalDownloads: 0,
        activeUsers: 0,
        storageUsed: 0,
        serverStatus: 'offline'
      });
      
      setUsers([]);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // 用户状态标签
  const getUserStatusTag = (user: UserData) => {
    if (!user.isActive) {
      return <Tag color="red">已禁用</Tag>;
    }
    if (user.role === 'admin') {
      return <Tag color="gold">管理员</Tag>;
    }
    if (user.role === 'moderator') {
      return <Tag color="blue">版主</Tag>;
    }
    return <Tag color="green">用户</Tag>;
  };

  // 文件类型标签
  const getFileTypeTag = (fileType: string) => {
    const typeMap = {
      image: { color: 'cyan', text: '图片' },
      video: { color: 'purple', text: '视频' },
      audio: { color: 'orange', text: '音频' },
      document: { color: 'blue', text: '文档' },
      other: { color: 'default', text: '其他' }
    };
    const type = typeMap[fileType as keyof typeof typeMap] || typeMap.other;
    return <Tag color={type.color}>{type.text}</Tag>;
  };

  // 用户表格列定义
  const userColumns = [
    {
      title: '用户',
      key: 'user',
      render: (record: UserData) => (
        <Space>
          <Avatar 
            src={record.avatar} 
            icon={<UserOutlined />} 
            size="small"
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.username}</div>
            <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
              {record.email}
            </Typography.Text>
          </div>
        </Space>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (_: any, record: UserData) => getUserStatusTag(record)
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD')
    },
    {
      title: '最后登录',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (date: string) => date ? dayjs(date).fromNow() : '从未登录'
    },
    {
      title: '登录次数',
      dataIndex: 'loginCount',
      key: 'loginCount'
    },
    {
      title: '文件数',
      dataIndex: 'fileCount',
      key: 'fileCount'
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: UserData) => (
        <Space>
          <Tooltip title="编辑用户">
            <Button 
              type="primary" 
              size="small" 
              icon={<EditOutlined />}
              onClick={() => handleEditUser(record)}
            />
          </Tooltip>
          <Tooltip title={record.isActive ? "禁用用户" : "启用用户"}>
            <Popconfirm
              title={`确定${record.isActive ? '禁用' : '启用'}该用户？`}
              onConfirm={() => handleToggleUserStatus(record)}
            >
              <Button 
                danger={record.isActive}
                size="small" 
                icon={record.isActive ? <DeleteOutlined /> : <CheckCircleOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  // 文件表格列定义
  const fileColumns = [
    {
      title: '文件名',
      key: 'filename',
      render: (record: FileData) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.displayName}</div>
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            {record.filename}
          </Typography.Text>
        </div>
      )
    },
    {
      title: '类型',
      dataIndex: 'fileType',
      key: 'fileType',
      render: (type: string) => getFileTypeTag(type)
    },
    {
      title: '大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: (size: number) => formatFileSize(size)
    },
    {
      title: '上传者',
      dataIndex: 'uploaderName',
      key: 'uploaderName'
    },
    {
      title: '下载量',
      dataIndex: 'downloadCount',
      key: 'downloadCount'
    },
    {
      title: '查看量',
      dataIndex: 'viewCount',
      key: 'viewCount'
    },
    {
      title: '可见性',
      dataIndex: 'isPublic',
      key: 'isPublic',
      render: (isPublic: boolean) => (
        <Tag color={isPublic ? 'green' : 'orange'}>
          {isPublic ? '公开' : '私有'}
        </Tag>
      )
    },
    {
      title: '上传时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: FileData) => (
        <Space>
          <Tooltip title="查看详情">
            <Button 
              type="primary" 
              size="small" 
              icon={<EyeOutlined />}
              onClick={() => handleViewFile(record)}
            />
          </Tooltip>
          <Tooltip title="删除文件">
            <Popconfirm
              title="确定删除该文件？"
              onConfirm={() => handleDeleteFile(record)}
            >
              <Button 
                danger
                size="small" 
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  // 处理函数
  const handleEditUser = (user: UserData) => {
    setSelectedRecord(user);
    form.setFieldsValue(user);
    setEditModalVisible(true);
  };

  const handleToggleUserStatus = async (user: UserData) => {
    // TODO: 调用API切换用户状态
    console.log('切换用户状态:', user);
    await loadDashboardData();
  };

  const handleViewFile = (file: FileData) => {
    // TODO: 查看文件详情
    console.log('查看文件:', file);
  };

  const handleDeleteFile = async (file: FileData) => {
    // TODO: 调用API删除文件
    console.log('删除文件:', file);
    await loadDashboardData();
  };

  const handleEditSubmit = async (values: any) => {
    try {
      // TODO: 调用API更新用户信息
      console.log('更新用户:', values);
      setEditModalVisible(false);
      form.resetFields();
      await loadDashboardData();
    } catch (error) {
      console.error('更新失败:', error);
    }
  };

  return (
    <AdminContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography.Title level={2} style={{ marginBottom: 24, color: '#1a365d' }}>
          <CloudServerOutlined style={{ marginRight: 8 }} />
          系统管理后台
        </Typography.Title>

        {/* 统计概览 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <StatsCard>
              <Statistic
                title="总用户数"
                value={dashboardStats.totalUsers}
                prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              />
            </StatsCard>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatsCard>
              <Statistic
                title="总文件数"
                value={dashboardStats.totalFiles}
                prefix={<FileOutlined style={{ color: '#52c41a' }} />}
              />
            </StatsCard>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatsCard>
              <Statistic
                title="活跃用户"
                value={dashboardStats.activeUsers}
                prefix={<WifiOutlined style={{ color: '#faad14' }} />}
              />
            </StatsCard>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatsCard>
              <Statistic
                title="存储使用"
                value={dashboardStats.storageUsed.toFixed(6)} // 保留6位小数
                suffix="GB"
                prefix={<DatabaseOutlined style={{ color: '#722ed1' }} />}
              />
              <Progress 
                percent={Math.round((dashboardStats.storageUsed / 10) * 100)} 
                size="small" 
                style={{ marginTop: 8 }}
              />
            </StatsCard>
          </Col>
        </Row>

        {/* 系统状态 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <StatsCard>
              <Space size="large">
                <div>
                  <Typography.Text strong>服务器状态: </Typography.Text>
                  <Tag 
                    color={dashboardStats.serverStatus === 'online' ? 'green' : 'red'}
                    icon={dashboardStats.serverStatus === 'online' ? 
                      <CheckCircleOutlined /> : <WarningOutlined />}
                  >
                    {dashboardStats.serverStatus === 'online' ? '运行正常' : '异常'}
                  </Tag>
                </div>
                <Divider type="vertical" />
                <Statistic
                  title="总查看量"
                  value={dashboardStats.totalViews}
                  prefix={<EyeOutlined />}
                />
                <Divider type="vertical" />
                <Statistic
                  title="总下载量"
                  value={dashboardStats.totalDownloads}
                  prefix={<DownloadOutlined />}
                />
                <Divider type="vertical" />
                <Statistic
                  title="消息总数"
                  value={dashboardStats.totalMessages}
                  prefix={<MessageOutlined />}
                />
              </Space>
            </StatsCard>
          </Col>
        </Row>

        {/* 管理标签页 */}
        <Card>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            size="large"
          >
            <TabPane 
              tab={<span><BarChartOutlined />数据概览</span>} 
              key="overview"
            >
              <Alert
                message="数据概览"
                description="这里将显示更详细的图表和统计信息。"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              {/* TODO: 添加图表组件 */}
            </TabPane>
            
            <TabPane 
              tab={<span><UserOutlined />用户管理</span>} 
              key="users"
            >
              <Table
                dataSource={users}
                columns={userColumns}
                rowKey="_id"
                loading={loading}
                pagination={{
                  total: users.length,
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条记录`
                }}
              />
            </TabPane>
            
            <TabPane 
              tab={<span><FileOutlined />文件管理</span>} 
              key="files"
            >
              <Table
                dataSource={files}
                columns={fileColumns}
                rowKey="_id"
                loading={loading}
                pagination={{
                  total: files.length,
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `共 ${total} 条记录`
                }}
              />
            </TabPane>
            
            <TabPane 
              tab={<span><MessageOutlined />消息管理</span>} 
              key="messages"
            >
              <Alert
                message="消息管理"
                description="这里将显示系统消息和聊天记录的管理功能。"
                type="info"
                showIcon
              />
            </TabPane>
          </Tabs>
        </Card>

        {/* 编辑用户模态框 */}
        <Modal
          title="编辑用户信息"
          open={editModalVisible}
          onCancel={() => {
            setEditModalVisible(false);
            form.resetFields();
          }}
          onOk={() => form.submit()}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleEditSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="username"
                  label="用户名"
                  rules={[{ required: true, message: '请输入用户名' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="邮箱"
                  rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入有效的邮箱地址' }
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="role"
                  label="角色"
                  rules={[{ required: true, message: '请选择角色' }]}
                >
                  <Select>
                    <Option value="user">普通用户</Option>
                    <Option value="moderator">版主</Option>
                    <Option value="admin">管理员</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="isActive"
                  label="状态"
                  valuePropName="checked"
                >
                  <Select>
                    <Option value={true}>启用</Option>
                    <Option value={false}>禁用</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </motion.div>
    </AdminContainer>
  );
};

export default AdminDashboard;