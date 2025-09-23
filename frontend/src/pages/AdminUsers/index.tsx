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

// 接口定义
interface UserData {
  _id: string;
  username: string;
  email: string;
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
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [searchForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    admins: 0,
    moderators: 0
  });

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
        admins: 0, // 需要从后端获取
        moderators: 0 // 需要从后端获取
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

  // 切换用户状态
  const handleToggleUserStatus = async (user: UserData) => {
    try {
      await adminAPI.toggleUserStatus(user._id);
      await loadUsers(pagination.page);
    } catch (error) {
      console.error('切换用户状态失败:', error);
    }
  };

  // 处理编辑用户
  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    editForm.setFieldsValue({
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
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

  // 用户表格列定义
  const userColumns = [
    {
      title: '用户',
      key: 'user',
      render: (record: UserData) => (
        <Space>
          <Avatar 
            src={record.avatar || undefined} 
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
      title: '社交关系',
      key: 'social',
      render: (record: UserData) => (
        <Space size="small">
          <Badge count={record.followersCount} showZero color="#1890ff">
            <span>粉丝</span>
          </Badge>
          <Badge count={record.followingCount} showZero color="#52c41a">
            <span>关注</span>
          </Badge>
        </Space>
      )
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

  return (
    <AdminContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography.Title level={2} style={{ marginBottom: 24, color: '#1a365d' }}>
          <UserOutlined style={{ marginRight: 8 }} />
          用户管理
        </Typography.Title>

        {/* 统计概览 */}
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

        {/* 搜索和筛选 */}
        <SearchCard>
          <Form
            form={searchForm}
            layout="vertical"
            onFinish={handleSearch}
          >
            <Row gutter={24}>
              <Col xs={24} md={8}>
                <Form.Item name="search" label="搜索关键词">
                  <Input 
                    placeholder="用户名或邮箱" 
                    prefix={<SearchOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="role" label="用户角色">
                  <Select placeholder="请选择角色">
                    <Option value="user">普通用户</Option>
                    <Option value="admin">管理员</Option>
                    <Option value="moderator">版主</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="isActive" label="用户状态">
                  <Select placeholder="请选择状态">
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
                    <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                      搜索
                    </Button>
                    <Button onClick={handleReset} icon={<ReloadOutlined />}>
                      重置
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </SearchCard>

        {/* 用户列表 */}
        <Card>
          <Table
            dataSource={users}
            columns={userColumns}
            rowKey="_id"
            loading={loading}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
              onChange: (page) => loadUsers(page)
            }}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* 编辑用户模态框 */}
        <Modal
          title="编辑用户信息"
          open={editModalVisible}
          onCancel={() => {
            setEditModalVisible(false);
            editForm.resetFields();
            setSelectedUser(null);
          }}
          onOk={() => editForm.submit()}
          width={600}
        >
          <Form
            form={editForm}
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

export default AdminUsers;