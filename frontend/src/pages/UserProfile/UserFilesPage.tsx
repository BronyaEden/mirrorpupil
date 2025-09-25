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
  padding: 24px;
`;

const FilterSection = styled(Card)`
  background: rgba(31, 41, 55, 0.5);
  border: 1px solid rgba(75, 85, 99, 0.5);
  border-radius: 12px;
  margin-bottom: 24px;
`;

const FileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
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
        <Title level={2} style={{ color: '#fff', marginBottom: 32 }}>
          {isOwnProfile ? '我的文件' : '用户文件'}
        </Title>
        
        <FilterSection>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Space>
              <Input
                placeholder="搜索文件..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onPressEnter={handleSearch}
                style={{ width: 300 }}
              />
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                搜索
              </Button>
            </Space>
            
            <Space>
              <Select
                placeholder="文件类型"
                value={fileType}
                onChange={handleFileTypeChange}
                style={{ width: 150 }}
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
                style={{ width: 150 }}
              >
                <Option value="createdAt">最新上传</Option>
                <Option value="downloadCount">最多下载</Option>
                <Option value="viewCount">最多浏览</Option>
                <Option value="likeCount">最多点赞</Option>
              </Select>
              
              <Button icon={<FilterOutlined />}>更多筛选</Button>
            </Space>
          </Space>
        </FilterSection>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" tip="加载中..." />
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
              />
            </div>
          </>
        ) : (
          <Empty
            description={isOwnProfile ? "您还没有上传任何文件" : "该用户还没有上传任何文件"}
            style={{ color: '#9ca3af', padding: '60px 0' }}
          />
        )}
      </motion.div>
    </FilesContainer>
  );
};

export default UserFilesPage;