import React, { useState, useEffect } from 'react';
import {
  Layout,
  Input,
  Button,
  Avatar,
  Typography,
  Space,
  Card,
  Spin,
  message
} from 'antd';
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import api from '../../utils/api';

// 初始化 dayjs 插件
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { Content } = Layout;
const { Text } = Typography;
const { TextArea } = Input;

interface AIChatPageProps {}

const ChatContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #4b5563;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #1f2937;
  border-radius: 12px;
  margin-bottom: 16px;
`;

const MessageBubble = styled.div<{ isAI: boolean }>`
  max-width: 70%;
  margin: 8px 0;
  padding: 8px 16px;
  border-radius: 12px;
  background: ${props => 
    props.isAI 
      ? '#111827'
      : '#1890ff'
  };
  color: ${props => 
    props.isAI 
      ? '#d1d5db'
      : 'white'
  };
  align-self: ${props => props.isAI ? 'flex-start' : 'flex-end'};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const MessageInputContainer = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px 0;
`;

interface Message {
  _id: string;
  senderId: string;
  content: string;
  createdAt: Date;
  isSystemMessage: boolean;
}

const AIChatPage: React.FC<AIChatPageProps> = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // 加载聊天历史
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setInitialLoading(true);
        const response = await api.get('/chat/ai/messages');
        if (response.data.success) {
          // 转换消息格式以匹配前端类型
          const formattedMessages = response.data.data.items.map((msg: any) => ({
            _id: msg._id,
            senderId: msg.senderId,
            content: msg.content,
            createdAt: new Date(msg.createdAt),
            isSystemMessage: msg.isSystemMessage
          }));
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error('加载AI聊天历史失败:', error);
        message.error('加载聊天历史失败');
      } finally {
        setInitialLoading(false);
      }
    };

    if (currentUser) {
      loadChatHistory();
    }
  }, [currentUser]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || loading) return;

    // 添加用户消息到本地状态
    const userMessage: Message = {
      _id: Date.now().toString(),
      senderId: currentUser?._id || '',
      content: messageInput,
      createdAt: new Date(),
      isSystemMessage: false
    };

    setMessages(prev => [...prev, userMessage]);
    setMessageInput('');
    setLoading(true);

    try {
      // 发送消息到AI
      const response = await api.post('/chat/ai/messages', {
        message: messageInput
      });

      if (response.data.success) {
        // 添加AI回复到本地状态
        const aiMessage: Message = {
          _id: response.data.data.reply.messageId || Date.now().toString(),
          senderId: 'AI_SYSTEM',
          content: response.data.data.reply.content,
          createdAt: new Date(response.data.data.reply.timestamp),
          isSystemMessage: true
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        message.error(response.data.message || '发送消息失败');
        // 移除本地添加的用户消息
        setMessages(prev => prev.filter(msg => msg._id !== userMessage._id));
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      message.error('发送消息失败');
      // 移除本地添加的用户消息
      setMessages(prev => prev.filter(msg => msg._id !== userMessage._id));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ChatContainer>
        <ChatHeader>
          <Button 
            type="primary" 
            onClick={() => navigate('/messages')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ← 返回
          </Button>
          <Avatar size={48} icon={<RobotOutlined />} style={{ backgroundColor: '#87d068' }} />
          <div>
            <Text strong style={{ fontSize: '1.2rem', color: '#fff' }}>AI助手</Text>
            <br />
            <Text type="secondary">智能聊天助手，随时为您解答问题</Text>
          </div>
        </ChatHeader>

        {initialLoading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" tip="加载聊天历史..." />
          </div>
        ) : (
          <MessagesContainer>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#B0BEC5' }}>
                <RobotOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <Text style={{ display: 'block', fontSize: '1.1rem' }}>开始与AI助手对话吧！</Text>
                <Text style={{ display: 'block', marginTop: '8px' }}>我可以帮助您解答关于平台使用的问题</Text>
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble key={msg._id} isAI={msg.isSystemMessage}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                    <Avatar 
                      size="small" 
                      icon={msg.isSystemMessage ? <RobotOutlined /> : <UserOutlined />} 
                      style={{ 
                        backgroundColor: msg.isSystemMessage ? '#87d068' : '#1890ff',
                        marginRight: '8px' 
                      }} 
                    />
                    <Text strong style={{ color: msg.isSystemMessage ? '#87d068' : '#fff' }}>
                      {msg.isSystemMessage ? 'AI助手' : '您'}
                    </Text>
                    <Text style={{ marginLeft: '8px', fontSize: '0.75rem', opacity: 0.7 }}>
                      {dayjs(msg.createdAt).fromNow()}
                    </Text>
                  </div>
                  <div>{msg.content}</div>
                </MessageBubble>
              ))
            )}
          </MessagesContainer>
        )}

        <MessageInputContainer>
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
            disabled={loading || initialLoading}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || loading || initialLoading}
            loading={loading}
          >
            发送
          </Button>
        </MessageInputContainer>
      </ChatContainer>
    </motion.div>
  );
};

export default AIChatPage;