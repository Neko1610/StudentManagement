import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  Space,
  message,
  Card,
  Input,
  Typography,
  Tag,
  Avatar,
  Spin,
} from 'antd';
import { useEffect, useState } from 'react';
import { adminService } from '../../api/adminService';

const { Title, Text } = Typography;

const SESSION_MAP: any = {
  AM4: [1, 2, 3, 4],
  AM5: [1, 2, 3, 4, 5],
  PM: [6, 7, 8, 9],
};

export default function AdminSchedules() {
  const [data, setData] = useState<any[]>([]);
  const [raw, setRaw] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const groupSchedules = (data: any[]) => {
    const map = new Map();

    data.forEach((item) => {
      const key = `${item.clazz?.id}-${item.teacher?.id}-${item.subject?.id}-${item.dayOfWeek}`;
      if (!map.has(key)) map.set(key, { ...item, periods: [] });
      map.get(key).periods.push(item.period);
    });

    return Array.from(map.values()).map((r: any) => {
      const session = Object.keys(SESSION_MAP).find((key) =>
        SESSION_MAP[key].every((p: number) => r.periods.includes(p))
      );
      return { ...r, session: session || r.periods.join(',') };
    });
  };

  const loadData = async () => {
    setLoading(true);
    const res = await adminService.getSchedules();
    setRaw(res);
    setData(groupSchedules(res));
    setLoading(false);
  };

  const loadMeta = async () => {
    const [c, t, s] = await Promise.all([
      adminService.getClasses(),
      adminService.getTeachers(),
      adminService.getSubjects(),
    ]);
    setClasses(c);
    setTeachers(t);
    setSubjects(s);
  };

  useEffect(() => {
    loadData();
    loadMeta();
  }, []);

  const handleClassChange = (classId: number) => {
    const clazz = classes.find((c) => c.id === classId);
    form.setFieldsValue({ room: clazz?.room || '' });
  };

  const checkConflict = (values: any) => {
    const periods = SESSION_MAP[values.session];
    return raw.some(
      (r) =>
        r.id !== editing?.id &&
        r.dayOfWeek === values.dayOfWeek &&
        periods.includes(r.period) &&
        (r.teacher?.id === values.teacherId ||
          r.clazz?.id === values.classId)
    );
  };

  const handleSubmit = async (values: any) => {
    try {
      if (checkConflict(values)) {
        message.error('Trùng lịch!');
        return;
      }

      const periods = SESSION_MAP[values.session];

      if (editing) {
        const related = raw.filter(
          (r) =>
            r.clazz?.id === editing.clazz?.id &&
            r.teacher?.id === editing.teacher?.id &&
            r.subject?.id === editing.subject?.id &&
            r.dayOfWeek === editing.dayOfWeek
        );

        for (const r of related) await adminService.deleteSchedule(r.id);
      }

      for (const p of periods) {
        await adminService.createSchedule({
          classId: values.classId,
          subjectId: values.subjectId,
          teacherId: values.teacherId,
          dayOfWeek: values.dayOfWeek,
          period: p,
        });
      }

      message.success(editing ? 'Updated' : 'Created');
      setOpen(false);
      setEditing(null);
      form.resetFields();
      loadData();
    } catch {
      message.error('Error');
    }
  };

  const handleEdit = (record: any) => {
    setEditing(record);
    form.setFieldsValue({
      classId: record.clazz?.id,
      teacherId: record.teacher?.id,
      subjectId: record.subject?.id,
      dayOfWeek: record.dayOfWeek,
      session: record.session,
      room: record.clazz?.room,
    });
    setOpen(true);
  };

  const handleDelete = async (record: any) => {
    const related = raw.filter(
      (r) =>
        r.clazz?.id === record.clazz?.id &&
        r.teacher?.id === record.teacher?.id &&
        r.subject?.id === record.subject?.id &&
        r.dayOfWeek === record.dayOfWeek
    );

    for (const r of related) await adminService.deleteSchedule(r.id);

    message.success('Deleted');
    loadData();
  };

  const columns = [
    {
      title: 'CLASS',
      render: (r: any) => <Text strong>{r.clazz?.name}</Text>,
    },
    {
      title: 'TEACHER',
      render: (r: any) => (
        <Space>
          <Avatar style={{ background: '#E2DFFF', color: '#3525CD' }}>
            {r.teacher?.fullName?.charAt(0)}
          </Avatar>
          {r.teacher?.fullName}
        </Space>
      ),
    },
    {
      title: 'SUBJECT',
      render: (r: any) => (
        <Tag color="blue" style={{ borderRadius: 20 }}>
          {r.subject?.name}
        </Tag>
      ),
    },
    { title: 'DAY', dataIndex: 'dayOfWeek' },
    {
      title: 'SESSION',
      dataIndex: 'session',
      render: (s: string) => (
        <Tag color="purple" style={{ borderRadius: 6 }}>
          {s}
        </Tag>
      ),
    },
    {
      title: 'ROOM',
      render: (r: any) => r.clazz?.room || '—',
    },
    {
      title: 'ACTIONS',
      align: 'right' as const,
      render: (_: any, record: any) => (
        <Space>
          <Button onClick={() => handleEdit(record)}>Edit</Button>
          <Button danger onClick={() => handleDelete(record)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 32, background: '#F8F9FA' }}>
      <Spin spinning={loading}>
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Title level={2} style={{ margin: 0, color: '#1E00A9' }}>
              Academic Schedules
            </Title>
            <Text type="secondary">
              Manage weekly lesson rotations
            </Text>
          </div>

          <Button
            type="primary"
            onClick={() => {
              setEditing(null);
              form.resetFields();
              setOpen(true);
            }}
            style={{ background: '#3525CD', borderRadius: 10 }}
          >
            + Add Schedule
          </Button>
        </div>

        {/* TABLE */}
        <Card style={{ borderLeft: '4px solid #3525CD', borderRadius: 16 }}>
          <Table rowKey="id" dataSource={data} columns={columns} />
        </Card>

        {/* MODAL */}
        <Modal
          open={open}
          onCancel={() => setOpen(false)}
          onOk={() => form.submit()}
          title={editing ? 'Edit Schedule' : 'Add Schedule'}
        >
          <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item name="classId" label="Class" rules={[{ required: true }]}>
              <Select onChange={handleClassChange}>
                {classes.map((c) => (
                  <Select.Option key={c.id} value={c.id}>
                    {c.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="teacherId" label="Teacher" rules={[{ required: true }]}>
              <Select>
                {teachers.map((t) => (
                  <Select.Option key={t.id} value={t.id}>
                    {t.fullName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="subjectId" label="Subject" rules={[{ required: true }]}>
              <Select>
                {subjects.map((s) => (
                  <Select.Option key={s.id} value={s.id}>
                    {s.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="dayOfWeek" label="Day" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="MONDAY">MONDAY</Select.Option>
                <Select.Option value="TUESDAY">TUESDAY</Select.Option>
                <Select.Option value="WEDNESDAY">WEDNESDAY</Select.Option>
                <Select.Option value="THURSDAY">THURSDAY</Select.Option>
                <Select.Option value="FRIDAY">FRIDAY</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="session" label="Session" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="AM4">AM4</Select.Option>
                <Select.Option value="AM5">AM5</Select.Option>
                <Select.Option value="PM">PM</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item name="room" label="Room">
              <Input disabled />
            </Form.Item>
          </Form>
        </Modal>
      </Spin>
    </div>
  );
  <style>{`
  .ant-table {
    border-radius: 12px;
    overflow: hidden;
  }

  /* HEADER */
  .ant-table-thead > tr > th {
    padding: 16px 20px !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    letter-spacing: 0.08em;
    color: #64748b !important;
    background: #f8fafc !important;
  }

  /* BODY */
  .ant-table-tbody > tr > td {
    padding: 18px 20px !important;
    font-size: 14px;
  }

  /* ROW spacing */
  .ant-table-tbody > tr {
    transition: all 0.2s;
  }

  .ant-table-tbody > tr:hover {
    background: #f9fafb;
  }

  /* BUTTON spacing */
  .ant-btn {
    border-radius: 8px;
  }

  /* TAG đẹp hơn */
  .ant-tag {
    padding: 2px 10px;
    font-weight: 600;
  }
`}</style>
}