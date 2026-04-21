import { Card, Row, Col, Statistic, Spin, Button } from 'antd';
import { TeamOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { adminService } from '../../api/adminService';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    studentCount: 0,
    teacherCount: 0,
    parentCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [students, teachers, parents] = await Promise.all([
        adminService.getStudents(),
        adminService.getTeachers(),
        adminService.getParents(),
      ]);

      setStats({
        studentCount: students.length,
        teacherCount: teachers.length,
        parentCount: parents.length,
      });
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <h1>Admin Dashboard</h1>

        <Row gutter={16}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Students"
                value={stats.studentCount}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Teachers"
                value={stats.teacherCount}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Parents"
                value={stats.parentCount}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12} lg={8}>
            <Card hoverable>
              <h3>Student Management</h3>
              <p>Manage all students in the system</p>
              <Button type="primary" block>
                Go to Students
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card hoverable>
              <h3>Teacher Management</h3>
              <p>Manage all teachers in the system</p>
              <Button type="primary" block>
                Go to Teachers
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card hoverable>
              <h3>Parent Management</h3>
              <p>Manage all parents in the system</p>
              <Button type="primary" block>
                Go to Parents
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
    </Spin>
  );
}
