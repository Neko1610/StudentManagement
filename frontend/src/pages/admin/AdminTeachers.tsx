import {
  Avatar,
  Button,
  Card,
  Input,
  Modal,
  Form,
  Select,
  Space,
  Table,
  Typography,
  message
} from "antd";
import { useEffect, useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { adminService } from "../../api/adminService";

const { Title } = Typography;

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<number | null>(null);
  const [classFilter, setClassFilter] = useState<number | null>(null);

  const [form] = Form.useForm();

  // ================= LOAD =================
  const fetchTeachers = async () => {
    setLoading(true);
    const res = await adminService.getTeachers();
    setTeachers(res || []);
    setLoading(false);
  };

  const fetchClasses = async () => {
    const res = await adminService.getClasses();
    setClasses(res || []);
  };

  const fetchSubjects = async () => {
    const res = await adminService.getSubjects();
    setSubjects(res || []);
  };

  useEffect(() => {
    fetchTeachers();
    fetchClasses();
    fetchSubjects();
  }, []);

  // ================= HIGHLIGHT =================
  const highlight = (text: string) => {
    if (!search) return text;

    const parts = text.split(new RegExp(`(${search})`, "gi"));

    return parts.map((part, i) =>
      part.toLowerCase() === search.toLowerCase() ? (
        <span key={i} style={{ background: "yellow" }}>
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // ================= CRUD =================
  const handleSubmit = async () => {
    const values = await form.validateFields();
    const teacherId = editing?.id;

    values.email = values.emailPrefix;

    try {
      if (teacherId) {
        await adminService.updateTeacher(
          Number(teacherId),
          values,
          Number(values.subjectId),
          Number(values.classId)
        );
        message.success("Cập nhật thành công");
      } else {
        await adminService.createTeacher(
          values,
          Number(values.subjectId),
          Number(values.classId)
        );
        message.success("Thêm thành công");
      }

      setOpen(false);
      setEditing(null);
      form.resetFields();
      fetchTeachers();
    } catch (err: any) {
      const raw = err?.response?.data;

      const msg =
        typeof raw === "string"
          ? raw
          : raw?.message || raw?.error || "";

      if (msg.includes("CLASS_HAS_HOMEROOM")) {
        Modal.confirm({
          title: "Lớp đã có GVCN",
          content: "Bạn có muốn thay không?",
          onOk: async () => {
            await adminService.updateTeacher(
              Number(teacherId),
              values,
              Number(values.subjectId),
              Number(values.classId),
              true
            );
            fetchTeachers();
          }
        });
      } else if (msg.includes("EMAIL_EXISTS")) {
        message.error("Email đã tồn tại");
      } else {
        message.error("Lỗi thao tác");
      }
    }
  };

  const handleDelete = async (id: number) => {
    await adminService.deleteTeacher(String(id));
    message.success("Đã xóa");
    fetchTeachers();
  };

  const handleEdit = (t: any) => {
    const prefix = t.email
      ?.replace("gv", "")
      .replace("nt@gmail.com", "");

    setEditing(t);
    setOpen(true);

    form.setFieldsValue({
      ...t,
      emailPrefix: prefix
    });
  };

  // ================= FILTER =================
  const filteredData = teachers.filter((t) => {
    const keyword = search.toLowerCase();

    const matchSearch =
      t.fullName?.toLowerCase().includes(keyword) ||
      t.email?.toLowerCase().includes(keyword) ||
      t.phone?.toLowerCase().includes(keyword);

    const matchSubject = subjectFilter
      ? t.subjectId === subjectFilter
      : true;

    const matchClass = classFilter
      ? t.homeroomClassId === classFilter
      : true;

    return matchSearch && matchSubject && matchClass;
  });

  // ================= TABLE =================
  const columns = [
    {
      title: "Giáo viên",
      render: (_: any, r: any) => (
        <Space>
          <Avatar>{r.fullName?.charAt(0)}</Avatar>
          <div>
            <div>{highlight(r.fullName || "")}</div>
            <small>{highlight(r.email || "")}</small>
          </div>
        </Space>
      )
    },
    {
      title: "Môn",
      dataIndex: "subjectName"
    },
    {
      title: "Chủ nhiệm",
      dataIndex: "homeroomClassName"
    },
    {
      title: "SĐT",
      dataIndex: "phone"
    },
    {
      title: "Hành động",
      render: (r: any) => (
        <Space>
          <Button onClick={() => handleEdit(r)}>Sửa</Button>
          <Button danger onClick={() => handleDelete(r.id)}>
            Xóa
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Card>
      <Title level={4}>Quản lý giáo viên</Title>

      {/* SEARCH + FILTER */}
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm giáo viên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 250 }}
        />

        <Select
          placeholder="Môn"
          allowClear
          style={{ width: 160 }}
          onChange={(v) => setSubjectFilter(v)}
        >
          {subjects.map((s) => (
            <Select.Option key={s.id} value={s.id}>
              {s.name}
            </Select.Option>
          ))}
        </Select>

        <Select
          placeholder="Lớp CN"
          allowClear
          style={{ width: 160 }}
          onChange={(v) => setClassFilter(v)}
        >
          {classes.map((c) => (
            <Select.Option key={c.id} value={c.id}>
              {c.name}
            </Select.Option>
          ))}
        </Select>

        <Button
          onClick={() => {
            setSearch("");
            setSubjectFilter(null);
            setClassFilter(null);
          }}
        >
          Reset
        </Button>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(null);
            setOpen(true);
            form.resetFields();
          }}
        >
          Thêm
        </Button>
      </Space>

      <Table rowKey="id" dataSource={filteredData} columns={columns} />

      {/* MODAL */}
      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
        title={editing ? "Sửa giáo viên" : "Thêm giáo viên"}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="fullName" label="Tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          {/* EMAIL PREFIX */}
          <Form.Item label="Email">
            <Space.Compact>
              <Input disabled value="gv" style={{ width: 60 }} />

              <Form.Item name="emailPrefix" noStyle>
                <Input style={{ width: 200 }} />
              </Form.Item>

              <Input disabled value="nt@gmail.com" style={{ width: 150 }} />
            </Space.Compact>
          </Form.Item>

          <Form.Item name="phone" label="SĐT">
            <Input />
          </Form.Item>

          <Form.Item name="subjectId" label="Môn">
            <Select>
              {subjects.map((s) => (
                <Select.Option key={s.id} value={s.id}>
                  {s.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="classId" label="Chủ nhiệm">
            <Select allowClear>
              {classes.map((c) => (
                <Select.Option key={c.id} value={c.id}>
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}