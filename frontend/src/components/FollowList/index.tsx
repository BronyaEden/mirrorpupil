import React, { useState, useEffect } from 'react';
import { List, Avatar, Skeleton, Button, Empty, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import authAPI from '../../utils/api/auth';
import { User } from '../../types';
import { getFullImageUrl } from '../../utils/imageUtils';

interface FollowListProps {
  userId: string;
  type: 'followers' | 'following';
}

interface FollowListState {
  users: User[];
  loading: boolean;
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

const ListContainer = styled.div`
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: ${props => props.theme.spacing.md};
`;

const UserItem = styled(List.Item)`
  padding: ${props => props.theme.spacing.md} 0;
  border-bottom: 1px solid ${props => props.theme.colors.neutral.gray400};
  cursor: pointer;
  
  &:hover {
    background: ${props => props.theme.colors.background.hover};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const UserAvatar = styled(Avatar)`
  margin-right: ${props => props.theme.spacing.md};
`;

const UserInfo = styled.div`
  flex: 1;
`;

const Username = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 4px;
`;

const UserBio = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: 14px;
  margin-bottom: 8px;
`;

const UserStats = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  
  span {
    color: ${props => props.theme.colors.text.secondary};
    font-size: 14px;
  }
`;

const FollowList: React.FC<FollowListProps> = ({ userId, type }) => {
  const navigate = useNavigate();
  
  const [state, setState] = useState<FollowListState>({
    users: [],
    loading: true,
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true
  });

  useEffect(() => {
    loadUsers(1);
  }, [userId, type]);

  const loadUsers = async (page: number) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      let response;
      if (type === 'followers') {
        response = await authAPI.getUserFollowers(userId, page, state.limit);
      } else {
        response = await authAPI.getUserFollowing(userId, page, state.limit);
      }
      
      if (response.data.success) {
        const { users, pagination } = response.data.data;
        const newUsers = page === 1 ? users : [...state.users, ...users];
        
        // 确保每个用户都有followersCount和followingCount字段，并使用明确的数值
        const usersWithCounts = newUsers.map(user => ({
          ...user,
          // 使用后端明确返回的数量，如果后端没有返回则使用默认值0
          followersCount: user.followersCount !== undefined ? user.followersCount : 0,
          followingCount: user.followingCount !== undefined ? user.followingCount : 0
        }));
        
        setState(prev => ({
          ...prev,
          users: usersWithCounts,
          loading: false,
          page: pagination.page,
          total: pagination.total,
          hasMore: pagination.page < pagination.pages
        }));
      }
    } catch (error: any) {
      console.error('获取用户列表失败:', error);
      message.error(error.response?.data?.message || `获取${type === 'followers' ? '关注者' : '关注中'}列表失败`);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleLoadMore = () => {
    if (state.hasMore) {
      loadUsers(state.page + 1);
    }
  };

  // 添加用户点击跳转功能
  const handleUserClick = (targetUserId: string) => {
    navigate(`/profile/${targetUserId}`);
  };

  if (state.loading && state.users.length === 0) {
    return (
      <ListContainer>
        <Skeleton active paragraph={{ rows: 5 }} />
      </ListContainer>
    );
  }

  if (state.users.length === 0) {
    return (
      <ListContainer>
        <Empty 
          description={`暂无${type === 'followers' ? '关注者' : '关注中'}用户`} 
          style={{ padding: '40px 0' }} 
        />
      </ListContainer>
    );
  }

  return (
    <ListContainer>
      <List
        dataSource={state.users}
        renderItem={(user: User) => (
          <UserItem onClick={() => handleUserClick(user._id)}>
            <UserAvatar
              size={48}
              src={getFullImageUrl(user.avatar) || undefined}
              icon={<UserOutlined />}
            />
            <UserInfo>
              <Username>{user.username}</Username>
              {user.bio && <UserBio>{user.bio}</UserBio>}
              <UserStats>
                <span>关注者: {user.followersCount !== undefined ? user.followersCount : 0}</span>
                <span>关注中: {user.followingCount !== undefined ? user.followingCount : 0}</span>
              </UserStats>
            </UserInfo>
          </UserItem>
        )}
        loading={state.loading && state.users.length > 0}
        loadMore={state.hasMore ? (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Button onClick={handleLoadMore}>加载更多</Button>
          </div>
        ) : null}
      />
    </ListContainer>
  );
};

export default FollowList;