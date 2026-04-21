import { Button, Card, Col, Row, Typography, Space } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  SolutionOutlined, 
  CalendarOutlined, 
  ArrowRightOutlined,
  LayoutOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'ADMINISTRATOR';

  // Định nghĩa style chung cho Card để đồng bộ với trang Login
  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    boxShadow: '0 10px 30px rgba(25, 28, 29, 0.04)',
    height: '100%',
    transition: 'all 0.3s ease'
  };

  const menuItems = [
    { title: 'Students', icon: <UserOutlined />, path: '/admin/students', color: '#3525cd', desc: 'Manage enrollment and profiles.' },
    { title: 'Teachers', icon: <TeamOutlined />, path: '/admin/teachers', color: '#58579b', desc: 'Faculty assignments and schedules.' },
    { title: 'Parents', icon: <SolutionOutlined />, path: '/admin/parents', color: '#7e3000', desc: 'Parent-teacher communication.' },
    { title: 'Schedule', icon: <CalendarOutlined />, path: '/admin/schedules', color: '#3525cd', desc: 'Class timings and room allocation.' },
  ];

  return (
    <div style={{ 
      padding: '40px', 
      minHeight: '100vh', 
      backgroundColor: '#f8f9fa',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"Inter", sans-serif'
    }}>
      {/* Decorative Background Blur */}
      <div style={{ position: 'absolute', top: '0', right: '0', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(53, 37, 205, 0.03)', filter: 'blur(100px)', zIndex: 0 }}></div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ marginBottom: '40px' }}>
          <Space align="center" style={{ marginBottom: '8px' }}>
            <div style={{ padding: '8px', background: '#3525cd', borderRadius: '8px', display: 'flex' }}>
              <LayoutOutlined style={{ color: '#fff', fontSize: '20px' }} />
            </div>
            <Text strong style={{ color: '#3525cd', letterSpacing: '0.1em', fontSize: '12px' }}>MANAGEMENT CONSOLE</Text>
          </Space>
          <Title level={2} style={{ margin: 0, fontWeight: 800, fontSize: '32px', fontFamily: '"Manrope", sans-serif' }}>
            Admin Dashboard
          </Title>
          <Paragraph style={{ color: '#464555', fontSize: '16px', marginTop: '8px' }}>
            Welcome back. Manage your institutional ecosystem with precision.
          </Paragraph>
        </div>

        {/* Bento Grid */}
        <Row gutter={[24, 24]}>
          {menuItems.map((item, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card 
                hoverable
                style={cardStyle}
                bodyStyle={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}
                className="dashboard-card"
              >
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  backgroundColor: `${item.color}15`, 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '20px',
                  color: item.color,
                  fontSize: '24px'
                }}>
                  {item.icon}
                </div>
                
                <Title level={4} style={{ margin: '0 0 8px 0', fontWeight: 700 }}>{item.title}</Title>
                <Paragraph type="secondary" style={{ fontSize: '13px', flexGrow: 1 }}>
                  {item.desc}
                </Paragraph>
                
                <Button 
                  type="text" 
                  onClick={() => navigate(item.path)}
                  style={{ 
                    padding: 0, 
                    color: '#3525cd', 
                    fontWeight: 700, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginTop: '12px'
                  }}
                >
                  Enter Portal <ArrowRightOutlined style={{ fontSize: '12px' }} />
                </Button>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Footer Info */}
        <div style={{ 
          marginTop: '60px', 
          padding: '24px', 
          borderTop: '1px solid rgba(119, 117, 135, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <Text style={{ color: '#777587', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em' }}>CURRENT SESSION</Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#52c41a' }}></div>
              <Text strong style={{ fontSize: '14px', textTransform: 'uppercase' }}>{role}</Text>
            </div>
          </div>
          
          <Text style={{ fontSize: '11px', color: '#777587', fontWeight: 700, letterSpacing: '0.1em', opacity: 0.6 }}>
             © 2024 SCHOLASTIC SANCTUARY • V2.4.1
          </Text>
        </div>
      </div>

      <style>{`
        .dashboard-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(53, 37, 205, 0.08) !important;
          background: #ffffff !important;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;