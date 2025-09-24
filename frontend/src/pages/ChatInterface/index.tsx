import React, { useState, useEffect } from 'react';
import {
  Layout,
  List,
  Input,
  Button,
  Avatar,
  Typography,
  Space,
  Card,
  Badge,
  Empty,
  Spin,
  Dropdown,
  Menu,
  message
} from 'antd';
import {
  SendOutlined,
  UserOutlined,
  PlusOutlined,
  CopyOutlined,
  CommentOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Conversation, Message, User } from '../../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { fetchConversations, fetchMessages, sendMessage, setCurrentConversation, clearMessages } from '../../store/chatSlice';

// 初始化 dayjs 插件
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Sider, Content } = Layout;
const { Text } = Typography;
const { TextArea } = Input;

interface ChatInterfaceProps {}

const ChatLayout = styled(Layout)`
  height: calc(100vh - 200px);
  background: transparent;
`;

const MessageActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 4px;
  opacity: 0;
  transition: opacity 0.2s;
  
  .ant-btn {
    padding: 2px 6px;
    font-size: 12px;
  }
`;

const MessageBubbleWrapper = styled.div`
  &:hover ${MessageActions} {
    opacity: 1;
  }
`;

const ConversationSider = styled(Sider)`
  background: #1f2937; /* 替换 theme 引用 */
  border-right: 1px solid #4b5563; /* 替换 theme 引用 */
`;

const ChatContent = styled(Content)`
  background: #111827; /* 替换 theme 引用 */
  display: flex;
  flex-direction: column;
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px; /* 替换 theme 引用 */
`;

const MessageInput = styled.div`
  padding: 16px; /* 替换 theme 引用 */
  border-top: 1px solid #4b5563; /* 替换 theme 引用 */
  display: flex;
  gap: 8px; /* 替换 theme 引用 */
`;

const MessageBubble = styled.div<{ isOwn: boolean }>`
  max-width: 70%;
  margin: 8px 0; /* 替换 theme 引用 */
  padding: 8px 16px; /* 替换 theme 引用 */
  border-radius: 12px; /* 替换 theme 引用 */
  background: ${props => 
    props.isOwn 
      ? '#1890ff' /* 替换 theme 引用 */
      : '#1f2937' /* 替换 theme 引用 */
  };
  color: ${props => 
    props.isOwn 
      ? 'white' 
      : '#d1d5db' /* 替换 theme 引用 */
  };
  align-self: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
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
    dispatch(fetchConversations());
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
    dispatch(setCurrentConversation(conversation));
    // 更新URL以反映当前会话
    navigate(`/chat/${conversation._id}`);
    // 加载消息
    dispatch(clearMessages());
    dispatch(fetchMessages(conversation._id));
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !currentConversation || !currentUser) return;

    dispatch(sendMessage({ conversationId: currentConversation._id, content: messageInput }))
      .unwrap()
      .then(() => {
        setMessageInput('');
        setReplyToMessage(null);
      })
      .catch((error) => {
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ChatLayout>
        <ConversationSider width={300}>
          <div style={{ padding: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} block>
              新建会话
            </Button>
          </div>
          
          {loading && conversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <Spin tip="加载中..." />
            </div>
          ) : (
            <List
              dataSource={conversations}
              renderItem={(conversation) => (
                <List.Item
                  onClick={() => handleSelectConversation(conversation)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor: currentConversation?._id === conversation._id
                      ? 'rgba(0, 217, 255, 0.1)' : 'transparent'
                  }}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={conversation.participants[0]?.username || '未知用户'}
                    description={
                      <Text type="secondary">
                        {dayjs(conversation.lastMessageTime).fromNow()}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </ConversationSider>

        <ChatContent>
          {currentConversation ? (
            <>
              {/* 聊天头部 */}
              <div style={{
                padding: 16,
                borderBottom: '1px solid #434343',
                background: '#2A3441',
                display: 'flex',
                alignItems: 'center',
                gap: 16
              }}>
                <Button 
                  type="primary" 
                  onClick={() => navigate('/messages')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ← 返回
                </Button>
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  <div>
                    <Text strong style={{ color: '#fff' }}>
                      {currentConversation.participants[0]?.username}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '0.85rem' }}>
                      在线
                    </Text>
                  </div>
                </Space>
              </div>

              {/* 回复消息提示 */}
              {replyToMessage && (
                <div style={{
                  padding: '8px 16px',
                  backgroundColor: '#1a2a3a',
                  borderBottom: '1px solid #434343',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Text style={{ color: '#888' }}>
                    回复: {replyToMessage.content?.substring(0, 30)}...
                  </Text>
                  <Button 
                    type="text" 
                    onClick={() => setReplyToMessage(null)}
                    style={{ color: '#ff4d4f' }}
                  >
                    取消
                  </Button>
                </div>
              )}
              
              {/* 消息列表 */}
              <MessageList>
                {loading && messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <Spin tip="加载消息中..." />
                  </div>
                ) : (
                  messages.map((message) => (
                    <MessageBubbleWrapper
                      key={message._id}
                      style={{
                        display: 'flex',
                        justifyContent: message.senderId === currentUser?._id ? 'flex-end' : 'flex-start',
                        marginBottom: 8
                      }}
                    >
                      <MessageBubble isOwn={message.senderId === currentUser?._id}>
                        {message.content}
                        <br />
                        <Text
                          style={{
                            fontSize: '0.75rem',
                            opacity: 0.7,
                            color: message.senderId === currentUser?._id ? 'white' : '#888'
                          }}
                        >
                          {dayjs(message.createdAt).fromNow()}
                        </Text>
                        <MessageActions>
                          <Button 
                            type="text" 
                            icon={<CopyOutlined />}
                            size="small"
                            onClick={() => handleMessageAction('copy', message)}
                          />
                          <Button 
                            type="text" 
                            icon={<CommentOutlined />}
                            size="small"
                            onClick={() => handleMessageAction('reply', message)}
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
                  style={{ flex: 1 }}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                >
                  发送
                </Button>
              </MessageInput>
            </>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%'
            }}>
              <Empty
                description="选择一个会话开始聊天"
                style={{ color: '#B0BEC5' }}
              />
            </div>
          )}
        </ChatContent>
      </ChatLayout>
    </motion.div>
  );
};

export default ChatInterface;