import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Input, 
  Select, 
  Button, 
  Space, 
  Pagination,
  Spin,
  Empty,
  message
} from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import FileCard from '../../components/FileCard';
import api from '../../utils/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const { Title } = Typography;
const { Option } = Select;

const FilesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: 12px;
  }
`;

const FilterSection = styled(Card)`
  background: rgba(31, 41, 55, 0.5);
  border: 1px solid rgba(75, 85, 99, 0.5);
  border-radius: 8px;
  margin-bottom: 16px;
  
  .desktop-filters {
    display: block;
  }
  
  .mobile-filters {
    display: none;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    margin-bottom: 12px;
    border-radius: 6px;
    
    .ant-card-body {
      padding: 12px;
    }
    
    .desktop-filters {
      display: none;
    }
    
    .mobile-filters {
      display: block;
    }
  }
`;


const FileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
    margin-bottom: 20px;
  }
`;

const UserFilesPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalFiles, setTotalFiles] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileType, setFileType] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const isOwnProfile = !userId || (currentUser?._id === userId);

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const params: any = {
          page: currentPage,
          limit: 12,
          sortBy,
          sortOrder: 'desc',
          uploaderId: userId || currentUser?._id
        };
        
        if (searchTerm) {
          params.search = searchTerm;
        }
        
        if (fileType !== 'all') {
          params.fileType = fileType;
        }
        
        const response = await api.get('/files', { params });
        
        if (response.data.success) {
          setFiles(response.data.data.files);
          setTotalFiles(response.data.data.pagination.total);
        } else {
          message.error(response.data.message || '获取文件列表失败');
        }
        
        setLoading(false);
      } catch (error: any) {
        console.error('获取文件列表失败:', error);
        message.error('获取文件列表失败');
        setLoading(false);
      }
    };

    if (userId || currentUser) {
      fetchFiles();
    }
  }, [currentPage, searchTerm, fileType, sortBy, userId, currentUser]);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleFileTypeChange = (value: string) => {
    setFileType(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleDownload = async (file: any) => {
    try {
      // 调用下载API
      const response = await api.get(`/files/${file._id}/download`, {
        responseType: 'blob'
      });
      
      // 创建下载链接
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.originalName);
      document.body.appendChild(link);
      link.click();
      
      // 清理
      link.remove();
      window.URL.revokeObjectURL(url);
      
      message.success('开始下载文件');
    } catch (error) {
      console.error('下载文件失败:', error);
      message.error('下载文件失败');
    }
  };

  const handleLike = async (file: any) => {
    try {
      const response = await api.post(`/files/${file._id}/like`);
      
      if (response.data.success) {
        // 更新文件列表中的点赞状态
        setFiles(prevFiles => 
          prevFiles.map(f => 
            f._id === file._id 
              ? { ...f, likeCount: response.data.data.likeCount } 
              : f
          )
        );
        
        message.success(response.data.data.isLiked ? '点赞成功' : '取消点赞');
      } else {
        message.error(response.data.message || '操作失败');
      }
    } catch (error) {
      console.error('点赞操作失败:', error);
      message.error('点赞操作失败');
    }
  };

  const handleShare = (file: any) => {
    // 实现分享逻辑
    message.info('分享功能待实现');
  };

  const handlePreview = (file: any) => {
    // 实现预览逻辑
    message.info('预览功能待实现');
  };

  const handleEdit = (file: any) => {
    // 实现编辑逻辑
    message.info('编辑功能待实现');
  };

  const handleDelete = async (file: any) => {
    try {
      const response = await api.delete(`/files/${file._id}`);
      
      if (response.data.success) {
        // 从文件列表中移除
        setFiles(prevFiles => prevFiles.filter(f => f._id !== file._id));
        message.success('文件删除成功');
      } else {
        message.error(response.data.message || '删除失败');
      }
    } catch (error) {
      console.error('删除文件失败:', error);
      message.error('删除文件失败');
    }
  };

  return (
    <FilesContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title level={3} style={{ color: '#fff', marginBottom: 24, fontSize: '18px' }}>
          {isOwnProfile ? '我的文件' : '用户文件'}
        </Title>
        
        <FilterSection size="small">
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {/* 桌面端布局 */}
            <div className="desktop-filters">
              <Space size="small">
                <Input
                  placeholder="搜索文件..."
                  prefix={<SearchOutlined />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onPressEnter={handleSearch}
                  style={{ width: 200, fontSize: '12px' }}
                  size="small"
                />
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} size="small">
                  搜索
                </Button>
              </Space>
            </div>
            
            <div className="desktop-filters">
              <Space size="small">
                <Select
                  placeholder="文件类型"
                  value={fileType}
                  onChange={handleFileTypeChange}
                  style={{ width: 120, fontSize: '12px' }}
                  size="small"
                >
                  <Option value="all">全部类型</Option>
                  <Option value="image">图片</Option>
                  <Option value="video">视频</Option>
                  <Option value="audio">音频</Option>
                  <Option value="document">文档</Option>
                </Select>
                
                <Select
                  placeholder="排序方式"
                  value={sortBy}
                  onChange={handleSortChange}
                  style={{ width: 120, fontSize: '12px' }}
                  size="small"
                >
                  <Option value="createdAt">最新上传</Option>
                  <Option value="downloadCount">最多下载</Option>
                  <Option value="viewCount">最多浏览</Option>
                  <Option value="likeCount">最多点赞</Option>
                </Select>
                
                <Button icon={<FilterOutlined />} size="small">筛选</Button>
              </Space>
            </div>
            
            {/* 移动端布局 */}
            <div className="mobile-filters">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                  <Input
                    placeholder="搜索文件..."
                    prefix={<SearchOutlined />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onPressEnter={handleSearch}
                    size="small"
                    style={{ flex: 1 }}
                  />
                  <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch} size="small">
                    搜索
                  </Button>
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, width: '100%' }}>
                  <Select
                    placeholder="文件类型"
                    value={fileType}
                    onChange={handleFileTypeChange}
                    size="small"
                    style={{ flex: 1, minWidth: '45%' }}
                  >
                    <Option value="all">全部</Option>
                    <Option value="image">图片</Option>
                    <Option value="video">视频</Option>
                    <Option value="audio">音频</Option>
                    <Option value="document">文档</Option>
                  </Select>
                  
                  <Select
                    placeholder="排序"
                    value={sortBy}
                    onChange={handleSortChange}
                    size="small"
                    style={{ flex: 1, minWidth: '45%' }}
                  >
                    <Option value="createdAt">最新</Option>
                    <Option value="downloadCount">下载</Option>
                    <Option value="viewCount">浏览</Option>
                    <Option value="likeCount">点赞</Option>
                  </Select>
                  
                  <Button icon={<FilterOutlined />} size="small" style={{ flex: 1, minWidth: '45%' }}>
                    筛选
                  </Button>
                </div>
              </div>
            </div>
          </Space>
        </FilterSection>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="small" tip="加载中..." />
          </div>
        ) : files.length > 0 ? (
          <>
            <FileGrid>
              {files.map((file) => (
                <FileCard
                  key={file._id}
                  file={file}
                  onDownload={() => handleDownload(file)}
                  onLike={() => handleLike(file)}
                  onShare={() => handleShare(file)}
                  onPreview={() => handlePreview(file)}
                  onEdit={isOwnProfile ? () => handleEdit(file) : undefined}
                  onDelete={isOwnProfile ? () => handleDelete(file) : undefined}
                  showActions={true}
                  isOwner={isOwnProfile}
                />
              ))}
            </FileGrid>
            
            <div style={{ textAlign: 'center' }}>
              <Pagination
                current={currentPage}
                total={totalFiles}
                pageSize={12}
                onChange={setCurrentPage}
                showSizeChanger={false}
                size="small"
              />
            </div>
          </>
        ) : (
          <Empty
            description={isOwnProfile ? "您还没有上传任何文件" : "该用户还没有上传任何文件"}
            style={{ color: '#9ca3af', padding: '40px 0' }}
          />
        )}
      </motion.div>
    </FilesContainer>
  );
};

export default UserFilesPage;