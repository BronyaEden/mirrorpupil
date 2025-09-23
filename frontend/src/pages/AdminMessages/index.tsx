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
  message
} from 'antd';
import {
  MessageOutlined,
  EyeOutlined,
  DeleteOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  FilterOutlined,
  UserOutlined
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

// 接口定义
interface MessageData {
  _id: string;
  content: string;
  senderId: string;
  sender: {
    username: string;
    email: string;
  };
  conversationId: string;
  messageType: string;
  createdAt: string;
  updatedAt: string;
}

const AdminMessages: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [searchForm] = Form.useForm();
  const [stats, setStats] = useState({
    total: 0,
    today: 0
  });

  // 加载消息数据
  useEffect(() => {
    loadMessages();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      const data = response.data.data;
      setStats({
        total: data.messages.total,
        today: data.messages.today
      });
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  };

  const loadMessages = async (page: number = 1, filters: any = {}) => {
    setLoading(true);
    try {
      // 注意：这里需要实现消息管理API
      // 暂时使用模拟数据
      const mockMessages: MessageData[] = [
        {
          _id: '1',
          content: '你好，这是一个测试消息',
          senderId: 'user1',
          sender: {
            username: 'testuser',
            email: 'test@example.com'
          },
          conversationId: 'conv1',
          messageType: 'text',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      setMessages(mockMessages);
      setPagination({
        page: 1,
        limit: 10,
        total: mockMessages.length,
        pages: 1
      });
    } catch (error) {
      console.error('加载消息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 搜索消息
  const handleSearch = (values: any) => {
    loadMessages(1, values);
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    loadMessages(1);
  };

  // 删除消息
  const handleDeleteMessage = async (messageId: string) => {
    try {
      // TODO: 实现删除消息API
      message.success('消息删除成功');
      await loadMessages(pagination.page);
    } catch (error) {
      console.error('删除消息失败:', error);
      message.error('消息删除失败');
    }
  };

  // 消息表格列定义
  const messageColumns = [
    {
      title: '发送者',
      key: 'sender',
      render: (record: MessageData) => (
        <Space>
          <Avatar 
            src={undefined} 
            icon={<UserOutlined />} 
            size="small"
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.sender?.username || '未知'}</div>
            <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
              {record.sender?.email || '未知邮箱'}
            </Typography.Text>
          </div>
        </Space>
      )
    },
    {
      title: '消息内容',
      dataIndex: 'content',
      key: 'content',
      render: (content: string) => (
        <Typography.Text ellipsis={{ tooltip: content }} style={{ maxWidth: 200 }}>
          {content}
        </Typography.Text>
      )
    },
    {
      title: '消息类型',
      dataIndex: 'messageType',
      key: 'messageType',
      render: (type: string) => (
        <Tag color="blue">{type}</Tag>
      )
    },
    {
      title: '会话ID',
      dataIndex: 'conversationId',
      key: 'conversationId',
      render: (id: string) => (
        <Typography.Text copyable ellipsis style={{ maxWidth: 100 }}>
          {id}
        </Typography.Text>
      )
    },
    {
      title: '发送时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: MessageData) => (
        <Space>
          <Tooltip title="查看详情">
            <Button 
              type="primary" 
              size="small" 
              icon={<EyeOutlined />}
            />
          </Tooltip>
          <Tooltip title="删除消息">
            <Popconfirm
              title="确定删除该消息？此操作不可恢复！"
              onConfirm={() => handleDeleteMessage(record._id)}
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
          <MessageOutlined style={{ marginRight: 8 }} />
          消息管理
        </Typography.Title>

        {/* 统计概览 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <StatsCard>
              <Typography.Text strong>总消息数</Typography.Text>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {stats.total}
              </div>
            </StatsCard>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatsCard>
              <Typography.Text strong>今日消息</Typography.Text>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {stats.today}
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
                    placeholder="消息内容" 
                    prefix={<SearchOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="messageType" label="消息类型">
                  <Select placeholder="请选择类型">
                    <Option value="text">文本</Option>
                    <Option value="image">图片</Option>
                    <Option value="file">文件</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="操作">
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

        {/* 消息列表 */}
        <Card>
          <Table
            dataSource={messages}
            columns={messageColumns}
            rowKey="_id"
            loading={loading}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
              onChange: (page) => loadMessages(page)
            }}
            scroll={{ x: 1000 }}
          />
        </Card>
      </motion.div>
    </AdminContainer>
  );
};

export default AdminMessages;