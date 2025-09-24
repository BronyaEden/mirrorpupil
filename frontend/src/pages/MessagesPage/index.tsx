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
  RobotOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Conversation, Message, User } from '../../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchConversations } from '../../store/chatSlice';
import api from '../../utils/api';

// 初始化 dayjs 插件
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Content } = Layout;
const { Text, Title } = Typography;

interface MessagesPageProps {}

const MessagesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px; /* 替换 theme 引用 */
  overflow-y: auto;
  height: calc(100vh - 100px);
`;

const MessagesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px; /* 替换 theme 引用 */
  
  h1 {
    margin: 0;
  }
`;

const ConversationCard = styled(Card)`
  background: #1f2937; /* 替换 theme 引用 */
  border: 1px solid #4b5563; /* 替换 theme 引用 */
  border-radius: 12px; /* 替换 theme 引用 */
  margin-bottom: 16px; /* 替换 theme 引用 */
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #1890ff; /* 替换 theme 引用 */
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* 替换 theme 引用 */
  }
`;

const AIChatCard = styled(ConversationCard)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 1px solid #5a67d8;
  
  & > div {
    display: flex;
    align-items: center;
    gap: 16px; /* 替换 theme 引用 */
    padding: 24px; /* 替换 theme 引用 */
  }
`;

const MessagesPage: React.FC<MessagesPageProps> = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { conversations, loading, error } = useSelector((state: RootState) => state.chat);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null);

  useEffect(() => {
    // 从API加载会话列表
    dispatch(fetchConversations());
  }, [dispatch]);

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
                  const otherParticipant = conversation.participants.find(
                    p => p._id !== 'currentUser'
                  ) || conversation.participants[0];
                  
                  return (
                    <ConversationCard key={conversation._id}>
                      <div 
                        style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px' }}
                        onClick={() => handleConversationClick(conversation)}
                      >
                        <Avatar 
                          size={48} 
                          icon={<UserOutlined />} 
                          src={otherParticipant?.avatar}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text strong style={{ fontSize: '1.1rem', color: '#fff' }}>
                              {otherParticipant?.username}
                            </Text>
                            <Text type="secondary" style={{ color: '#9ca3af' }}>
                              {dayjs(conversation.lastMessageTime).fromNow()}
                            </Text>
                          </div>
                          <Text type="secondary" ellipsis style={{ maxWidth: '80%', color: '#9ca3af' }}>
                            {conversation.lastMessage?.content}
                          </Text>
                        </div>
                        <Button
                          type="text"
                          icon={<DeleteOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conversation);
                          }}
                          style={{ color: '#ff4d4f' }}
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