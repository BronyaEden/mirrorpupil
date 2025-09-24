import React, { useState, useEffect } from 'react';
import {
  Input,
  List,
  Avatar,
  Typography,
  Card,
  Spin,
  Empty,
  Button,
  Space
} from 'antd';
import {
  UserOutlined,
  SearchOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { User } from '../../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { useNavigate } from 'react-router-dom';
import authAPI from '../../utils/api/auth';

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

const UserCard = styled(Card)`
  background: ${props => props.theme.colors.background.secondary};
  border: 1px solid ${props => props.theme.colors.neutral.gray400};
  border-radius: ${props => props.theme.borderRadius.lg};
  margin-bottom: ${props => props.theme.spacing.md};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: ${props => props.theme.shadows.md};
  }
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
      // 模拟API调用
      // const response = await authAPI.searchUsers(query, 1, 20);
      // setUsers(response.data.data.users);
      
      // 模拟数据
      setTimeout(() => {
        setUsers([
          {
            _id: '1',
            username: '张三',
            email: 'zhangsan@example.com',
            avatar: '',
            bio: '热爱技术的前端工程师',
            location: '北京',
            website: 'https://zhangsan.dev',
            followers: [],
            following: [],
            followersCount: 128,
            followingCount: 86,
            isActive: true,
            isVerified: true,
            role: 'user',
            createdAt: new Date('2023-01-15'),
            updatedAt: new Date('2023-01-15'),
            preferences: {
              theme: 'auto',
              language: 'zh-CN',
              notifications: { email: true, push: true }
            }
          },
          {
            _id: '2',
            username: '李四',
            email: 'lisi@example.com',
            avatar: '',
            bio: '全栈开发者，喜欢分享技术',
            location: '上海',
            website: 'https://lisi.dev',
            followers: [],
            following: [],
            followersCount: 95,
            followingCount: 67,
            isActive: true,
            isVerified: false,
            role: 'user',
            createdAt: new Date('2023-03-22'),
            updatedAt: new Date('2023-03-22'),
            preferences: {
              theme: 'auto',
              language: 'zh-CN',
              notifications: { email: true, push: true }
            }
          },
          {
            _id: '3',
            username: '王五',
            email: 'wangwu@example.com',
            avatar: '',
            bio: 'UI/UX设计师，专注于用户体验',
            location: '深圳',
            website: 'https://wangwu.design',
            followers: [],
            following: [],
            followersCount: 210,
            followingCount: 156,
            isActive: true,
            isVerified: true,
            role: 'user',
            createdAt: new Date('2022-11-08'),
            updatedAt: new Date('2022-11-08'),
            preferences: {
              theme: 'auto',
              language: 'zh-CN',
              notifications: { email: true, push: true }
            }
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('搜索用户失败:', error);
      setLoading(false);
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
              renderItem={(user) => (
                <UserCard key={user._id} onClick={() => handleUserClick(user._id)}>
                  <Card.Body style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Avatar 
                      size={48} 
                      icon={<UserOutlined />} 
                      src={user.avatar}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Text strong style={{ fontSize: '1.1rem' }}>
                          {user.username}
                        </Text>
                        {user.isVerified && (
                          <span style={{ 
                            color: '#1890ff', 
                            fontSize: '0.8rem',
                            border: '1px solid #1890ff',
                            borderRadius: '4px',
                            padding: '0 4px'
                          }}>
                            已验证
                          </span>
                        )}
                      </div>
                      <Text type="secondary" ellipsis style={{ maxWidth: '80%' }}>
                        {user.bio || '暂无个人简介'}
                      </Text>
                      <Space style={{ marginTop: 4 }}>
                        <Text type="secondary" style={{ fontSize: '0.85rem' }}>
                          关注者: {user.followersCount}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '0.85rem' }}>
                          关注中: {user.followingCount}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '0.85rem' }}>
                          加入于 {dayjs(user.createdAt).fromNow()}
                        </Text>
                      </Space>
                    </div>
                  </Card.Body>
                </UserCard>
              )}
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