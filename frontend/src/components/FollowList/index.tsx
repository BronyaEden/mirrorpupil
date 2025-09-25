import React, { useState, useEffect } from 'react';
import { List, Avatar, Skeleton, Button, Empty, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
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

const FollowButton = styled(Button)`
  margin-left: ${props => props.theme.spacing.md};
`;

const FollowList: React.FC<FollowListProps> = ({ userId, type }) => {
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
        
        setState(prev => ({
          ...prev,
          users: newUsers,
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

  const handleFollow = async (targetUserId: string) => {
    try {
      const response = await authAPI.followUser(targetUserId);
      if (response.data.success) {
        message.success('关注成功');
        // 更新用户列表中的关注状态
        setState(prev => ({
          ...prev,
          users: prev.users.map(user => 
            user._id === targetUserId ? { ...user, isFollowing: true } : user
          )
        }));
      }
    } catch (error: any) {
      console.error('关注失败:', error);
      message.error(error.response?.data?.message || '关注失败');
    }
  };

  const handleUnfollow = async (targetUserId: string) => {
    try {
      const response = await authAPI.unfollowUser(targetUserId);
      if (response.data.success) {
        message.success('取消关注成功');
        // 更新用户列表中的关注状态
        setState(prev => ({
          ...prev,
          users: prev.users.map(user => 
            user._id === targetUserId ? { ...user, isFollowing: false } : user
          )
        }));
      }
    } catch (error: any) {
      console.error('取消关注失败:', error);
      message.error(error.response?.data?.message || '取消关注失败');
    }
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
          <UserItem>
            <UserAvatar
              size={48}
              src={getFullImageUrl(user.avatar) || undefined}
              icon={<UserOutlined />}
            />
            <UserInfo>
              <Username>{user.username}</Username>
              {user.bio && <UserBio>{user.bio}</UserBio>}
              <UserStats>
                <span>关注者: {user.followersCount || 0}</span>
                <span>关注中: {user.followingCount || 0}</span>
              </UserStats>
            </UserInfo>
            {type === 'following' && user.isFollowing !== undefined && (
              user.isFollowing ? (
                <FollowButton 
                  type="default" 
                  danger
                  onClick={() => handleUnfollow(user._id)}
                >
                  取消关注
                </FollowButton>
              ) : (
                <FollowButton 
                  type="primary"
                  onClick={() => handleFollow(user._id)}
                >
                  关注
                </FollowButton>
              )
            )}
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