import React, { useState, useEffect } from 'react';
import {
  Layout,
  List,
  Input,
  Button,
  Avatar,
  Typography,
  Space,
  Spin,
  message
} from 'antd';
import {
  SendOutlined,
  UserOutlined,
  PlusOutlined,
  CopyOutlined,
  CommentOutlined
} from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { Conversation, Message } from '../../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { fetchConversations, fetchMessages, sendMessage, setCurrentConversation, clearMessages } from '../../store/chatSlice';
import { getFullImageUrl } from '../../utils/imageUtils';

// 初始化 dayjs 插件
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

// 创建动态渐变动画
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const { Sider, Content } = Layout;
const { Text } = Typography;
const { TextArea } = Input;

interface ChatInterfaceProps {}

const ChatLayout = styled(Layout)`
  height: calc(100vh - 140px); /* 进一步减小高度 */
  background: transparent;
  margin: 15px 15px 30px 15px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border: 2px solid transparent;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: padding-box;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57, #ff9ff3);
    background-size: 300% 300%;
    animation: ${gradientAnimation} 8s ease infinite;
    z-index: -1;
    border-radius: 18px;
  }
`;

const MessageBubble = styled.div<{ isOwn: boolean }>`
  max-width: 70%;
  margin: 4px 0;
  padding: 10px 15px;
  border-radius: 18px;
  background: ${props => 
    props.isOwn 
      ? 'linear-gradient(135deg, #1890ff, #096dd9)' 
      : 'linear-gradient(135deg, #1f2937, #374151)'
  };
  color: ${props => 
    props.isOwn 
      ? 'white' 
      : '#f3f4f6'
  };
  align-self: ${props => (props.isOwn ? 'flex-end' : 'flex-start')};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => 
      props.isOwn 
        ? 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)' 
        : 'linear-gradient(135deg, rgba(255,255,255,0.05), transparent)'
    };
    z-index: 1;
  }
  
  > * {
    position: relative;
    z-index: 2;
  }
`;

const MessageBubbleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  
  &[data-is-own='true'] {
    align-items: flex-end;
  }
`;

const MessageActions = styled.div`
  display: flex;
  gap: 6px;
  margin-top: 4px;
  opacity: 0;
  transition: opacity 0.2s;
  
  .ant-btn {
    padding: 2px 5px;
    font-size: 11px;
  }
`;

const ConversationSider = styled(Sider)`
  background: rgba(31, 41, 55, 0.95);
  border-right: 2px solid rgba(75, 85, 99, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 14px 0 0 14px;
`;

const ChatContent = styled(Content)`
  background: rgba(17, 24, 39, 0.95);
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(10px);
  border-radius: 0 14px 14px 0;
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MessageInput = styled.div`
  padding: 20px;
  border-top: 2px solid rgba(75, 85, 99, 0.5);
  display: flex;
  gap: 12px;
  background: rgba(31, 41, 55, 0.7);
  border-radius: 0 0 14px 0;
`;

const ChatHeader = styled.div`
  padding: 20px;
  border-bottom: 2px solid rgba(75, 85, 99, 0.5);
  background: rgba(42, 52, 65, 0.9);
  display: flex;
  align-items: center;
  gap: 16px;
  backdrop-filter: blur(10px);
  border-radius: 0 14px 0 0;
`;

const BackButton = styled(Button)`
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 12px;
  padding: 8px 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  }
`;

const UserAvatar = styled(Avatar)`
  border: 3px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled(Text)`
  font-size: 1.2rem;
  font-weight: 600;
  color: #fff;
  display: block;
`;

const UserStatus = styled(Text)`
  font-size: 0.9rem;
  color: #9ca3af;
`;

const ReplyContainer = styled.div`
  padding: 12px 20px;
  background: rgba(26, 42, 58, 0.9);
  border-bottom: 2px solid rgba(75, 85, 99, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(10px);
`;

const ReplyText = styled(Text)`
  color: #9ca3af;
  font-size: 0.9rem;
`;

const CancelButton = styled(Button)`
  color: #ff4d4f;
  &:hover {
    background: rgba(255, 77, 79, 0.1);
  }
`;

const SendButton = styled(Button)`
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 12px;
  padding: 0 24px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  }
  
  &:disabled {
    background: #4b5563;
    box-shadow: none;
    transform: none;
  }
`;

const NewConversationButton = styled(Button)`
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 12px;
  margin: 0 12px 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
  }
`;

const ConversationItem = styled(List.Item)`
  background: rgba(31, 41, 55, 0.7);
  margin: 6px 12px;
  padding: 12px !important;
  border-radius: 10px;
  border: 1px solid rgba(75, 85, 99, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    background: rgba(55, 65, 81, 0.8);
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
    border-color: rgba(102, 126, 234, 0.5);
  }
  
  &[data-active="true"] {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
    border-color: rgba(102, 126, 234, 0.8);
  }
`;

const ChatInterface: React.FC<ChatInterfaceProps> = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { conversations, currentConversation, messages, loading } = useSelector((state: RootState) => state.chat);
  
  const [messageInput, setMessageInput] = useState('');
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);

  useEffect(() => {
    // 加载会话列表
    dispatch(fetchConversations() as any);
  }, [dispatch]);

  useEffect(() => {
    // 如果URL中有会话ID，且会话列表已加载完成，自动选择该会话并加载消息
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(conv => conv._id === conversationId);
      if (conversation) {
        handleSelectConversation(conversation);
      }
    }
  }, [conversationId, conversations]);

  const handleSelectConversation = (conversation: Conversation) => {
    dispatch(setCurrentConversation(conversation) as any);
    // 更新URL以反映当前会话
    navigate(`/chat/${conversation._id}`);
    // 加载消息
    dispatch(clearMessages() as any);
    dispatch(fetchMessages(conversation._id) as any);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !currentConversation || !currentUser) return;

    dispatch(sendMessage({ conversationId: currentConversation._id, content: messageInput }) as any)
      .unwrap()
      .then(() => {
        setMessageInput('');
        setReplyToMessage(null);
      })
      .catch((error: any) => {
        message.error(error || '发送消息失败');
      });
  };

  const handleCopyMessage = (message: Message) => {
    navigator.clipboard.writeText(message.content || '');
  };

  const handleReplyToMessage = (message: Message) => {
    setReplyToMessage(message);
  };

  const handleMessageAction = (action: string, message: Message) => {
    switch (action) {
      case 'copy':
        handleCopyMessage(message);
        break;
      case 'reply':
        handleReplyToMessage(message);
        break;
      default:
        break;
    }
  };

  // 获取除了当前用户之外的其他参与者
  const getOtherParticipant = (conversation: Conversation) => {
    if (!currentUser) return conversation.participants[0] || null;
    
    return conversation.participants.find(
      participant => participant._id !== currentUser._id
    ) || conversation.participants[0];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ChatLayout>
        <ConversationSider width={280}>
          <NewConversationButton type="primary" icon={<PlusOutlined />} block>
            新建会话
          </NewConversationButton>
          
          {loading && conversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 16 }}>
              <Spin tip="加载中..." />
            </div>
          ) : (
            <List
              dataSource={conversations}
              renderItem={(conversation) => {
                const otherParticipant = getOtherParticipant(conversation);
                return (
                  <ConversationItem
                    onClick={() => handleSelectConversation(conversation)}
                    data-active={currentConversation?._id === conversation._id}
                  >
                    <List.Item.Meta
                      avatar={
                        <UserAvatar 
                          size={40}
                          icon={<UserOutlined />} 
                          src={otherParticipant?.avatar ? getFullImageUrl(otherParticipant.avatar) : undefined}
                        />
                      }
                      title={
                        <Text strong style={{ color: '#fff', fontSize: '1rem' }}>
                          {otherParticipant?.username}
                        </Text>
                      }
                      description={
                        <Text type="secondary" style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                          {dayjs(conversation.lastMessageTime).fromNow()}
                        </Text>
                      }
                    />
                  </ConversationItem>
                );
              }}
            />
          )}
        </ConversationSider>

        <ChatContent>
          {currentConversation ? (
            <>
              {/* 聊天头部 */}
              <ChatHeader>
                <BackButton 
                  type="primary" 
                  onClick={() => navigate('/messages')}
                >
                  ← 返回消息
                </BackButton>
                <Space>
                  {(() => {
                    const otherParticipant = getOtherParticipant(currentConversation);
                    return (
                      <>
                        <UserAvatar 
                          size={45}
                          icon={<UserOutlined />} 
                          src={otherParticipant?.avatar ? getFullImageUrl(otherParticipant.avatar) : undefined}
                        />
                        <UserInfo>
                          <UserName>
                            {otherParticipant?.username}
                          </UserName>
                          <UserStatus>在线</UserStatus>
                        </UserInfo>
                      </>
                    );
                  })()}
                </Space>
              </ChatHeader>

              {/* 回复消息提示 */}
              {replyToMessage && (
                <ReplyContainer>
                  <ReplyText>
                    回复: {replyToMessage.content?.substring(0, 30)}...
                  </ReplyText>
                  <CancelButton 
                    type="text" 
                    onClick={() => setReplyToMessage(null)}
                  >
                    取消
                  </CancelButton>
                </ReplyContainer>
              )}
              
              {/* 消息列表 */}
              <MessageList>
                {loading && messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 16 }}>
                    <Spin tip="加载消息中..." />
                  </div>
                ) : (
                  messages.map((message) => (
                    <MessageBubbleWrapper
                      key={message._id}
                      data-is-own={message.senderId === currentUser?._id}
                    >
                      <MessageBubble isOwn={message.senderId === currentUser?._id}>
                        {message.content}
                        <br />
                        <Text
                          style={{
                            fontSize: '0.7rem',
                            opacity: 0.8,
                            color: message.senderId === currentUser?._id ? 'rgba(255,255,255,0.9)' : 'rgba(243,244,246,0.9)',
                            marginTop: '4px',
                            display: 'block',
                          }}
                        >
                          {dayjs(message.createdAt).format('HH:mm')}
                        </Text>
                        <MessageActions>
                          <Button 
                            type="text" 
                            icon={<CopyOutlined />}
                            size="small"
                            onClick={() => handleMessageAction('copy', message)}
                            style={{ color: message.senderId === currentUser?._id ? 'rgba(255,255,255,0.8)' : 'rgba(243,244,246,0.8)' }}
                          />
                          <Button 
                            type="text" 
                            icon={<CommentOutlined />}
                            size="small"
                            onClick={() => handleMessageAction('reply', message)}
                            style={{ color: message.senderId === currentUser?._id ? 'rgba(255,255,255,0.8)' : 'rgba(243,244,246,0.8)' }}
                          />
                        </MessageActions>
                      </MessageBubble>
                    </MessageBubbleWrapper>
                  ))
                )}
              </MessageList>

              {/* 消息输入 */}
              <MessageInput>
                <TextArea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="输入消息..."
                  autoSize={{ minRows: 1, maxRows: 4 }}
                  onPressEnter={(e) => {
                    if (!e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  style={{ 
                    flex: 1,
                    borderRadius: 12,
                    background: 'rgba(31, 41, 55, 0.7)',
                    border: '1px solid rgba(75, 85, 99, 0.5)',
                    color: '#f3f4f6',
                  }}
                />
                <SendButton
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                >
                  发送
                </SendButton>
              </MessageInput>
            </>
          ) : (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              color: '#9ca3af',
              fontSize: '1.2rem',
              background: 'rgba(17, 24, 39, 0.95)',
              borderRadius: '0 14px 14px 0',
            }}>
              请选择一个会话开始聊天
            </div>
          )}
        </ChatContent>
      </ChatLayout>
    </motion.div>
  );
};

export default ChatInterface;