import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Card,
  Typography,
  Tag,
  Popconfirm,
  Row,
  Col,
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EnvironmentOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { adminService } from '../../api/adminService';

const { Title, Text } = Typography;

export default function AdminClasses() {
  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();

  const loadData = async () => {
    const res = await adminService.getClasses();
    setData(res);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      if (editing) {
        await adminService.updateClass(editing.id, values);
        message.success('Cập nhật thành công');
      } else {
        await adminService.createClass(values);
        message.success('Tạo mới thành công');
      }
      setOpen(false);
      setEditing(null);
      form.resetFields();
      loadData();
    } catch {
      message.error('Đã có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    await adminService.deleteClass(id);
    message.success('Đã xóa lớp học');
    loadData();
  };

  const columns = [
    { 
      title: 'CLASS NAME', 
      dataIndex: 'name',
      render: (text: string) => <Text strong style={{ color: '#3F33D1', fontSize: '14px', fontFamily: 'Manrope' }}>{text}</Text>
    },
    { 
      title: 'GRADE', 
      dataIndex: 'grade',
      render: (grade: string) => (
        <Tag color="blue" style={{ borderRadius: '20px', fontWeight: 700, border: 'none', backgroundColor: '#E2DFFF', color: '#3525CD' }}>
          Grade {grade}
        </Tag>
      )
    },
    { 
      title: 'ROOM', 
      dataIndex: 'room',
      render: (room: string) => (
        <div style={{ backgroundColor: '#F3F4F5', padding: '4px 12px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <EnvironmentOutlined style={{ fontSize: '12px', color: '#464555' }} />
          <Text style={{ fontSize: '12px', fontWeight: 500, color: '#464555' }}>{room}</Text>
        </div>
      )
    },
    {
      title: 'ACTIONS',
      align: 'right' as const,
      width: 120,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            className="hover-action-btn"
            onClick={() => {
              setEditing(record);
              form.setFieldsValue(record);
              setOpen(true);
            }}
          />
          <Popconfirm 
            title="Xóa lớp học này?" 
            onConfirm={() => handleDelete(record.id)} 
            okText="Xóa" 
            cancelText="Hủy" 
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} className="hover-action-btn" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '40px', backgroundColor: '#FCF8FF', minHeight: '100vh', fontFamily: 'Inter' }}>
      
      {/* Header Section */}
      <Row justify="space-between" align="bottom" style={{ marginBottom: '40px' }}>
        <Col>
          <Title level={2} style={{ margin: 0, fontWeight: 800, fontFamily: 'Manrope', letterSpacing: '-0.025em' }}>
            Class Management
          </Title>
          <Text style={{ color: '#464555' }}>Tổ chức các học phần, chỉ định phòng học và quản lý danh sách lớp.</Text>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}
            style={{ 
              height: '48px', padding: '0 24px', backgroundColor: '#3525CD', borderRadius: '10px', 
              fontWeight: 700, boxShadow: '0 10px 20px rgba(53, 37, 205, 0.2)', border: 'none' 
            }}
          >
            Add New Class
          </Button>
        </Col>
      </Row>

      {/* Table Card */}
      <Card 
        bordered={false} 
        style={{ borderRadius: '16px', boxShadow: '0 20px 40px rgba(25,28,29,0.04)', overflow: 'hidden' }}
        bodyStyle={{ padding: 0 }}
        title={<Text strong style={{ fontSize: '16px', fontFamily: 'Manrope' }}>Active Academic Classes</Text>}
      >
        <Table
          rowKey="id"
          dataSource={data}
          columns={columns}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          locale={{ emptyText: 'Không tìm thấy lớp học nào' }}
        />
      </Card>

      {/* Footer Alert */}
      <Row gutter={[24, 24]} style={{ marginTop: '32px' }}>
        <Col xs={24} md={12}>
          <div style={{ backgroundColor: '#E2DFFF30', padding: '24px', borderRadius: '16px', border: '1px solid #E2DFFF', display: 'flex', gap: '16px' }}>
             <div style={{ backgroundColor: '#fff', padding: '10px', borderRadius: '8px', height: 'fit-content', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <InfoCircleOutlined style={{ color: '#3525CD' }} />
             </div>
             <div>
                <Text strong style={{ display: 'block', marginBottom: '4px' }}>Lưu ý về sắp xếp phòng học</Text>
                <Text type="secondary" style={{ fontSize: '13px' }}>Vui lòng kiểm tra xung đột thời gian tại Hall 104 trước khi chỉ định phòng mới.</Text>
             </div>
          </div>
        </Col>
      </Row>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        title={<Title level={4} style={{ fontFamily: 'Manrope', margin: 0 }}>{editing ? 'Chỉnh sửa lớp học' : 'Tạo lớp học mới'}</Title>}
        okText={editing ? "Cập nhật" : "Tạo lớp"}
        okButtonProps={{ style: { backgroundColor: '#3525CD', height: '40px', borderRadius: '8px', fontWeight: 600 } }}
        cancelButtonProps={{ style: { height: '40px', borderRadius: '8px' } }}
        centered
        width={500}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical" style={{ marginTop: '24px' }}>
          <Form.Item name="name" label={<Text strong style={{ fontSize: '12px' }}>TÊN LỚP HỌC</Text>} rules={[{ required: true, message: 'Vui lòng nhập tên lớp' }]}>
            <Input placeholder="Ví dụ: Advanced Theoretical Physics" style={{ borderRadius: '8px', padding: '10px' }} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="grade" label={<Text strong style={{ fontSize: '12px' }}>KHỐI LỚP</Text>} rules={[{ required: true, message: 'Vui lòng nhập khối' }]}>
                <Input placeholder="Ví dụ: 12" style={{ borderRadius: '8px', padding: '10px' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="room" label={<Text strong style={{ fontSize: '12px' }}>PHÒNG HỌC</Text>} rules={[{ required: true, message: 'Vui lòng nhập phòng' }]}>
                <Input placeholder="Ví dụ: Lab 402-A" style={{ borderRadius: '8px', padding: '10px' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <style>{`
        .ant-table-thead > tr > th { 
          background: #F8F9FA !important; 
          font-size: 10px !important; 
          letter-spacing: 0.1em; 
          color: #464555 !important;
          font-weight: 700 !important;
          text-transform: uppercase;
        }
        .ant-table-row:hover { background-color: #F8F9FA; }
        .hover-action-btn:hover { background-color: #F0ECF9 !important; color: #3525CD !important; border-radius: 8px; }
      `}</style>
    </div>
  );
}