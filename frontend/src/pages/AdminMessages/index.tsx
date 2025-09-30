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
  
  // 检测是否为移动端
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      const params = {
        page,
        limit: pagination.limit,
        ...filters
      };
      
      const response = await adminAPI.getMessages(params);
      const data = response.data.data;
      
      setMessages(data.messages);
      setPagination({
        page: data.pagination.page,
        limit: data.pagination.limit,
        total: data.pagination.total,
        pages: data.pagination.pages
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
      await adminAPI.deleteMessage(messageId);
      message.success('消息删除成功');
      await loadMessages(pagination.page);
    } catch (error) {
      console.error('删除消息失败:', error);
      message.error('消息删除失败');
    }
  };

  // 消息表格列定义 - 移动端优化
  const getMessageColumns = (isMobile: boolean) => {
    const columns = [
      {
        title: '发送者',
        key: 'sender',
        render: (record: MessageData) => (
          <Space>
            <Avatar 
              src={undefined} 
              icon={<UserOutlined />} 
              size={isMobile ? "small" : "default"}
            />
            <div>
              <div style={{ 
                fontWeight: 500, 
                fontSize: isMobile ? '12px' : '14px' 
              }}>
                {record.sender?.username || '未知'}
              </div>
              <Typography.Text 
                type="secondary" 
                style={{ 
                  fontSize: isMobile ? '10px' : '12px' 
                }}
              >
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
          <Typography.Text 
            ellipsis={{ tooltip: content }} 
            style={{ 
              maxWidth: 150,
              fontSize: '12px'
            }}
          >
            {content}
          </Typography.Text>
        )
      },
      {
        title: '消息类型',
        dataIndex: 'messageType',
        key: 'messageType',
        render: (type: string) => (
          <Tag 
            color="blue"
            style={{ 
              fontSize: isMobile ? '11px' : '12px' 
            }}
          >
            {type}
          </Tag>
        )
      },
      {
        title: '会话ID',
        dataIndex: 'conversationId',
        key: 'conversationId',
        render: (id: string) => (
          <Typography.Text 
            copyable 
            ellipsis 
            style={{ 
              maxWidth: 80,
              fontSize: '12px'
            }}
          >
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
          <Space size="small">
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
    
    // 移动端只显示关键列
    if (isMobile) {
      return columns.filter(col => 
        col.key === 'sender' || 
        col.key === 'content' || 
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
          <MessageOutlined style={{ marginRight: 8 }} />
          消息管理
        </Typography.Title>

        {/* 统计概览 - 移动端优化 */}
        {isMobile ? (
          <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <MobileStatsCard>
                <Typography.Text strong style={{ fontSize: '12px' }}>总消息数</Typography.Text>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }} className="stats-value">
                  {stats.total}
                </div>
              </MobileStatsCard>
            </Col>
            <Col span={12}>
              <MobileStatsCard>
                <Typography.Text strong style={{ fontSize: '12px' }}>今日消息</Typography.Text>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a' }} className="stats-value">
                  {stats.today}
                </div>
              </MobileStatsCard>
            </Col>
          </Row>
        ) : (
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
                    placeholder="消息内容" 
                    prefix={<SearchOutlined />}
                    size={isMobile ? "middle" : "large"}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="messageType" label="消息类型">
                  <Select 
                    placeholder="请选择类型"
                    size={isMobile ? "middle" : "large"}
                  >
                    <Option value="text">文本</Option>
                    <Option value="image">图片</Option>
                    <Option value="file">文件</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item label="操作">
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

        {/* 消息列表 - 移动端优化 */}
        <Card>
          <MobileTable
            dataSource={messages}
            columns={getMessageColumns(isMobile)}
            rowKey="_id"
            loading={loading}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
              onChange: (page) => loadMessages(page),
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

export default AdminMessages;