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
  
  // 移动端优化 - 更紧凑
  @media (max-width: 768px) {
    padding: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 8px;
  }
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
  
  // 移动端优化 - 更紧凑
  @media (max-width: 768px) {
    margin-bottom: 16px;
    
    .ant-card-body {
      padding: 16px 12px;
    }
  }
  
  @media (max-width: 480px) {
    margin-bottom: 12px;
    
    .ant-card-body {
      padding: 12px 8px;
    }
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
  
  // 移动端优化 - 更紧凑
  @media (max-width: 768px) {
    margin-bottom: 16px;
    
    .ant-card-body {
      padding: 16px 12px;
      min-height: 200px;
    }
  }
  
  @media (max-width: 480px) {
    margin-bottom: 12px;
    
    .ant-card-body {
      padding: 12px 8px;
      min-height: 150px;
    }
  }
`;

const ChartPlaceholder = styled.div`
  text-align: center;
  color: #999;
  
  .anticon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  
  // 移动端优化 - 更紧凑
  @media (max-width: 768px) {
    .anticon {
      font-size: 36px;
      margin-bottom: 12px;
    }
    
    div {
      font-size: 14px;
    }
  }
  
  @media (max-width: 480px) {
    .anticon {
      font-size: 28px;
      margin-bottom: 8px;
    }
    
    div {
      font-size: 13px;
    }
  }
`;

// 移动端统计卡片优化
const MobileStatsCard = styled(Card)`
  margin-bottom: 12px;
  
  .ant-card-body {
    padding: 12px 8px;
  }
  
  .ant-statistic {
    .ant-statistic-title {
      font-size: 12px;
      margin-bottom: 4px;
    }
    
    .ant-statistic-content {
      font-size: 16px;
      
      .ant-statistic-content-value {
        font-size: 16px;
      }
    }
  }
`;

// 移动端标签页优化
const MobileTabs = styled(Tabs)`
  @media (max-width: 768px) {
    .ant-tabs-nav {
      .ant-tabs-tab {
        padding: 8px 12px;
        font-size: 14px;
      }
    }
  }
  
  @media (max-width: 480px) {
    .ant-tabs-nav {
      .ant-tabs-tab {
        padding: 6px 10px;
        font-size: 13px;
        margin: 0 2px;
      }
    }
  }
`;

// 移动端筛选区域优化
const MobileFilterCard = styled(Card)`
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    margin-bottom: 12px;
    padding: 12px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 8px;
    padding: 8px;
  }
  
  .ant-space {
    flex-wrap: wrap;
    
    @media (max-width: 768px) {
      gap: 8px !important;
    }
    
    @media (max-width: 480px) {
      gap: 6px !important;
    }
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
  
  // 检测是否为移动端
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        <Typography.Title 
          level={isMobile ? 4 : 2} 
          style={{ 
            marginBottom: isMobile ? 16 : 24, 
            color: '#1a365d',
            fontSize: isMobile ? '18px' : '30px'
          }}
        >
          <BarChartOutlined style={{ marginRight: 8 }} />
          数据分析
        </Typography.Title>

        {/* 时间筛选 - 移动端优化 */}
        <MobileFilterCard>
          <Space size={isMobile ? "small" : "large"} wrap>
            <Space size="small">
              <CalendarOutlined />
              <Typography.Text 
                strong 
                style={{ 
                  fontSize: isMobile ? '13px' : '14px' 
                }}
              >
                时间范围:
              </Typography.Text>
            </Space>
            <Select 
              value={period} 
              onChange={handlePeriodChange} 
              style={{ width: isMobile ? 100 : 120 }}
              size={isMobile ? "middle" : "large"}
            >
              <Option value="24h">最近24小时</Option>
              <Option value="7d">最近7天</Option>
              <Option value="30d">最近30天</Option>
            </Select>
            <RangePicker 
              value={dateRange} 
              onChange={handleDateRangeChange}
              disabled={period !== 'custom'}
              size={isMobile ? "middle" : "large"}
              style={{ width: isMobile ? 180 : 220 }}
            />
            <Button 
              icon={<ReloadOutlined />} 
              onClick={loadAnalyticsData}
              loading={loading}
              size={isMobile ? "middle" : "large"}
            >
              刷新数据
            </Button>
          </Space>
        </MobileFilterCard>

        {/* 统计概览 - 移动端优化 */}
        {isMobile ? (
          <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
            <Col span={12}>
              <MobileStatsCard>
                <Statistic
                  title="新增用户"
                  value={analyticsData.userRegistrations.reduce((sum, item) => sum + item.count, 0)}
                  prefix={<UserOutlined style={{ color: '#1890ff', fontSize: '14px' }} />}
                  valueStyle={{ fontSize: '16px' }}
                  titleStyle={{ fontSize: '12px' }}
                />
              </MobileStatsCard>
            </Col>
            <Col span={12}>
              <MobileStatsCard>
                <Statistic
                  title="文件上传"
                  value={analyticsData.fileUploads.reduce((sum, item) => sum + item.count, 0)}
                  prefix={<FileOutlined style={{ color: '#52c41a', fontSize: '14px' }} />}
                  valueStyle={{ fontSize: '16px' }}
                  titleStyle={{ fontSize: '12px' }}
                />
              </MobileStatsCard>
            </Col>
            <Col span={12}>
              <MobileStatsCard>
                <Statistic
                  title="总下载量"
                  value={0} // 需要从后端获取
                  prefix={<DownloadOutlined style={{ color: '#faad14', fontSize: '14px' }} />}
                  valueStyle={{ fontSize: '16px' }}
                  titleStyle={{ fontSize: '12px' }}
                />
              </MobileStatsCard>
            </Col>
            <Col span={12}>
              <MobileStatsCard>
                <Statistic
                  title="总浏览量"
                  value={0} // 需要从后端获取
                  prefix={<EyeOutlined style={{ color: '#722ed1', fontSize: '14px' }} />}
                  valueStyle={{ fontSize: '16px' }}
                  titleStyle={{ fontSize: '12px' }}
                />
              </MobileStatsCard>
            </Col>
          </Row>
        ) : (
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
        )}

        {/* 图表展示 - 移动端优化 */}
        <MobileTabs 
          defaultActiveKey="1" 
          size={isMobile ? "middle" : "large"}
        >
          <TabPane 
            tab={
              <span style={{ fontSize: isMobile ? '14px' : '16px' }}>
                <LineChartOutlined />用户增长趋势
              </span>
            } 
            key="1"
          >
            <ChartCard>
              {loading ? (
                <Spin size="large" />
              ) : analyticsData.userRegistrations.length > 0 ? (
                <ChartPlaceholder>
                  <LineChartOutlined />
                  <div>用户增长趋势图表</div>
                  <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                    （图表功能待实现）
                  </Typography.Text>
                </ChartPlaceholder>
              ) : (
                <ChartPlaceholder>
                  <Alert 
                    message="暂无数据" 
                    description="该时间段内没有用户注册数据" 
                    type="info" 
                    showIcon 
                    style={{ fontSize: '12px' }}
                  />
                </ChartPlaceholder>
              )}
            </ChartCard>
          </TabPane>
          
          <TabPane 
            tab={
              <span style={{ fontSize: isMobile ? '14px' : '16px' }}>
                <BarChartOutlined />文件上传趋势
              </span>
            } 
            key="2"
          >
            <ChartCard>
              {loading ? (
                <Spin size="large" />
              ) : analyticsData.fileUploads.length > 0 ? (
                <ChartPlaceholder>
                  <BarChartOutlined />
                  <div>文件上传趋势图表</div>
                  <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                    （图表功能待实现）
                  </Typography.Text>
                </ChartPlaceholder>
              ) : (
                <ChartPlaceholder>
                  <Alert 
                    message="暂无数据" 
                    description="该时间段内没有文件上传数据" 
                    type="info" 
                    showIcon 
                    style={{ fontSize: '12px' }}
                  />
                </ChartPlaceholder>
              )}
            </ChartCard>
          </TabPane>
          
          <TabPane 
            tab={
              <span style={{ fontSize: isMobile ? '14px' : '16px' }}>
                <PieChartOutlined />文件类型分布
              </span>
            } 
            key="3"
          >
            <ChartCard>
              {loading ? (
                <Spin size="large" />
              ) : analyticsData.fileTypeDistribution.length > 0 ? (
                <ChartPlaceholder>
                  <PieChartOutlined />
                  <div>文件类型分布图表</div>
                  <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                    （图表功能待实现）
                  </Typography.Text>
                </ChartPlaceholder>
              ) : (
                <ChartPlaceholder>
                  <Alert 
                    message="暂无数据" 
                    description="该时间段内没有文件类型分布数据" 
                    type="info" 
                    showIcon 
                    style={{ fontSize: '12px' }}
                  />
                </ChartPlaceholder>
              )}
            </ChartCard>
          </TabPane>
        </MobileTabs>
      </motion.div>
    </AdminContainer>
  );
};

export default AdminAnalytics;