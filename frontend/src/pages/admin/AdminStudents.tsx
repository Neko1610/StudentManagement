import {
  Avatar,
  Button,
  Card,
  Col,
  Input,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  Modal,
  Form,
  message
} from "antd";
import { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { adminService } from "../../api/adminService";

const { Title } = Typography;
const { Option } = Select;

export default function AdminStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState<number | null>(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [parents, setParents] = useState<any[]>([]);
  const [form] = Form.useForm();

  // ================= LOAD =================
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await adminService.getStudents();
      setStudents(res);
    } catch {
      message.error("Lỗi load học sinh");
    }
    setLoading(false);
  };
  const fetchParents = async () => {
    try {
      const res = await adminService.getParents();
      setParents(res);
    } catch {
      message.error("Lỗi load phụ huynh");
    }
  };
  const fetchClasses = async () => {
    try {
      const res = await adminService.getClasses();
      setClasses(res);
    } catch {
      message.error("Lỗi load lớp");
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses();
    fetchParents();
  }, []);

  // ================= FILTER =================
  const filteredData = students.filter((s) => {
    const matchName = s.fullName
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchClass = filterClass
      ? s.classId === filterClass
      : true;

    return matchName && matchClass;
  });

  // ================= CRUD =================

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editing) {
        await adminService.updateStudent(
          editing.id,
          values,
          values.classId,
          values.parentIds
        );
        message.success("Cập nhật thành công");
      } else {
        await adminService.createStudent(
          values,
          values.classId,
          values.parentIds
        );
        message.success("Thêm thành công (đã tạo user)");
      }

      setOpen(false);
      setEditing(null);
      form.resetFields();
      fetchStudents();
    } catch {
      message.error("Lỗi thao tác");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await adminService.deleteStudent(id);
      message.success("Xóa thành công");
      fetchStudents();
    } catch {
      message.error("Xóa thất bại");
    }
  };

  // ================= TABLE =================

  const columns = [
    {
      title: "Học sinh",
      render: (_: any, record: any) => (
        <Space>
          <Avatar style={{ backgroundColor: "#1677ff" }}>
            {record.fullName?.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <div>{record.fullName}</div>
            <small>{record.email}</small>
          </div>
        </Space>
      )
    },
    {
      title: "Mã HS",
      dataIndex: "studentCode"
    },
    {
      title: "Lớp",
      render: (r: any) => r.className || "Chưa có"
    },
    {
      title: "SĐT",
      dataIndex: "phone"
    },
    {
      title: "Giới tính",
      dataIndex: "gender"
    },
    {
      title: "Trạng thái",
      render: (r: any) =>
        r.active ? (
          <Tag color="green">Hoạt động</Tag>
        ) : (
          <Tag color="red">Đã khóa</Tag>
        )
    },
    {
      title: "Hành động",
      render: (r: any) => (
        <Space>
          <Button
            onClick={() => {
              setEditing(r);
              setOpen(true);
              form.setFieldsValue(r);
            }}
          >
            Sửa
          </Button>

          <Button danger onClick={() => handleDelete(r.id)}>
            Xóa
          </Button>

          <Button
            danger={r.active}
            type={r.active ? "default" : "primary"}
            onClick={async () => {
              try {
                await adminService.updateStudent(
                  r.id,
                  { active: !r.active },
                  r.classId
                );
                message.success("Đã cập nhật trạng thái");
                fetchStudents();
              } catch {
                message.error("Lỗi cập nhật");
              }
            }}
          >
            {r.active ? "Tắt" : "Bật"}
          </Button>
        </Space>
      )
    }
  ];

  // ================= UI =================

  return (
    <Card>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Title level={4}>Quản lý học sinh</Title>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(null);
            setOpen(true);
            form.resetFields();
          }}
        >
          Thêm học sinh
        </Button>
      </Row>

      <Row gutter={12} style={{ marginBottom: 16 }}>
        <Col>
          <Input
            placeholder="Tìm theo tên"
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>

        <Col>
          <Select
            placeholder="Lọc theo lớp"
            allowClear
            style={{ width: 200 }}
            onChange={(v) => setFilterClass(v)}
          >
            {classes.map((c) => (
              <Option key={c.id} value={c.id}>
                {c.name}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <Table
        loading={loading}
        dataSource={filteredData}
        columns={columns}
        rowKey="id"
      />

      {/* MODAL */}
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        title={editing ? "Sửa học sinh" : "Thêm học sinh"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="fullName"
            label="Tên học sinh"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="dob"
            label="Ngày sinh"
            rules={[{ required: true }]}
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item name="gender" label="Giới tính">
            <Select>
              <Option value="MALE">Nam</Option>
              <Option value="FEMALE">Nữ</Option>
            </Select>
          </Form.Item>

          <Form.Item name="phone" label="SĐT">
            <Input />
          </Form.Item>

          <Form.Item name="classId" label="Lớp">
            <Select placeholder="Chọn lớp">
              {classes.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="parentIds" label="Phụ huynh">
            <Select
              mode="multiple"
              showSearch
              placeholder="Tìm theo tên hoặc SĐT"
              optionFilterProp="children"
              filterOption={(input, option) => {
                const text = option?.children?.toString().toLowerCase() || "";
                return text.includes(input.toLowerCase());
              }}
            >
              {parents.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.fullName} - {p.phone}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}