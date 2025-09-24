import React, { useState, useEffect } from 'react';
import {
  Layout,
  Input,
  Button,
  Avatar,
  Typography,
  Spin,
  message
} from 'antd';
import {
  SendOutlined,
  RobotOutlined,
  UserOutlined
} from '@ant-design/icons';
import styled, { keyframes } from 'styled-components';
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

// 创建动态渐变动画
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const { Content } = Layout;
const { Text } = Typography;
const { TextArea } = Input;

interface AIChatPageProps {}

const ChatContainer = styled.div`
  max-width: 1200px;
  margin: 20px auto;
  padding: 24px;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
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

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  border-bottom: 2px solid rgba(75, 85, 99, 0.5);
  background: rgba(42, 52, 65, 0.9);
  border-radius: 14px 14px 0 0;
  backdrop-filter: blur(10px);
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

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: rgba(17, 24, 39, 0.95);
  border-radius: 0 0 14px 14px;
  margin-bottom: 16px;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MessageBubble = styled.div<{ isAI: boolean }>`
  max-width: 70%;
  margin: 8px 0;
  padding: 12px 18px;
  border-radius: 20px;
  background: ${props => 
    props.isAI 
      ? 'linear-gradient(135deg, #1f2937, #374151)'
      : 'linear-gradient(135deg, #1890ff, #096dd9)'
  };
  color: ${props => 
    props.isAI 
      ? '#f3f4f6'
      : 'white'
  };
  align-self: ${props => (props.isAI ? 'flex-start' : 'flex-end')};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
      props.isAI 
        ? 'linear-gradient(135deg, rgba(255,255,255,0.05), transparent)' 
        : 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)'
    };
    z-index: 1;
  }
  
  > * {
    position: relative;
    z-index: 2;
  }
`;

const MessageInputContainer = styled.div`
  display: flex;
  gap: 12px;
  padding: 20px;
  background: rgba(31, 41, 55, 0.9);
  border-radius: 14px;
  backdrop-filter: blur(10px);
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

const UserDescription = styled(Text)`
  font-size: 0.9rem;
  color: #9ca3af;
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
  text-align: center;
  padding: 40px;
`;

const EmptyStateIcon = styled(RobotOutlined)`
  font-size: 48px;
  margin-bottom: 16px;
  color: #87d068;
`;

const EmptyStateTitle = styled(Text)`
  display: block;
  font-size: 1.1rem;
  color: #f3f4f6;
  margin-bottom: 8px;
`;

const EmptyStateDescription = styled(Text)`
  display: block;
  font-size: 0.9rem;
  color: #9ca3af;
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ChatContainer>
        <ChatHeader>
          <BackButton 
            type="primary" 
            onClick={() => navigate('/messages')}
          >
            ← 返回消息
          </BackButton>
          <UserAvatar size={50} icon={<RobotOutlined />} style={{ backgroundColor: '#87d068' }} />
          <UserInfo>
            <UserName>AI助手</UserName>
            <UserDescription>智能聊天助手，随时为您解答问题</UserDescription>
          </UserInfo>
        </ChatHeader>

        {initialLoading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" tip="加载聊天历史..." />
          </div>
        ) : (
          <MessagesContainer>
            {messages.length === 0 ? (
              <EmptyStateContainer>
                <EmptyStateIcon />
                <EmptyStateTitle>开始与AI助手对话吧！</EmptyStateTitle>
                <EmptyStateDescription>我可以帮助您解答关于平台使用的问题</EmptyStateDescription>
              </EmptyStateContainer>
            ) : (
              messages.map((msg) => (
                <MessageBubble key={msg._id} isAI={msg.isSystemMessage}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                    <UserAvatar 
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
                    <Text style={{ marginLeft: '8px', fontSize: '0.75rem', opacity: 0.8, color: msg.isSystemMessage ? 'rgba(135, 208, 104, 0.9)' : 'rgba(255, 255, 255, 0.9)' }}>
                      {dayjs(msg.createdAt).format('HH:mm')}
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
            style={{ 
              flex: 1,
              borderRadius: 12,
              background: 'rgba(31, 41, 55, 0.7)',
              border: '1px solid rgba(75, 85, 99, 0.5)',
              color: '#f3f4f6',
            }}
            disabled={loading || initialLoading}
          />
          <SendButton
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || loading || initialLoading}
            loading={loading}
          >
            发送
          </SendButton>
        </MessageInputContainer>
      </ChatContainer>
    </motion.div>
  );
};

export default AIChatPage;