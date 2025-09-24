import React, { useState } from 'react';
import {
  Input,
  List,
  Avatar,
  Typography,
  Card,
  Spin,
  Empty,
  Button,
  Space,
  message
} from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  VerifiedOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { User } from '../../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { useNavigate } from 'react-router-dom';
import authAPI from '../../utils/api/auth';
import { getFullImageUrl } from '../../utils/imageUtils';

// 初始化 dayjs 插件
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Search } = Input;
const { Text } = Typography;

interface UserSearchProps {}

const SearchContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.lg};
`;

const SearchHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
  
  h1 {
    margin: 0 0 ${props => props.theme.spacing.md} 0;
  }
`;

const UserCard = styled(Card)<{ $coverImage?: string }>`
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 1px solid #e0e0e0;
  border-radius: ${props => props.theme.borderRadius.lg};
  margin-bottom: ${props => props.theme.spacing.md};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  height: auto;
  min-height: 150px;
  box-sizing: border-box;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.$coverImage 
      ? `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${props.$coverImage})` 
      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    z-index: 1;
  }
  
  &:hover {
    border-color: #1890ff;
    box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
    transform: translateY(-2px);
  }
  
  // 闪光特效
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
    z-index: 2;
  }
  
  &:hover::after {
    left: 100%;
  }
  
  // 确保内容在背景之上
  & > div {
    position: relative;
    z-index: 3;
  }
`;

const VerifiedBadge = styled.span`
  color: #1890ff;
  font-size: 0.8rem;
  border: 1px solid #1890ff;
  border-radius: 4px;
  padding: 0 4px;
  display: inline-flex;
  align-items: center;
  gap: 2px;
`;

const UserSearch: React.FC<UserSearchProps> = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      setHasSearched(false);
      return;
    }

    setSearchQuery(query);
    setLoading(true);
    setHasSearched(true);

    try {
      // 使用真实API调用替换模拟数据
      const response = await authAPI.searchUsers(query, 1, 20);
      console.log('Search API response:', response.data);
      setUsers(response.data.data.users);
      setLoading(false);
    } catch (error: any) {
      console.error('搜索用户失败:', error);
      message.error('搜索用户失败: ' + (error.response?.data?.message || error.message));
      setLoading(false);
      setUsers([]);
    }
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <SearchContainer>
        <SearchHeader>
          <h1>搜索用户</h1>
          <Search
            placeholder="输入用户名或邮箱搜索用户"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            onChange={(e) => {
              if (!e.target.value) {
                setUsers([]);
                setHasSearched(false);
              }
            }}
          />
        </SearchHeader>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" tip="搜索中..." />
          </div>
        ) : hasSearched ? (
          users.length > 0 ? (
            <List
              dataSource={users}
              renderItem={(user) => {
                // 确保获取完整的图片URL
                const fullCoverImage = user.coverImage ? getFullImageUrl(user.coverImage) : undefined;
                const fullAvatarImage = user.avatar ? getFullImageUrl(user.avatar) : undefined;
                
                console.log('User data:', user);
                console.log('Full cover image URL:', fullCoverImage);
                console.log('Full avatar image URL:', fullAvatarImage);
                
                return (
                  <UserCard 
                    key={user._id} 
                    onClick={() => handleUserClick(user._id)}
                    $coverImage={fullCoverImage}
                  >
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 16, 
                      padding: '20px',
                      height: '100%',
                      boxSizing: 'border-box',
                      position: 'relative',
                      backgroundColor: 'transparent'  // 确保背景透明
                    }}>
                      <Avatar 
                        size={80} 
                        icon={<UserOutlined />} 
                        src={fullAvatarImage}
                        style={{ 
                          border: '3px solid #fff',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                          zIndex: 4  // 确保头像在最上层
                        }}
                      />
                      <div style={{ flex: 1, zIndex: 4 }}>
                        {/* 确保内容在最上层 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                          <Text strong style={{ fontSize: '1.3rem', color: '#fff' }}>
                            {user.username}
                          </Text>
                          {user.isVerified && (
                            <VerifiedBadge>
                              <VerifiedOutlined />
                              已验证
                            </VerifiedBadge>
                          )}
                        </div>
                        <Text type="secondary" ellipsis style={{ 
                          maxWidth: '100%',
                          marginBottom: 12,
                          display: 'block',
                          fontSize: '1rem',
                          color: 'rgba(255, 255, 255, 0.85)'
                        }}>
                          {user.bio || '暂无个人简介'}
                        </Text>
                        <Space size="middle" style={{ marginTop: 8 }}>
                          <Text type="secondary" style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                            关注者: {user.followersCount}
                          </Text>
                          <Text type="secondary" style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                            关注中: {user.followingCount}
                          </Text>
                          <Text type="secondary" style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                            加入于 {dayjs(user.createdAt).fromNow()}
                          </Text>
                        </Space>
                      </div>
                    </div>
                  </UserCard>
                );
              }}

            />
          ) : (
            <Empty
              description="未找到相关用户"
              style={{ color: '#B0BEC5', padding: '60px 0' }}
            />
          )
        ) : (
          <Empty
            description="请输入关键词搜索用户"
            style={{ color: '#B0BEC5', padding: '60px 0' }}
            />
        )}
      </SearchContainer>
    </motion.div>
  );
};

export default UserSearch;