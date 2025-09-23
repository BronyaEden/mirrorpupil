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
  Row,
  Col,
  message,
  Typography,
  Tooltip,
  Popconfirm
} from 'antd';
import {
  FileOutlined,
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  LikeOutlined,
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
interface FileData {
  _id: string;
  filename: string;
  originalName: string;
  displayName: string;
  fileType: string;
  fileSize: number;
  uploader: {
    username: string;
    email: string;
  };
  downloadCount: number;
  viewCount: number;
  likeCount: number;
  isPublic: boolean;
  createdAt: string;
}

const AdminFiles: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<FileData[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [searchForm] = Form.useForm();
  const [stats, setStats] = useState({
    total: 0,
    public: 0,
    totalSize: 0
  });

  // 加载文件数据
  useEffect(() => {
    loadFiles();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      const data = response.data.data;
      setStats({
        total: data.files.total,
        public: data.files.public,
        totalSize: data.files.totalSize
      });
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  };

  const loadFiles = async (page: number = 1, filters: any = {}) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.limit,
        ...filters
      };
      
      const response = await adminAPI.getFiles(params);
      const data = response.data.data;
      
      setFiles(data.files);
      setPagination({
        page: data.pagination.page,
        limit: data.pagination.limit,
        total: data.pagination.total,
        pages: data.pagination.pages
      });
    } catch (error) {
      console.error('加载文件失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 搜索文件
  const handleSearch = (values: any) => {
    loadFiles(1, values);
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    loadFiles(1);
  };

  // 删除文件
  const handleDeleteFile = async (fileId: string) => {
    try {
      await adminAPI.deleteFile(fileId);
      message.success('文件删除成功');
      await loadFiles(pagination.page);
    } catch (error) {
      console.error('删除文件失败:', error);
      message.error('文件删除失败');
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
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

  // 文件表格列定义
  const fileColumns = [
    {
      title: '文件名',
      key: 'filename',
      render: (record: FileData) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.displayName}</div>
          <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
            {record.originalName}
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
      key: 'uploader',
      render: (record: FileData) => (
        <Space>
          <Avatar 
            src={undefined} 
            icon={<UserOutlined />} 
            size="small"
          />
          <div>
            <div style={{ fontWeight: 500 }}>{record.uploader?.username || '未知'}</div>
            <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
              {record.uploader?.email || '未知邮箱'}
            </Typography.Text>
          </div>
        </Space>
      )
    },
    {
      title: '统计',
      key: 'stats',
      render: (record: FileData) => (
        <Space size="small">
          <Tooltip title="下载量">
            <span><DownloadOutlined /> {record.downloadCount}</span>
          </Tooltip>
          <Tooltip title="查看量">
            <span><EyeOutlined /> {record.viewCount}</span>
          </Tooltip>
          <Tooltip title="点赞数">
            <span><LikeOutlined /> {record.likeCount}</span>
          </Tooltip>
        </Space>
      )
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
            />
          </Tooltip>
          <Tooltip title="删除文件">
            <Popconfirm
              title="确定删除该文件？此操作不可恢复！"
              onConfirm={() => handleDeleteFile(record._id)}
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
          <FileOutlined style={{ marginRight: 8 }} />
          文件管理
        </Typography.Title>

        {/* 统计概览 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <StatsCard>
              <Typography.Text strong>总文件数</Typography.Text>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {stats.total}
              </div>
            </StatsCard>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatsCard>
              <Typography.Text strong>公开文件</Typography.Text>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {stats.public}
              </div>
            </StatsCard>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatsCard>
              <Typography.Text strong>总存储</Typography.Text>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#eb2f96' }}>
                {formatFileSize(stats.totalSize)}
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
              <Col xs={24} md={6}>
                <Form.Item name="search" label="搜索关键词">
                  <Input 
                    placeholder="文件名或描述" 
                    prefix={<SearchOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="fileType" label="文件类型">
                  <Select placeholder="请选择类型">
                    <Option value="image">图片</Option>
                    <Option value="video">视频</Option>
                    <Option value="audio">音频</Option>
                    <Option value="document">文档</Option>
                    <Option value="other">其他</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="isPublic" label="可见性">
                  <Select placeholder="请选择可见性">
                    <Option value="true">公开</Option>
                    <Option value="false">私有</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
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

        {/* 文件列表 */}
        <Card>
          <Table
            dataSource={files}
            columns={fileColumns}
            rowKey="_id"
            loading={loading}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
              onChange: (page) => loadFiles(page)
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      </motion.div>
    </AdminContainer>
  );
};

export default AdminFiles;