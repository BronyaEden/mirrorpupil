import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../utils/api';
import { Conversation, Message } from '../types';

// 获取用户会话列表
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/chat/conversations');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取会话列表失败');
    }
  }
);

// 获取会话消息
export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}/messages`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '获取消息失败');
    }
  }
);

// 发送消息
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (
    { conversationId, content }: { conversationId: string; content: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(`/chat/conversations/${conversationId}/messages`, {
        content,
        messageType: 'text'
      });
      return response.data.data.message;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || '发送消息失败');
    }
  }
);

interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,
  error: null
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.currentConversation = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取会话列表
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        // 后端返回的是 { conversations: [...], pagination: {...} }
        state.conversations = action.payload.conversations || action.payload.items || action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 获取消息
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        // 后端返回的是 { messages: [...], pagination: {...} }
        state.messages = action.payload.messages || action.payload.items || action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // 发送消息
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setCurrentConversation, clearMessages, addMessage } = chatSlice.actions;
export default chatSlice.reducer;