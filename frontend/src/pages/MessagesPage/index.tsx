import React, { useState, useEffect } from 'react';
import {
  Layout,
  List,
  Button,
  Avatar,
  Typography,
  Space,
  Card,
  Badge,
  Empty,
  Spin,
  Modal,
  message
} from 'antd';
import {
  MessageOutlined,
  UserOutlined,
  PlusOutlined,
  DeleteOutlined,
  RobotOutlined,
  VerifiedOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Conversation, Message, User } from '../../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchConversations } from '../../store/chatSlice';
import api from '../../utils/api';
import { getFullImageUrl } from '../../utils/imageUtils';

// 初始化 dayjs 插件
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Content } = Layout;
const { Text, Title } = Typography;

interface MessagesPageProps {}

const MessagesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  overflow-y: auto;
  height: calc(100vh - 100px);
`;

const MessagesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h1 {
    margin: 0;
  }
`;

const ConversationCard = styled(Card)<{ $coverImage?: string }>`
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border: 1px solid #4b5563;
  border-radius: 12px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  height: auto;
  min-height: 120px;
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

const AIChatCard = styled(ConversationCard)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 1px solid #5a67d8;
  
  & > div {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 24px;
  }
`;

const MessagesPage: React.FC<MessagesPageProps> = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { conversations, loading, error } = useSelector((state: RootState) => state.chat);
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null);

  useEffect(() => {
    // 从API加载会话列表
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    // 检查URL查询参数中是否有conversationId
    const searchParams = new URLSearchParams(location.search);
    const conversationId = searchParams.get('conversationId');
    
    if (conversationId && conversations.length > 0) {
      // 查找对应的会话
      const conversation = conversations.find(conv => conv._id === conversationId);
      if (conversation) {
        // 自动进入该会话
        handleConversationClick(conversation);
      }
    }
  }, [location.search, conversations]);

  const handleConversationClick = (conversation: Conversation) => {
    // 跳转到聊天界面
    navigate(`/chat/${conversation._id}`);
  };

  const handleAIChatClick = () => {
    // 跳转到AI聊天界面
    navigate('/ai-chat');
  };

  const handleDeleteConversation = (conversation: Conversation) => {
    setConversationToDelete(conversation);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (conversationToDelete) {
      try {
        // 调用API离开会话（对于私人会话相当于删除）
        await api.post(`/chat/conversations/${conversationToDelete._id}/leave`);
        // 重新加载会话列表
        dispatch(fetchConversations());
        message.success('会话已删除');
      } catch (err: any) {
        message.error(err.response?.data?.message || '离开会话失败');
      } finally {
        setDeleteModalVisible(false);
        setConversationToDelete(null);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setConversationToDelete(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <MessagesContainer>
        <MessagesHeader>
          <Title level={2}>消息</Title>
          <Button type="primary" icon={<PlusOutlined />}>
            新建会话
          </Button>
        </MessagesHeader>

        {loading && conversations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" tip="加载中..." />
          </div>
        ) : (
          <>
            {/* AI聊天入口 */}
            <AIChatCard onClick={handleAIChatClick}>
              <div>
                <Avatar size={48} icon={<RobotOutlined />} style={{ backgroundColor: '#87d068' }} />
                <div>
                  <Text strong style={{ color: 'white', fontSize: '1.1rem' }}>AI助手</Text>
                  <br />
                  <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>智能聊天助手，随时为您解答问题</Text>
                </div>
              </div>
            </AIChatCard>

            {/* 会话列表 */}
            {conversations.length > 0 ? (
              <List
                dataSource={conversations}
                renderItem={(conversation) => {
                  // 从Redux store获取当前用户ID
                  const currentUserId = currentUser?._id || '';
                  
                  // 找到除了当前用户之外的其他参与者
                  const otherParticipant = conversation.participants.find(
                    p => p._id !== currentUserId
                  ) || conversation.participants[0];
                  
                  // 确保获取完整的图片URL
                  const fullCoverImage = otherParticipant?.coverImage ? getFullImageUrl(otherParticipant.coverImage) : undefined;
                  const fullAvatarImage = otherParticipant?.avatar ? getFullImageUrl(otherParticipant.avatar) : undefined;
                  
                  console.log('Conversation participant:', otherParticipant);
                  console.log('Full cover image URL:', fullCoverImage);
                  console.log('Full avatar image URL:', fullAvatarImage);
                  
                  return (
                    <ConversationCard 
                      key={conversation._id} 
                      $coverImage={fullCoverImage}
                      onClick={() => handleConversationClick(conversation)}
                    >
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 16, 
                        padding: '16px',
                        height: '100%',
                        boxSizing: 'border-box',
                        position: 'relative',
                        backgroundColor: 'transparent'  // 确保背景透明
                      }}>
                        <Avatar 
                          size={60} 
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <Text strong style={{ fontSize: '1.1rem', color: '#fff' }}>
                              {otherParticipant?.username}
                            </Text>
                            {otherParticipant?.isVerified && (
                              <VerifiedBadge>
                                <VerifiedOutlined />
                                已验证
                              </VerifiedBadge>
                            )}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text type="secondary" ellipsis style={{ maxWidth: '70%', color: 'rgba(255, 255, 255, 0.85)' }}>
                              {conversation.lastMessage?.content}
                            </Text>
                            <Text type="secondary" style={{ color: 'rgba(255, 255, 255, 0.7)', flexShrink: 0 }}>
                              {dayjs(conversation.lastMessageTime).fromNow()}
                            </Text>
                          </div>
                        </div>
                        <Button
                          type="text"
                          icon={<DeleteOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conversation);
                          }}
                          style={{ color: '#ff4d4f', zIndex: 4 }}  // 确保按钮在最上层
                        />
                      </div>
                    </ConversationCard>
                  );
                }}
              />
            ) : (
              <Empty
                description="暂无会话"
                style={{ color: '#B0BEC5', padding: '60px 0' }}
              />
            )}
          </>
        )}
      </MessagesContainer>

      {/* 删除确认弹窗 */}
      <Modal
        title="确认删除"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={cancelDelete}
        okText="确认"
        cancelText="取消"
        okButtonProps={{ danger: true }}
      >
        <p>确定要删除这个会话吗？此操作不可撤销。</p>
      </Modal>
    </motion.div>
  );
};

export default MessagesPage;