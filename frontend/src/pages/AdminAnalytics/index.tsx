import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Button,
  DatePicker,
  Select,
  Typography,
  Tabs,
  Alert,
  Spin
} from 'antd';
import {
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  ReloadOutlined,
  UserOutlined,
  FileOutlined,
  DownloadOutlined,
  EyeOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import adminAPI from '../../utils/api/admin';

// 初始化 dayjs
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;

// 样式组件
const AdminContainer = styled.div`
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
`;

const StatsCard = styled(Card)`
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  
  .ant-card-body {
    padding: 20px;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
  }
`;

const ChartCard = styled(Card)`
  margin-bottom: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  
  .ant-card-body {
    padding: 20px;
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const ChartPlaceholder = styled.div`
  text-align: center;
  color: #999;
  
  .anticon {
    font-size: 48px;
    margin-bottom: 16px;
  }
`;

// 接口定义
interface AnalyticsData {
  userRegistrations: Array<{
    _id: string;
    count: number;
  }>;
  fileUploads: Array<{
    _id: string;
    count: number;
    totalSize: number;
  }>;
  fileTypeDistribution: Array<{
    _id: string;
    count: number;
    totalSize: number;
  }>;
}

const AdminAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    userRegistrations: [],
    fileUploads: [],
    fileTypeDistribution: []
  });
  const [period, setPeriod] = useState('7d');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // 加载分析数据
  useEffect(() => {
    loadAnalyticsData();
  }, [period]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAnalytics(period);
      setAnalyticsData(response.data.data);
    } catch (error) {
      console.error('加载分析数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 处理周期变化
  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    setDateRange(null);
  };

  // 处理日期范围变化
  const handleDateRangeChange = (dates: [dayjs.Dayjs, dayjs.Dayjs] | null) => {
    setDateRange(dates);
    if (dates) {
      setPeriod('custom');
    }
  };

  return (
    <AdminContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography.Title level={2} style={{ marginBottom: 24, color: '#1a365d' }}>
          <BarChartOutlined style={{ marginRight: 8 }} />
          数据分析
        </Typography.Title>

        {/* 时间筛选 */}
        <Card style={{ marginBottom: 24 }}>
          <Space size="large">
            <Space>
              <CalendarOutlined />
              <Typography.Text strong>时间范围:</Typography.Text>
            </Space>
            <Select value={period} onChange={handlePeriodChange} style={{ width: 120 }}>
              <Option value="24h">最近24小时</Option>
              <Option value="7d">最近7天</Option>
              <Option value="30d">最近30天</Option>
            </Select>
            <RangePicker 
              value={dateRange} 
              onChange={handleDateRangeChange}
              disabled={period !== 'custom'}
            />
            <Button 
              icon={<ReloadOutlined />} 
              onClick={loadAnalyticsData}
              loading={loading}
            >
              刷新数据
            </Button>
          </Space>
        </Card>

        {/* 统计概览 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <StatsCard>
              <Statistic
                title="新增用户"
                value={analyticsData.userRegistrations.reduce((sum, item) => sum + item.count, 0)}
                prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              />
            </StatsCard>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatsCard>
              <Statistic
                title="文件上传"
                value={analyticsData.fileUploads.reduce((sum, item) => sum + item.count, 0)}
                prefix={<FileOutlined style={{ color: '#52c41a' }} />}
              />
            </StatsCard>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatsCard>
              <Statistic
                title="总下载量"
                value={0} // 需要从后端获取
                prefix={<DownloadOutlined style={{ color: '#faad14' }} />}
              />
            </StatsCard>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatsCard>
              <Statistic
                title="总浏览量"
                value={0} // 需要从后端获取
                prefix={<EyeOutlined style={{ color: '#722ed1' }} />}
              />
            </StatsCard>
          </Col>
        </Row>

        {/* 图表展示 */}
        <Tabs defaultActiveKey="1" size="large">
          <TabPane 
            tab={<span><LineChartOutlined />用户增长趋势</span>} 
            key="1"
          >
            <ChartCard>
              {loading ? (
                <Spin size="large" />
              ) : analyticsData.userRegistrations.length > 0 ? (
                <ChartPlaceholder>
                  <LineChartOutlined />
                  <div>用户增长趋势图表</div>
                  <Typography.Text type="secondary">（图表功能待实现）</Typography.Text>
                </ChartPlaceholder>
              ) : (
                <ChartPlaceholder>
                  <Alert 
                    message="暂无数据" 
                    description="该时间段内没有用户注册数据" 
                    type="info" 
                    showIcon 
                  />
                </ChartPlaceholder>
              )}
            </ChartCard>
          </TabPane>
          
          <TabPane 
            tab={<span><BarChartOutlined />文件上传趋势</span>} 
            key="2"
          >
            <ChartCard>
              {loading ? (
                <Spin size="large" />
              ) : analyticsData.fileUploads.length > 0 ? (
                <ChartPlaceholder>
                  <BarChartOutlined />
                  <div>文件上传趋势图表</div>
                  <Typography.Text type="secondary">（图表功能待实现）</Typography.Text>
                </ChartPlaceholder>
              ) : (
                <ChartPlaceholder>
                  <Alert 
                    message="暂无数据" 
                    description="该时间段内没有文件上传数据" 
                    type="info" 
                    showIcon 
                  />
                </ChartPlaceholder>
              )}
            </ChartCard>
          </TabPane>
          
          <TabPane 
            tab={<span><PieChartOutlined />文件类型分布</span>} 
            key="3"
          >
            <ChartCard>
              {loading ? (
                <Spin size="large" />
              ) : analyticsData.fileTypeDistribution.length > 0 ? (
                <ChartPlaceholder>
                  <PieChartOutlined />
                  <div>文件类型分布图表</div>
                  <Typography.Text type="secondary">（图表功能待实现）</Typography.Text>
                </ChartPlaceholder>
              ) : (
                <ChartPlaceholder>
                  <Alert 
                    message="暂无数据" 
                    description="该时间段内没有文件类型分布数据" 
                    type="info" 
                    showIcon 
                  />
                </ChartPlaceholder>
              )}
            </ChartCard>
          </TabPane>
        </Tabs>
      </motion.div>
    </AdminContainer>
  );
};

export default AdminAnalytics;