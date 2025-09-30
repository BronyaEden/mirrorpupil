import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Table,
  Space,
  Button,
  Modal,
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
  Badge
} from 'antd';
import {
  UserOutlined,
  FileOutlined,
  MessageOutlined,
  EyeOutlined,
  DeleteOutlined,
  EditOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  FilterOutlined
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
    font-size: 16px !important;
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

// 移动端模态框优化
const MobileModal = styled(Modal)`
  @media (max-width: 768px) {
    .ant-modal {
      width: 90% !important;
      max-width: 500px;
    }
    
    .ant-modal-title {
      font-size: 16px;
    }
  }
  
  @media (max-width: 480px) {
    .ant-modal {
      width: 95% !important;
      max-width: 300px;
    }
    
    .ant-modal-title {
      font-size: 15px;
    }
  }
`;

// 移动端搜索表单优化
const MobileSearchForm = styled(Form)`
  @media (max-width: 768px) {
    .ant-form-item {
      margin-bottom: 12px;
    }
    
    .ant-form-item-label {
      padding: 0 0 4px;
    }
    
    .ant-input,
    .ant-select {
      font-size: 14px;
    }
  }
  
  @media (max-width: 480px) {
    .ant-form-item {
      margin-bottom: 8px;
    }
    
    .ant-input,
    .ant-select {
      font-size: 13px;
    }
  }
`;

// 接口定义
interface UserData {
  _id: string;
  username: string;
  email: string;
  password: string;
  avatar: string;
  role: 'user' | 'admin' | 'moderator';
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
  loginCount: number;
  fileCount: number;
  followersCount: number;
  followingCount: number;
}

const AdminUsers: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  // 切换用户状态
  const handleToggleUserStatus = async (user: UserData) => {
    try {
      await adminAPI.toggleUserStatus(user._id);
      await loadUsers(pagination.page);
    } catch (error) {
      console.error('切换用户状态失败:', error);
    }
  };

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [editFormInitialValues, setEditFormInitialValues] = useState<Partial<UserData>>({});
  const [searchForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    admins: 0,
    moderators: 0
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

  // 加载用户数据
  useEffect(() => {
    loadUsers();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      const data = response.data.data;
      setStats({
        total: data.users.total,
        active: data.users.active,
        admins: data.users.admins, // 修复：从后端获取管理员数量
        moderators: data.users.moderators // 修复：从后端获取版主数量
      });
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  };

  const loadUsers = async (page: number = 1, filters: any = {}) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.limit,
        ...filters
      };
      
      const response = await adminAPI.getUsers(params);
      const data = response.data.data;
      
      setUsers(data.users);
      setPagination({
        page: data.pagination.page,
        limit: data.pagination.limit,
        total: data.pagination.total,
        pages: data.pagination.pages
      });
    } catch (error) {
      console.error('加载用户失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 搜索用户
  const handleSearch = (values: any) => {
    loadUsers(1, values);
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    loadUsers(1);
  };



  // 处理编辑用户
  const handleEditUser = (user: UserData) => {
    console.log('编辑用户数据:', user);
    setSelectedUser(user);
    
    // 打开模态框
    setEditModalVisible(true);
  };

  // 提交编辑
  const handleEditSubmit = async (values: any) => {
    try {
      if (selectedUser) {
        await adminAPI.updateUser(selectedUser._id, values);
        setEditModalVisible(false);
        editForm.resetFields();
        setSelectedUser(null);
        await loadUsers(pagination.page);
      }
    } catch (error) {
      console.error('更新用户失败:', error);
    }
  };

  // 删除用户
  const handleDeleteUser = async (userId: string) => {
    try {
      await adminAPI.deleteUser(userId);
      await loadUsers(pagination.page);
    } catch (error) {
      console.error('删除用户失败:', error);
    }
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

  // 用户表格列定义 - 移动端优化
  const getUserColumns = (isMobile: boolean) => {
    const columns = [
      {
        title: '用户',
        key: 'user',
        render: (record: UserData) => (
          <Space>
            <Avatar 
              src={record.avatar || undefined} 
              icon={<UserOutlined />} 
              size={isMobile ? "small" : "default"}
            />
            <div>
              <div style={{ fontWeight: 500, fontSize: isMobile ? '12px' : '14px' }}>{record.username}</div>
              <Typography.Text type="secondary" style={{ fontSize: isMobile ? '10px' : '12px' }}>
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
        title: '社交关系',
        key: 'social',
        render: (record: UserData) => (
          <Space size="small">
            <Badge count={record.followersCount} showZero color="#1890ff">
              <span style={{ fontSize: '10px' }}>粉丝</span>
            </Badge>
            <Badge count={record.followingCount} showZero color="#52c41a">
              <span style={{ fontSize: '10px' }}>关注</span>
            </Badge>
          </Space>
        )
      },
      {
        title: '操作',
        key: 'actions',
        render: (record: UserData) => (
          <Space size="small">
            <Tooltip title="编辑用户">
              <Button 
                type="primary" 
                size="small" 
                icon={<EditOutlined />}
                onClick={() => handleEditUser(record)}
              />
            </Tooltip>
            <Tooltip title="删除用户">
              <Popconfirm
                title="确定删除该用户？此操作不可恢复！"
                onConfirm={() => handleDeleteUser(record._id)}
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
    
    // 移动端只显示关键列
    if (isMobile) {
      return columns.filter(col => 
        col.key === 'user' || 
        col.key === 'status' || 
        col.key === 'actions'
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
          <UserOutlined style={{ marginRight: 8 }} />
          用户管理
        </Typography.Title>

        {/* 统计概览 - 移动端优化 */}
        {isMobile ? (
          <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <MobileStatsCard>
                <Typography.Text strong style={{ fontSize: '12px' }}>总用户数</Typography.Text>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }} className="stats-value">
                  {stats.total}
                </div>
              </MobileStatsCard>
            </Col>
            <Col span={12}>
              <MobileStatsCard>
                <Typography.Text strong style={{ fontSize: '12px' }}>活跃用户</Typography.Text>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a' }} className="stats-value">
                  {stats.active}
                </div>
              </MobileStatsCard>
            </Col>
            <Col span={12}>
              <MobileStatsCard>
                <Typography.Text strong style={{ fontSize: '12px' }}>管理员</Typography.Text>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#faad14' }} className="stats-value">
                  {stats.admins}
                </div>
              </MobileStatsCard>
            </Col>
            <Col span={12}>
              <MobileStatsCard>
                <Typography.Text strong style={{ fontSize: '12px' }}>版主</Typography.Text>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#722ed1' }} className="stats-value">
                  {stats.moderators}
                </div>
              </MobileStatsCard>
            </Col>
          </Row>
        ) : (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <StatsCard>
                <Typography.Text strong>总用户数</Typography.Text>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                  {stats.total}
                </div>
              </StatsCard>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatsCard>
                <Typography.Text strong>活跃用户</Typography.Text>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                  {stats.active}
                </div>
              </StatsCard>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatsCard>
                <Typography.Text strong>管理员</Typography.Text>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                  {stats.admins}
                </div>
              </StatsCard>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <StatsCard>
                <Typography.Text strong>版主</Typography.Text>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                  {stats.moderators}
                </div>
              </StatsCard>
            </Col>
          </Row>
        )}

        {/* 搜索和筛选 - 移动端优化 */}
        <SearchCard>
          <MobileSearchForm
            form={searchForm}
            layout={isMobile ? "vertical" : "horizontal"}
            onFinish={handleSearch}
          >
            <Row gutter={isMobile ? 12 : 24}>
              <Col xs={24} md={8}>
                <Form.Item name="search" label="搜索关键词">
                  <Input 
                    placeholder="用户名或邮箱" 
                    prefix={<SearchOutlined />}
                    size={isMobile ? "middle" : "large"}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="role" label="用户角色">
                  <Select 
                    placeholder="请选择角色"
                    size={isMobile ? "middle" : "large"}
                  >
                    <Option value="user">普通用户</Option>
                    <Option value="admin">管理员</Option>
                    <Option value="moderator">版主</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="isActive" label="用户状态">
                  <Select 
                    placeholder="请选择状态"
                    size={isMobile ? "middle" : "large"}
                  >
                    <Option value="true">启用</Option>
                    <Option value="false">禁用</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item>
                  <Space>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      icon={<SearchOutlined />}
                      size={isMobile ? "middle" : "large"}
                    >
                      搜索
                    </Button>
                    <Button 
                      onClick={handleReset} 
                      icon={<ReloadOutlined />}
                      size={isMobile ? "middle" : "large"}
                    >
                      重置
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </MobileSearchForm>
        </SearchCard>

        {/* 用户列表 - 移动端优化 */}
        <Card>
          <MobileTable
            dataSource={users}
            columns={getUserColumns(isMobile)}
            rowKey="_id"
            loading={loading}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
              onChange: (page) => loadUsers(page),
              size: isMobile ? "small" : "default"
            }}
            size={isMobile ? "small" : "middle"}
            scroll={isMobile ? undefined : { x: 1200 }}
          />
        </Card>

        {/* 编辑用户模态框 - 移动端优化 */}
        <MobileModal
          title="编辑用户信息"
          open={editModalVisible}
          onCancel={() => {
            setEditModalVisible(false);
            editForm.resetFields();
            setSelectedUser(null);
            setEditFormInitialValues({});
          }}
          onOk={() => editForm.submit()}
          width={isMobile ? "95%" : 600}
        >
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleEditSubmit}
          >
            <Row gutter={isMobile ? 8 : 16}>
              <Col span={24}>
                <Form.Item
                  name="username"
                  label="用户名"
                  rules={[{ required: true, message: '请输入用户名' }]}
                >
                  <Input size={isMobile ? "middle" : "large"} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="email"
                  label="邮箱"
                  rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入有效的邮箱地址' }
                  ]}
                >
                  <Input size={isMobile ? "middle" : "large"} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={isMobile ? 8 : 16}>
              <Col span={24}>
                <Form.Item
                  name="password"
                  label="用户密码"
                >
                  <Input size={isMobile ? "middle" : "large"} />
                  <div style={{ color: '#999', fontSize: isMobile ? '11px' : '12px', marginTop: '4px' }}>
                    注意：显示的是加密后的密码，如需修改请直接输入新密码
                  </div>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="role"
                  label="角色"
                  rules={[{ required: true, message: '请选择角色' }]}
                >
                  <Select size={isMobile ? "middle" : "large"}>
                    <Option value="user">普通用户</Option>
                    <Option value="moderator">版主</Option>
                    <Option value="admin">管理员</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="isActive"
                  label="用户状态"
                  valuePropName="checked"
                >
                  <Switch 
                    checkedChildren="启用" 
                    unCheckedChildren="禁用" 
                    size={isMobile ? "small" : "default"}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </MobileModal>
      </motion.div>
    </AdminContainer>
  );
};

export default AdminUsers;