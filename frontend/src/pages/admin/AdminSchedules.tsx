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
} from 'antd';
import { useEffect, useState } from 'react';
import { adminService } from '../../api/adminService';

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
  const [form] = Form.useForm();

  // ===== GROUP =====
  const groupSchedules = (data: any[]) => {
    const map = new Map();

    data.forEach((item) => {
      const key = `${item.clazz?.id}-${item.teacher?.id}-${item.subject?.id}-${item.dayOfWeek}`;

      if (!map.has(key)) {
        map.set(key, { ...item, periods: [] });
      }

      map.get(key).periods.push(item.period);
    });

    return Array.from(map.values()).map((r: any) => {
      const session = Object.keys(SESSION_MAP).find((key) =>
        SESSION_MAP[key].every((p: number) => r.periods.includes(p))
      );

      return {
        ...r,
        session: session || r.periods.join(','),
      };
    });
  };

  // ===== LOAD =====
  const loadData = async () => {
    const res = await adminService.getSchedules();
    setRaw(res);
    setData(groupSchedules(res));
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

  // ===== AUTO ROOM =====
  const handleClassChange = (classId: number) => {
    const clazz = classes.find(c => c.id === classId);
    form.setFieldsValue({ room: clazz?.room || '' });
  };

  // ===== CHECK CONFLICT =====
  const checkConflict = (values: any) => {
    const periods = SESSION_MAP[values.session];

    return raw.some(r =>
      r.id !== editing?.id &&
      r.dayOfWeek === values.dayOfWeek &&
      periods.includes(r.period) &&
      (
        r.teacher?.id === values.teacherId ||
        r.clazz?.id === values.classId
      )
    );
  };

  // ===== CREATE =====
  const handleCreate = async (values: any) => {
    const periods = SESSION_MAP[values.session];

    for (const p of periods) {
      await adminService.createSchedule({
        classId: values.classId,
        subjectId: values.subjectId,
        teacherId: values.teacherId,
        dayOfWeek: values.dayOfWeek,
        period: p,
      });
    }
  };

  // ===== UPDATE =====
  const handleUpdate = async (values: any) => {
    const periods = SESSION_MAP[values.session];

    const related = raw.filter(r =>
      r.clazz?.id === editing.clazz?.id &&
      r.teacher?.id === editing.teacher?.id &&
      r.subject?.id === editing.subject?.id &&
      r.dayOfWeek === editing.dayOfWeek
    );

    for (const r of related) {
      await adminService.deleteSchedule(r.id);
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
  };

  // ===== SUBMIT =====
  const handleSubmit = async (values: any) => {
    try {
      if (checkConflict(values)) {
        message.error('Trùng lịch!');
        return;
      }

      if (editing) {
        await handleUpdate(values);
        message.success('Updated');
      } else {
        await handleCreate(values);
        message.success('Created');
      }

      setOpen(false);
      setEditing(null);
      form.resetFields();
      loadData();
    } catch {
      message.error('Error');
    }
  };

  // ===== EDIT =====
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

  // ===== DELETE =====
  const handleDelete = async (record: any) => {
    const related = raw.filter(r =>
      r.clazz?.id === record.clazz?.id &&
      r.teacher?.id === record.teacher?.id &&
      r.subject?.id === record.subject?.id &&
      r.dayOfWeek === record.dayOfWeek
    );

    for (const r of related) {
      await adminService.deleteSchedule(r.id);
    }

    message.success('Deleted');
    loadData();
  };

  // ===== TABLE =====
  const columns = [
    { title: 'Class', render: (r: any) => r.clazz?.name },
    { title: 'Teacher', render: (r: any) => r.teacher?.fullName },
    { title: 'Subject', render: (r: any) => r.subject?.name },
    { title: 'Day', dataIndex: 'dayOfWeek' },
    { title: 'Session', dataIndex: 'session' },
    { title: 'Room', render: (r: any) => r.clazz?.room || '—' },
    {
      title: 'Actions',
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
    <Card
      title="Schedules"
      extra={
        <Button
          type="primary"
          onClick={() => {
            setEditing(null);
            form.resetFields();
            setOpen(true);
          }}
        >
          + Add Schedule
        </Button>
      }
    >
      <Table rowKey="id" dataSource={data} columns={columns} />

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        title={editing ? 'Edit Schedule' : 'Add Schedule'}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          
          <Form.Item name="classId" label="Class" rules={[{ required: true }]}>
            <Select onChange={handleClassChange}>
              {classes.map(c => (
                <Select.Option key={c.id} value={c.id}>
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="teacherId" label="Teacher" rules={[{ required: true }]}>
            <Select>
              {teachers.map(t => (
                <Select.Option key={t.id} value={t.id}>
                  {t.fullName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="subjectId" label="Subject" rules={[{ required: true }]}>
            <Select>
              {subjects.map(s => (
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

          <Form.Item label="Room" name="room">
            <Input disabled />
          </Form.Item>

        </Form>
      </Modal>
    </Card>
  );
}