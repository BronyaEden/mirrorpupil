import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Input, 
  Select, 
  Button, 
  Space, 
  Pagination,
  Spin,
  Empty
} from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import FileCard from '../../components/FileCard';

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

const FilesPage: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalFiles, setTotalFiles] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileType, setFileType] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');

  useEffect(() => {
    // 模拟获取文件列表
    const fetchFiles = async () => {
      setLoading(true);
      try {
        // 这里应该调用实际的API获取文件列表
        // const response = await fileAPI.getFiles({
        //   page: currentPage,
        //   limit: 12,
        //   search: searchTerm,
        //   fileType,
        //   sortBy
        // });
        // setFiles(response.data.files);
        // setTotalFiles(response.data.total);
        
        // 模拟数据
        setTimeout(() => {
          const mockFiles = Array.from({ length: 12 }, (_, index) => ({
            _id: `file${index + 1}`,
            filename: `file${index + 1}.pdf`,
            originalName: `File ${index + 1}.pdf`,
            displayName: `文件 ${index + 1}`,
            description: `这是第 ${index + 1} 个示例文件的描述信息`,
            fileType: index % 3 === 0 ? 'image' : index % 3 === 1 ? 'video' : 'document',
            mimeType: 'application/pdf',
            fileSize: 1024000 + index * 100000,
            fileSizeFormatted: `${(1024 + index * 100)}KB`,
            fileUrl: `/uploads/file${index + 1}.pdf`,
            thumbnailUrl: `/uploads/thumbnail${index + 1}.jpg`,
            uploaderId: 'user123',
            uploader: {
              _id: 'user123',
              username: '示例用户',
              avatar: '/uploads/avatar.jpg'
            },
            tags: ['示例', '测试'],
            category: '文档',
            downloadCount: 100 + index * 10,
            viewCount: 500 + index * 50,
            likeCount: 20 + index * 2,
            likes: [],
            isPublic: true,
            isActive: true,
            accessLevel: 'public',
            metadata: {},
            processing: {
              status: 'completed',
              progress: 100
            },
            createdAt: new Date(Date.now() - index * 86400000),
            updatedAt: new Date()
          }));
          
          setFiles(mockFiles);
          setTotalFiles(100);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('获取文件列表失败:', error);
        setLoading(false);
      }
    };

    fetchFiles();
  }, [currentPage, searchTerm, fileType, sortBy]);

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

  const handleDownload = (file: any) => {
    console.log('下载文件:', file);
    // 实现下载逻辑
  };

  const handleLike = (file: any) => {
    console.log('点赞文件:', file);
    // 实现点赞逻辑
  };

  const handleShare = (file: any) => {
    console.log('分享文件:', file);
    // 实现分享逻辑
  };

  const handlePreview = (file: any) => {
    console.log('预览文件:', file);
    // 实现预览逻辑
  };

  return (
    <FilesContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title level={2} style={{ color: '#fff', marginBottom: 32 }}>
          文件库
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
            description="暂无文件"
            style={{ color: '#9ca3af', padding: '60px 0' }}
          />
        )}
      </motion.div>
    </FilesContainer>
  );
};

export default FilesPage;