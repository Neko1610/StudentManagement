import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Typography,
  Card,
  Row,
  Col,
  Popconfirm
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  BookOutlined,
  FilterOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { adminService } from '../../api/adminService';

const { Title, Text } = Typography;

export default function AdminSubjects() {
  const [data, setData] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();

  const loadData = async () => {
    try {
      const res = await adminService.getSubjects();
      setData(res);
    } catch (error) {
      message.error('Không thể tải danh sách môn học');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      if (editing) {
        await adminService.updateSubject(editing.id, values);
        message.success('Cập nhật thành công');
      } else {
        await adminService.createSubject(values);
        message.success('Thêm môn học thành công');
      }
      setOpen(false);
      setEditing(null);
      form.resetFields();
      loadData();
    } catch {
      message.error('Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string) => {
    await adminService.deleteSubject(id);
    message.success('Đã xóa môn học');
    loadData();
  };

  const columns = [
    {
      title: 'SUBJECT NAME',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <Space size="middle">
          <div style={{ 
            width: '36px', height: '36px', backgroundColor: '#E2DFFF', 
            borderRadius: '8px', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', color: '#3525CD' 
          }}>
            <BookOutlined style={{ fontSize: '16px' }} />
          </div>
          <Text strong style={{ color: '#1B1B24', fontSize: '14px', fontFamily: 'Manrope' }}>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      align: 'right' as const,
      width: 120,
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            className="hover-edit-btn"
            onClick={() => {
              setEditing(record);
              form.setFieldsValue(record);
              setOpen(true);
            }}
          />
          <Popconfirm
            title="Xóa môn học này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} className="hover-delete-btn" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '40px', backgroundColor: '#FCF8FF', minHeight: '100vh', fontFamily: 'Inter' }}>
      
      {/* Header */}
      <Row justify="space-between" align="bottom" style={{ marginBottom: '40px' }}>
        <Col>
          <Title level={2} style={{ margin: 0, fontWeight: 800, fontFamily: 'Manrope', color: '#1E00A9' }}>
            Subject Management
          </Title>
          <Text style={{ color: '#464555' }}>Danh sách các môn học chính thức trong hệ thống.</Text>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}
            style={{ 
              backgroundColor: '#3525CD', height: '44px', borderRadius: '10px', 
              fontWeight: 700, border: 'none'
            }}
          >
            Add Subject
          </Button>
        </Col>
      </Row>

      {/* Table Card */}
      <Card 
        bordered={false}
        style={{ borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', overflow: 'hidden' }}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontFamily: 'Manrope' }}>Current Curriculum</span>
            
          </div>
        }
      >
        <Table
          rowKey="id"
          dataSource={data}
          columns={columns}
          pagination={{ pageSize: 10, showSizeChanger: false }}
        />
      </Card>

      {/* Modal */}
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        title={<span style={{ fontFamily: 'Manrope', fontWeight: 700 }}>{editing ? 'Chỉnh sửa môn học' : 'Thêm môn học mới'}</span>}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ style: { backgroundColor: '#3525CD', borderRadius: '6px' } }}
        centered
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical" style={{ marginTop: '20px' }}>
          <Form.Item 
            name="name" 
            label={<Text strong style={{ fontSize: '12px' }}>TÊN MÔN HỌC</Text>} 
            rules={[{ required: true, message: 'Vui lòng nhập tên môn học' }]}
          >
            <Input placeholder="Ví dụ: Toán giải tích 1" style={{ borderRadius: '8px', padding: '10px' }} />
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .ant-table-thead > tr > th {
          background-color: #F8F9FA !important;
          color: #777587 !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .hover-edit-btn:hover { background-color: #F0ECF9 !important; color: #3525CD !important; }
        .hover-delete-btn:hover { background-color: #FFDAD6 !important; color: #BA1A1A !important; }
      `}</style>
    </div>
  );
}