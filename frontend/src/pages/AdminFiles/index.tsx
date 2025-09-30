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
  
  // 检测是否为移动端
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // 文件表格列定义 - 移动端优化
  const getFileColumns = (isMobile: boolean) => {
    const columns = [
      {
        title: '预览',
        key: 'thumbnail',
        render: (record: FileData) => (
          record.fileType === 'image' ? (
            <img
              src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/files/${record._id}/thumbnail`}
              alt={record.displayName}
              style={{ 
                width: isMobile ? 40 : 50, 
                height: isMobile ? 40 : 50, 
                objectFit: 'cover', 
                borderRadius: 4 
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZpbGw9IiM5OTkiPjx0c3Bhbj5JbWFnZTwvdHNwYW4+PC90ZXh0Pjwvc3ZnPg==';
              }}
            />
          ) : (
            <div style={{ 
              width: isMobile ? 40 : 50, 
              height: isMobile ? 40 : 50, 
              background: '#f0f0f0',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isMobile ? 16 : 20
            }}>
              📄
            </div>
          )
        )
      },
      {
        title: '文件名',
        key: 'filename',
        render: (record: FileData) => (
          <div>
            <div style={{ 
              fontWeight: 500, 
              fontSize: isMobile ? '12px' : '14px' 
            }}>
              {record.displayName}
            </div>
            <Typography.Text 
              type="secondary" 
              style={{ 
                fontSize: isMobile ? '10px' : '12px' 
              }}
            >
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
        render: (record: FileData) => {
          // 获取头像URL
          let avatarUrl = null;
          if (record.uploader?.avatar) {
            // 如果avatar是ObjectId格式，则构建图片API URL
            if (/^[0-9a-fA-F]{24}$/.test(record.uploader.avatar)) {
              avatarUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/images/${record.uploader.avatar}`;
            } else {
              // 如果已经是完整URL，则直接使用
              avatarUrl = record.uploader.avatar;
            }
          }
          
          return (
            <Space>
              <Avatar 
                src={avatarUrl} 
                icon={<UserOutlined />} 
                size={isMobile ? "small" : "default"}
              />
              <div>
                <div style={{ 
                  fontWeight: 500, 
                  fontSize: isMobile ? '12px' : '14px' 
                }}>
                  {record.uploader?.username || '未知'}
                </div>
                <Typography.Text 
                  type="secondary" 
                  style={{ 
                    fontSize: isMobile ? '10px' : '12px' 
                  }}
                >
                  {record.uploader?.email || '未知邮箱'}
                </Typography.Text>
              </div>
            </Space>
          );
        }
      },
      {
        title: '统计',
        key: 'stats',
        render: (record: FileData) => (
          <Space size="small">
            <Tooltip title="下载量">
              <span style={{ fontSize: '10px' }}>
                <DownloadOutlined /> {record.downloadCount}
              </span>
            </Tooltip>
            <Tooltip title="查看量">
              <span style={{ fontSize: '10px' }}>
                <EyeOutlined /> {record.viewCount}
              </span>
            </Tooltip>
            <Tooltip title="点赞数">
              <span style={{ fontSize: '10px' }}>
                <LikeOutlined /> {record.likeCount}
              </span>
            </Tooltip>
          </Space>
        )
      },
      {
        title: '可见性',
        dataIndex: 'isPublic',
        key: 'isPublic',
        render: (isPublic: boolean) => (
          <Tag 
            color={isPublic ? 'green' : 'orange'}
            style={{ 
              fontSize: isMobile ? '11px' : '12px' 
            }}
          >
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
          <Space size="small">
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
    
    // 移动端只显示关键列
    if (isMobile) {
      return columns.filter(col => 
        col.key === 'thumbnail' || 
        col.key === 'filename' || 
        col.key === 'fileType' || 
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
          <FileOutlined style={{ marginRight: 8 }} />
          文件管理
        </Typography.Title>

        {/* 统计概览 - 移动端优化 */}
        {isMobile ? (
          <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <MobileStatsCard>
                <Typography.Text strong style={{ fontSize: '12px' }}>总文件数</Typography.Text>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }} className="stats-value">
                  {stats.total}
                </div>
              </MobileStatsCard>
            </Col>
            <Col span={12}>
              <MobileStatsCard>
                <Typography.Text strong style={{ fontSize: '12px' }}>公开文件</Typography.Text>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a' }} className="stats-value">
                  {stats.public}
                </div>
              </MobileStatsCard>
            </Col>
            <Col span={12}>
              <MobileStatsCard>
                <Typography.Text strong style={{ fontSize: '12px' }}>总存储</Typography.Text>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#eb2f96' }} className="stats-value">
                  {formatFileSize(stats.totalSize)}
                </div>
              </MobileStatsCard>
            </Col>
          </Row>
        ) : (
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
        )}

        {/* 搜索和筛选 - 移动端优化 */}
        <SearchCard>
          <MobileSearchForm
            form={searchForm}
            layout={isMobile ? "vertical" : "horizontal"}
            onFinish={handleSearch}
          >
            <Row gutter={isMobile ? 12 : 24}>
              <Col xs={24} md={6}>
                <Form.Item name="search" label="搜索关键词">
                  <Input 
                    placeholder="文件名或描述" 
                    prefix={<SearchOutlined />}
                    size={isMobile ? "middle" : "large"}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="fileType" label="文件类型">
                  <Select 
                    placeholder="请选择类型"
                    size={isMobile ? "middle" : "large"}
                  >
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
                  <Select 
                    placeholder="请选择可见性"
                    size={isMobile ? "middle" : "large"}
                  >
                    <Option value="true">公开</Option>
                    <Option value="false">私有</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
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

        {/* 文件列表 - 移动端优化 */}
        <Card>
          <MobileTable
            dataSource={files}
            columns={getFileColumns(isMobile)}
            rowKey="_id"
            loading={loading}
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
              onChange: (page) => loadFiles(page),
              size: isMobile ? "small" : "default"
            }}
            size={isMobile ? "small" : "middle"}
            scroll={isMobile ? undefined : { x: 1200 }}
          />
        </Card>
      </motion.div>
    </AdminContainer>
  );
};

export default AdminFiles;