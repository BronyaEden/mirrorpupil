import React, { useState, useEffect, useRef } from 'react';
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
  Spin
} from 'antd';
import {
  SendOutlined,
  UserOutlined,
  PlusOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Conversation, Message, User } from '../../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

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

const ConversationSider = styled(Sider)`
  background: ${props => props.theme.colors.background.secondary};
  border-right: 1px solid ${props => props.theme.colors.neutral.gray400};
`;

const ChatContent = styled(Content)`
  background: ${props => props.theme.colors.background.surface};
  display: flex;
  flex-direction: column;
`;

const MessageList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${props => props.theme.spacing.md};
`;

const MessageInput = styled.div`
  padding: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.neutral.gray400};
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const MessageBubble = styled.div<{ isOwn: boolean }>`
  max-width: 70%;
  margin: ${props => props.theme.spacing.sm} 0;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => 
    props.isOwn 
      ? props.theme.colors.primary.main 
      : props.theme.colors.background.secondary
  };
  color: ${props => 
    props.isOwn 
      ? 'white' 
      : props.theme.colors.text.primary
  };
  align-self: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
`;

// 模拟数据
const mockConversations: Conversation[] = [
  {
    _id: '1',
    participants: [
      {
        _id: 'user1',
        username: '张三',
        email: 'zhangsan@example.com',
        avatar: '',
        bio: '',
        location: '',
        website: '',
        followers: [],
        following: [],
        followersCount: 0,
        followingCount: 0,
        isActive: true,
        isVerified: false,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
        preferences: {
          theme: 'auto',
          language: 'zh-CN',
          notifications: { email: true, push: true }
        }
      }
    ],
    conversationType: 'private',
    lastMessageTime: new Date('2024-01-20T10:30:00'),
    lastActivity: new Date('2024-01-20T10:30:00'),
    isActive: true,
    participantCount: 2,
    settings: {
      allowInvites: true,
      muteNotifications: false
    },
    admins: [],
    createdBy: 'currentUser',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  }
];

const mockMessages: Message[] = [
  {
    _id: '1',
    conversationId: '1',
    senderId: 'user1',
    messageType: 'text',
    content: '你好！最近怎么样？',
    readBy: [],
    isEdited: false,
    isDeleted: false,
    reactions: [],
    mentions: [],
    isSystemMessage: false,
    isRead: true,
    readCount: 1,
    createdAt: new Date('2024-01-20T10:25:00'),
    updatedAt: new Date('2024-01-20T10:25:00')
  },
  {
    _id: '2',
    conversationId: '1',
    senderId: 'currentUser',
    messageType: 'text',
    content: '很好啊！你呢？',
    readBy: [],
    isEdited: false,
    isDeleted: false,
    reactions: [],
    mentions: [],
    isSystemMessage: false,
    isRead: true,
    readCount: 1,
    createdAt: new Date('2024-01-20T10:30:00'),
    updatedAt: new Date('2024-01-20T10:30:00')
  }
];

const ChatInterface: React.FC<ChatInterfaceProps> = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 模拟加载会话列表
    setTimeout(() => {
      setConversations(mockConversations);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    // 自动滚动到最新消息
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // 模拟加载消息
    setMessages(mockMessages);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage: Message = {
      _id: Date.now().toString(),
      conversationId: selectedConversation._id,
      senderId: 'currentUser',
      messageType: 'text',
      content: messageInput,
      readBy: [],
      isEdited: false,
      isDeleted: false,
      reactions: [],
      mentions: [],
      isSystemMessage: false,
      isRead: false,
      readCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');
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
          
          {loading ? (
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
                    backgroundColor: selectedConversation?._id === conversation._id
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
          {selectedConversation ? (
            <>
              {/* 聊天头部 */}
              <div style={{
                padding: 16,
                borderBottom: '1px solid #434343',
                background: '#2A3441'
              }}>
                <Space>
                  <Avatar icon={<UserOutlined />} />
                  <div>
                    <Text strong style={{ color: '#fff' }}>
                      {selectedConversation.participants[0]?.username}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '0.85rem' }}>
                      在线
                    </Text>
                  </div>
                </Space>
              </div>

              {/* 消息列表 */}
              <MessageList>
                {messages.map((message) => (
                  <div
                    key={message._id}
                    style={{
                      display: 'flex',
                      justifyContent: message.senderId === 'currentUser' ? 'flex-end' : 'flex-start',
                      marginBottom: 8
                    }}
                  >
                    <MessageBubble isOwn={message.senderId === 'currentUser'}>
                      {message.content}
                      <br />
                      <Text
                        style={{
                          fontSize: '0.75rem',
                          opacity: 0.7,
                          color: message.senderId === 'currentUser' ? 'white' : '#888'
                        }}
                      >
                        {dayjs(message.createdAt).fromNow()}
                      </Text>
                    </MessageBubble>
                  </div>
                ))}
                <div ref={messagesEndRef} />
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