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
  margin: 4px 0;
  padding: 7px 8px;
  border-radius: 15px;
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
  align-self: flex-start;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
  word-wrap: break-word;
  word-break: break-word;
  width: fit-content;
  min-width: 80px;
  max-width: 70vw;
  margin-top: 0;
  font-size: 1rem;
  
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
  width: auto;
  flex: 0 0 auto;
  
  &[data-is-own='true'] {
    align-items: flex-start;
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
  
  ${MessageBubbleWrapper}:hover & {
    opacity: 1;
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

// 添加新的样式组件
const MessageContainer = styled.div<{ isOwn: boolean }>`
  display: flex;
  flex-direction: ${props => props.isOwn ? 'row-reverse' : 'row'};
  align-items: flex-start;
  gap: 8px;
  width: 100%;
`;

const MessageSenderInfo = styled.div<{ isOwn: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
  width: auto;
  justify-content: flex-start;
`;

const SenderName = styled(Text)`
  font-size: 0.75rem;
  color: #9ca3af;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
`;

const SenderAvatar = styled(Avatar)`
  width: 36px;
  height: 36px;
  font-size: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
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

    // 添加调试信息
    console.log('=== 发送消息调试信息 ===');
    console.log('当前用户ID:', currentUser._id, '类型:', typeof currentUser._id);
    console.log('消息内容:', messageInput);

    dispatch(sendMessage({ conversationId: currentConversation._id, content: messageInput }) as any)
      .unwrap()
      .then((sentMessage: Message) => {
        console.log('=== 消息发送成功后的调试信息 ===');
        console.log('发送的消息:', sentMessage);
        console.log('发送者ID:', sentMessage.senderId, '类型:', typeof sentMessage.senderId);
        console.log('当前用户ID:', currentUser._id, '类型:', typeof currentUser._id);
        
        // 修复比较逻辑：处理senderId可能是对象的情况
        let senderIdToCompare = sentMessage.senderId;
        if (typeof sentMessage.senderId === 'object' && sentMessage.senderId !== null && '_id' in sentMessage.senderId) {
          senderIdToCompare = (sentMessage.senderId as any)._id;
          console.log('发送者ID是对象，提取_id字段:', senderIdToCompare);
        }
        
        console.log('ID比较结果 (直接比较):', senderIdToCompare === currentUser._id);
        console.log('ID比较结果 (字符串比较):', String(senderIdToCompare) === String(currentUser._id));
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
    
    // 添加调试信息
    console.log('=== 获取会话参与者调试信息 ===');
    console.log('当前用户ID:', currentUser._id);
    console.log('会话所有参与者:', conversation.participants);
    
    // 修复逻辑：寻找不是当前用户的参与者
    const otherParticipant = conversation.participants.find(
      participant => {
        // 处理参与者ID可能是对象的情况
        const participantId = typeof participant._id === 'object' && participant._id !== null && '_id' in participant._id 
          ? (participant._id as any)._id 
          : participant._id;
        const currentUserId = typeof currentUser._id === 'object' && currentUser._id !== null && '_id' in currentUser._id 
          ? (currentUser._id as any)._id 
          : currentUser._id;
          
        const isNotCurrentUser = String(participantId) !== String(currentUserId);
        console.log(`比较参与者 ${participantId} 与当前用户 ${currentUserId}: ${isNotCurrentUser} (是否为其他参与者)`);
        return isNotCurrentUser;
      }
    ) || conversation.participants[0];
    
    console.log('找到的对方参与者:', otherParticipant);
    return otherParticipant;
  };

  // 在消息渲染部分也添加调试信息
  const renderMessage = (message: Message) => {
    // 调试信息
    console.log('=== 消息渲染调试信息 ===');
    console.log('消息对象:', message);
    console.log('发送者ID:', message.senderId, '类型:', typeof message.senderId);
    console.log('当前用户ID:', currentUser?._id, '类型:', typeof currentUser?._id);
    
    // 修复比较逻辑：处理senderId可能是对象的情况
    let senderIdToCompare = message.senderId;
    if (typeof message.senderId === 'object' && message.senderId !== null && '_id' in message.senderId) {
      senderIdToCompare = (message.senderId as any)._id;
      console.log('发送者ID是对象，提取_id字段:', senderIdToCompare);
    }
    
    console.log('ID比较结果 (直接比较):', senderIdToCompare === currentUser?._id);
    console.log('ID比较结果 (字符串比较):', String(senderIdToCompare) === String(currentUser?._id));
    
    const isOwnMessage = String(senderIdToCompare) === String(currentUser?._id);
    console.log('是否为我方消息:', isOwnMessage);
    
    // 获取发送者信息
    let senderInfo = null;
    if (currentConversation) {
      senderInfo = currentConversation.participants.find(
        participant => {
          // 同样处理参与者ID可能是对象的情况
          const participantId = typeof participant._id === 'object' && participant._id !== null && '_id' in participant._id 
            ? (participant._id as any)._id 
            : participant._id;
          const messageId = typeof message.senderId === 'object' && message.senderId !== null && '_id' in message.senderId 
            ? (message.senderId as any)._id 
            : message.senderId;
          return String(participantId) === String(messageId);
        }
      );
    }
    
    return (
      <MessageContainer isOwn={isOwnMessage}>
        {isOwnMessage && senderInfo ? (
          <>
            <MessageSenderInfo isOwn={isOwnMessage}>
              <SenderName>{senderInfo.username}</SenderName>
              <SenderAvatar 
                src={senderInfo.avatar ? getFullImageUrl(senderInfo.avatar) : undefined}
                icon={<UserOutlined />}
              />
            </MessageSenderInfo>
            <MessageBubbleWrapper
              key={message._id}
              data-is-own={isOwnMessage}
            >
              <MessageBubble isOwn={isOwnMessage}>
                {message.content}
                <br />
                <Text
                  style={{
                    fontSize: '0.8rem',
                    opacity: 0.8,
                    color: isOwnMessage ? 'rgba(255,255,255,0.9)' : 'rgba(243,244,246,0.9)',
                    marginTop: '4px',
                    display: 'block',
                  }}
                >
                  {dayjs(message.createdAt).format('HH:mm')}
                </Text>
              </MessageBubble>
              <MessageActions>
                <Button 
                  type="text" 
                  icon={<CopyOutlined />}
                  size="small"
                  onClick={() => handleMessageAction('copy', message)}
                  style={{ color: isOwnMessage ? 'rgba(255,255,255,0.8)' : 'rgba(243,244,246,0.8)' }}
                />
                <Button 
                  type="text" 
                  icon={<CommentOutlined />}
                  size="small"
                  onClick={() => handleMessageAction('reply', message)}
                  style={{ color: isOwnMessage ? 'rgba(255,255,255,0.8)' : 'rgba(243,244,246,0.8)' }}
                />
              </MessageActions>
            </MessageBubbleWrapper>
          </>
        ) : (
          <>
            {!isOwnMessage && senderInfo && (
              <MessageSenderInfo isOwn={isOwnMessage}>
                <SenderName>{senderInfo.username}</SenderName>
                <SenderAvatar 
                  src={senderInfo.avatar ? getFullImageUrl(senderInfo.avatar) : undefined}
                  icon={<UserOutlined />}
                />
              </MessageSenderInfo>
            )}
            <MessageBubbleWrapper
              key={message._id}
              data-is-own={isOwnMessage}
            >
              <MessageBubble isOwn={isOwnMessage}>
                {message.content}
                <br />
                <Text
                  style={{
                    fontSize: '0.8rem',
                    opacity: 0.8,
                    color: isOwnMessage ? 'rgba(255,255,255,0.9)' : 'rgba(243,244,246,0.9)',
                    marginTop: '4px',
                    display: 'block',
                  }}
                >
                  {dayjs(message.createdAt).format('HH:mm')}
                </Text>
              </MessageBubble>
              <MessageActions>
                <Button 
                  type="text" 
                  icon={<CopyOutlined />}
                  size="small"
                  onClick={() => handleMessageAction('copy', message)}
                  style={{ color: isOwnMessage ? 'rgba(255,255,255,0.8)' : 'rgba(243,244,246,0.8)' }}
                />
                <Button 
                  type="text" 
                  icon={<CommentOutlined />}
                  size="small"
                  onClick={() => handleMessageAction('reply', message)}
                  style={{ color: isOwnMessage ? 'rgba(255,255,255,0.8)' : 'rgba(243,244,246,0.8)' }}
                />
              </MessageActions>
            </MessageBubbleWrapper>
          </>
        )}
      </MessageContainer>
    );
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
                  messages.map(renderMessage)
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