import React, { useState, useEffect, useRef } from 'react';
import {
  Row,
  Col,
  Input,
  Select,
  Button,
  Space,
  Typography,
  Spin,
  Empty,
  Pagination,
  Card,
  Tag,
  Dropdown
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  AppstoreOutlined,
  BarsOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import FileCard from '../../components/FileCard';
import { FileItem } from '../../types';
import api from '../../utils/api';
import { useViewport } from '../../hooks/useResponsive';
import { mediaQuery } from '../../styles/responsive';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

interface FilterState {
  fileType?: string;
  category?: string;
  sortBy: 'createdAt' | 'downloadCount' | 'likeCount' | 'fileSize';
  sortOrder: 'asc' | 'desc';
  searchTerm: string;
}

const ExplorerContainer = styled.div`
  padding: ${props => props.theme.spacing.lg};
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: ${props => props.theme.spacing.md};
    padding-bottom: 80px; /* 为底部导航栏留出空间 */
  }
`;

const FilterBar = styled(Card)`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.neutral.gray400};
  border-radius: ${props => props.theme.borderRadius.lg};
  margin-bottom: ${props => props.theme.spacing.lg};
  
  .ant-card-body {
    padding: ${props => props.theme.spacing.md};
  }
  
  .desktop-filters {
    display: block;
  }
  
  .mobile-filters {
    display: none;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    .ant-card-body {
      padding: ${props => props.theme.spacing.sm};
    }
    
    .desktop-filters {
      display: none;
    }
    
    .mobile-filters {
      display: block;
    }
    
    .mobile-filters input,
    .mobile-filters .ant-select,
    .mobile-filters .ant-btn {
      font-size: 14px;
    }
    
    .mobile-filters .ant-select-item {
      font-size: 14px;
    }
    
    .mobile-filters .ant-select-selector {
      padding: 0 8px;
    }
  }
  
  @media (max-width: 480px) {
    .ant-card-body {
      padding: 12px;
    }
    
    .mobile-filters input,
    .mobile-filters .ant-select,
    .mobile-filters .ant-btn {
      font-size: 12px;
    }
    
    .mobile-filters .ant-select-item {
      font-size: 12px;
    }
    
    .mobile-filters .ant-select-selector {
      padding: 0 6px;
    }
  }
`;

const ViewToggle = styled(Space)`
  .ant-btn {
    background: transparent;
    border: 1px solid ${props => props.theme.colors.neutral.gray400};
    color: ${props => props.theme.colors.text.secondary};
    
    &.active {
      background: ${props => props.theme.colors.primary.main};
      border-color: ${props => props.theme.colors.primary.main};
      color: white;
    }
  }
`;

const FileGrid = styled.div<{ viewMode: 'grid' | 'list' }>`
  display: grid;
  gap: ${props => props.theme.spacing.lg};
  grid-template-columns: ${props => 
    props.viewMode === 'grid' 
      ? 'repeat(auto-fill, minmax(280px, 1fr))'
      : '1fr'
  };
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    grid-template-columns: ${props => 
      props.viewMode === 'grid' 
        ? 'repeat(auto-fill, minmax(240px, 1fr))'
        : '1fr'
    };
  }
  
  /* 移动端网格布局优化 - 一排两个 */
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${props => props.theme.spacing.sm};
  }
  
  /* 小屏幕设备适配 */
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing.md};
  }
`;

const StatsBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.md};
  color: ${props => props.theme.colors.text.secondary};
  font-size: 0.9rem;
  
  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 0.8rem;
    margin-bottom: ${props => props.theme.spacing.sm};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
`;

const EmptyContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: ${props => props.theme.colors.text.secondary};
`;

const FileExplorer: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
    searchTerm: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const { isMobile } = useViewport();
  const gridRef = useRef<HTMLDivElement>(null);



  // 加载真实数据
  useEffect(() => {
    const loadFiles = async () => {
      setLoading(true);
      try {
        const params: any = {
          page: pagination.current,
          limit: pagination.pageSize,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder
        };
        
        if (filters.fileType) params.fileType = filters.fileType;
        if (filters.category) params.category = filters.category;
        if (filters.searchTerm) params.search = filters.searchTerm;
        
        const response = await api.get('/files', { params });
        
        if (response.data.success) {
          setFiles(response.data.data.files);
          setPagination(prev => ({
            ...prev,
            total: response.data.data.pagination.total
          }));
        }
      } catch (error) {
        console.error('加载文件失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFiles();
  }, [filters, pagination.current, pagination.pageSize]);

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, searchTerm: value }));
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSort = () => {
    setFilters(prev => ({
      ...prev,
      sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFileAction = (action: string, file: FileItem) => {
    switch (action) {
      case 'download':
        // 实现下载逻辑
        window.open(`/api/files/${file._id}/download`, '_blank');
        break;
      case 'like':
        // 实现点赞逻辑
        console.log('点赞文件:', file._id);
        break;
      case 'share':
        // 实现分享逻辑
        console.log('分享文件:', file._id);
        break;
      case 'preview':
        // 实现预览逻辑
        console.log('预览文件:', file._id);
        break;
      default:
        break;
    }
  };

  const sortMenuItems = [
    {
      key: 'createdAt',
      label: '上传时间',
      onClick: () => handleFilterChange('sortBy', 'createdAt')
    },
    {
      key: 'downloadCount',
      label: '下载次数',
      onClick: () => handleFilterChange('sortBy', 'downloadCount')
    },
    {
      key: 'likeCount',
      label: '点赞数',
      onClick: () => handleFilterChange('sortBy', 'likeCount')
    },
    {
      key: 'fileSize',
      label: '文件大小',
      onClick: () => handleFilterChange('sortBy', 'fileSize')
    }
  ];

  return (
    <ExplorerContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Title 
          level={2} 
          style={{ 
            color: '#fff', 
            marginBottom: 32,
            fontSize: '1.5rem',
            textAlign: 'center'
          }}
        >
          文件浏览器
        </Title>
        
        {/* 过滤器和搜索栏 */}
        <FilterBar>
          {/* 桌面端布局 */}
          <div className="desktop-filters">
            <Row gutter={16} align="middle">
              <Col xs={24} sm={12} md={8}>
                <Search
                  placeholder="搜索文件..."
                  enterButton={<SearchOutlined />}
                  size="large"
                  onSearch={handleSearch}
                  allowClear
                  style={{
                    fontSize: '0.9rem'
                  }}
                />
              </Col>
              
              <Col xs={12} sm={6} md={4}>
                <Select
                  placeholder="文件类型"
                  size="large"
                  allowClear
                  style={{ 
                    width: '100%',
                    fontSize: '0.9rem'
                  }}
                  onChange={(value) => handleFilterChange('fileType', value)}
                >
                  <Option value="image">图片</Option>
                  <Option value="video">视频</Option>
                  <Option value="audio">音频</Option>
                  <Option value="document">文档</Option>
                  <Option value="other">其他</Option>
                </Select>
              </Col>
              
              <Col xs={12} sm={6} md={4}>
                <Select
                  placeholder="分类"
                  size="large"
                  allowClear
                  style={{ 
                    width: '100%',
                    fontSize: '0.9rem'
                  }}
                  onChange={(value) => handleFilterChange('category', value)}
                >
                  <Option value="工作文档">工作文档</Option>
                  <Option value="学习资料">学习资料</Option>
                  <Option value="图片素材">图片素材</Option>
                  <Option value="视频内容">视频内容</Option>
                  <Option value="音频文件">音频文件</Option>
                </Select>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Dropdown menu={{ items: sortMenuItems }} placement="bottomRight">
                    <Button 
                      size="large" 
                      icon={<FilterOutlined />}
                      style={{ fontSize: '0.9rem' }}
                    >
                      排序：{{
                        createdAt: '上传时间',
                        downloadCount: '下载次数',
                        likeCount: '点赞数',
                        fileSize: '文件大小'
                      }[filters.sortBy]}
                    </Button>
                  </Dropdown>
                  
                  <Button
                    size="large"
                    icon={filters.sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                    onClick={handleSort}
                    style={{ fontSize: '0.9rem' }}
                  />
                  
                  <ViewToggle>
                    <Button
                      size="large"
                      icon={<AppstoreOutlined />}
                      className={viewMode === 'grid' ? 'active' : ''}
                      onClick={() => setViewMode('grid')}
                      style={{ fontSize: '0.9rem' }}
                    />
                    <Button
                      size="large"
                      icon={<BarsOutlined />}
                      className={viewMode === 'list' ? 'active' : ''}
                      onClick={() => setViewMode('list')}
                      style={{ fontSize: '0.9rem' }}
                    />
                  </ViewToggle>
                </Space>
              </Col>
            </Row>
          </div>
          
          {/* 移动端布局 */}
          <div className="mobile-filters">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <Search
                  placeholder="搜索文件..."
                  enterButton={<SearchOutlined />}
                  size="small"
                  onSearch={handleSearch}
                  allowClear
                  style={{
                    flex: 1,
                    fontSize: '0.8rem'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <Select
                  placeholder="文件类型"
                  size="small"
                  allowClear
                  style={{ 
                    flex: 1,
                    minWidth: '45%',
                    fontSize: '0.8rem'
                  }}
                  onChange={(value) => handleFilterChange('fileType', value)}
                >
                  <Option value="image">图片</Option>
                  <Option value="video">视频</Option>
                  <Option value="audio">音频</Option>
                  <Option value="document">文档</Option>
                  <Option value="other">其他</Option>
                </Select>
                
                <Select
                  placeholder="分类"
                  size="small"
                  allowClear
                  style={{ 
                    flex: 1,
                    minWidth: '45%',
                    fontSize: '0.8rem'
                  }}
                  onChange={(value) => handleFilterChange('category', value)}
                >
                  <Option value="工作文档">工作文档</Option>
                  <Option value="学习资料">学习资料</Option>
                  <Option value="图片素材">图片素材</Option>
                  <Option value="视频内容">视频内容</Option>
                  <Option value="音频文件">音频文件</Option>
                </Select>
                
                <Select
                  placeholder="排序方式"
                  size="small"
                  style={{ 
                    flex: 1,
                    minWidth: '45%',
                    fontSize: '0.8rem'
                  }}
                  value={filters.sortBy}
                  onChange={(value) => handleFilterChange('sortBy', value)}
                  dropdownStyle={{ fontSize: '0.8rem' }}
                >
                  <Option value="createdAt">上传时间</Option>
                  <Option value="downloadCount">下载次数</Option>
                  <Option value="likeCount">点赞数</Option>
                  <Option value="fileSize">文件大小</Option>
                </Select>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px' }}>
                <Button
                  size="small"
                  icon={filters.sortOrder === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
                  onClick={handleSort}
                  style={{ fontSize: '0.8rem', flex: 1 }}
                >
                  {filters.sortOrder === 'asc' ? '升序' : '降序'}
                </Button>
                
                <ViewToggle size={2}>
                  <Button
                    size="small"
                    icon={<AppstoreOutlined />}
                    className={viewMode === 'grid' ? 'active' : ''}
                    onClick={() => setViewMode('grid')}
                    style={{ fontSize: '0.8rem' }}
                  />
                  <Button
                    size="small"
                    icon={<BarsOutlined />}
                    className={viewMode === 'list' ? 'active' : ''}
                    onClick={() => setViewMode('list')}
                    style={{ fontSize: '0.8rem' }}
                  />
                </ViewToggle>
              </div>
            </div>
          </div>
        </FilterBar>
        
        {/* 统计信息 */}
        <StatsBar>
          <span>共找到 {pagination.total} 个文件</span>
          <Space wrap>
            {filters.fileType && <Tag color="blue" style={{ fontSize: '0.7rem' }}>类型：{filters.fileType}</Tag>}
            {filters.category && <Tag color="green" style={{ fontSize: '0.7rem' }}>分类：{filters.category}</Tag>}
            {filters.searchTerm && <Tag color="orange" style={{ fontSize: '0.7rem' }}>搜索：{filters.searchTerm}</Tag>}
          </Space>
        </StatsBar>
        
        {/* 文件列表 */}
        {loading ? (
          <LoadingContainer>
            <Spin size="large" tip="加载中..." />
          </LoadingContainer>
        ) : files.length === 0 ? (
          <EmptyContainer>
            <Empty 
              description="没有找到相关文件"
              style={{ color: '#B0BEC5' }}
            />
          </EmptyContainer>
        ) : (
          <>
            <FileGrid ref={gridRef} viewMode={viewMode}>
              {files.map((file, index) => (
                <motion.div
                  key={file._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <FileCard
                    file={file}
                    onDownload={(file) => handleFileAction('download', file)}
                    onLike={(file) => handleFileAction('like', file)}
                    onShare={(file) => handleFileAction('share', file)}
                    onPreview={(file) => handleFileAction('preview', file)}
                    showActions={true}
                  />
                </motion.div>
              ))}
            </FileGrid>
            
            {/* 分页 */}
            {pagination.total > pagination.pageSize && (
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) => 
                    `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
                  }
                  onChange={(page, pageSize) => 
                    setPagination(prev => ({ ...prev, current: page, pageSize }))
                  }
                />
              </div>
            )}
          </>
        )}
      </motion.div>
    </ExplorerContainer>
  );
};

export default FileExplorer;