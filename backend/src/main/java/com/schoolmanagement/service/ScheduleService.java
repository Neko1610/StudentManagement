package com.schoolmanagement.service;

import com.schoolmanagement.dto.ScheduleDTO;
import com.schoolmanagement.entity.Clazz;
import com.schoolmanagement.entity.Schedule;
import com.schoolmanagement.entity.Subject;
import com.schoolmanagement.entity.Teacher;
import com.schoolmanagement.repository.ClazzRepository;
import com.schoolmanagement.repository.ScheduleRepository;
import com.schoolmanagement.repository.SubjectRepository;
import com.schoolmanagement.repository.TeacherRepository;
import com.schoolmanagement.util.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScheduleService {
    private final ScheduleRepository scheduleRepository;
    private final ClazzRepository clazzRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;

    public ScheduleService(ScheduleRepository scheduleRepository, ClazzRepository clazzRepository,
            SubjectRepository subjectRepository, TeacherRepository teacherRepository) {
        this.scheduleRepository = scheduleRepository;
        this.clazzRepository = clazzRepository;
        this.subjectRepository = subjectRepository;
        this.teacherRepository = teacherRepository;
    }

    public List<Schedule> getAll() {
        return scheduleRepository.findAll();
    }

    public Schedule getById(Long id) {
        return scheduleRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Schedule not found"));
    }

    public List<ScheduleDTO> getByClass(Long classId) {
        List<Schedule> list = scheduleRepository.findByClazzId(classId);

        return list.stream().map(s -> {
            ScheduleDTO dto = new ScheduleDTO();

            dto.setId(s.getId());
            dto.setDayOfWeek(s.getDayOfWeek().name());
            dto.setPeriod(s.getPeriod());

            dto.setClassName(s.getClazz().getName());
            dto.setSubjectName(s.getSubject().getName());
            dto.setRoom(s.getClazz().getRoom());

            return dto;
        }).toList();
    }

    public List<Schedule> getByTeacher(Long teacherId) {
        return scheduleRepository.findFullByTeacherId(teacherId);
    }

    public Schedule create(Schedule schedule, Long classId, Long subjectId, Long teacherId) {
        Clazz clazz = clazzRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));

        if (!scheduleRepository
                .findByTeacherAndDayOfWeekAndPeriod(teacher, schedule.getDayOfWeek(), schedule.getPeriod()).isEmpty()) {
            throw new IllegalStateException("Teacher already has a class at this time");
        }
        if (!scheduleRepository.findByClazzAndDayOfWeekAndPeriod(clazz, schedule.getDayOfWeek(), schedule.getPeriod())
                .isEmpty()) {
            throw new IllegalStateException("Class already has a subject at this time");
        }

        schedule.setClazz(clazz);
        schedule.setSubject(subject);
        schedule.setTeacher(teacher);
        return scheduleRepository.save(schedule);
    }

    public List<ScheduleDTO> getByTeacherEmail(String email) {

        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Teacher not found")); // 🔥 chuẩn nhất

        List<Schedule> list = scheduleRepository.findFullByTeacherId(teacher.getId());

        return list.stream().map(s -> {
            ScheduleDTO dto = new ScheduleDTO();
            dto.setId(s.getId());
            dto.setClassName(s.getClazz().getName());
            dto.setSubjectName(s.getSubject().getName());
            dto.setRoom(s.getClazz().getRoom());
            dto.setDayOfWeek(s.getDayOfWeek().name());
            dto.setPeriod(s.getPeriod());
            return dto;
        }).toList();
    }

    public Schedule update(Long id, Schedule schedule, Long classId, Long subjectId, Long teacherId) {
        Schedule existing = getById(id);
        Clazz clazz = clazzRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));

        if (!scheduleRepository
                .findByTeacherAndDayOfWeekAndPeriod(teacher, schedule.getDayOfWeek(), schedule.getPeriod()).stream()
                .allMatch(s -> s.getId().equals(id))) {
            throw new IllegalStateException("Teacher already has a class at this time");
        }
        if (!scheduleRepository.findByClazzAndDayOfWeekAndPeriod(clazz, schedule.getDayOfWeek(), schedule.getPeriod())
                .stream().allMatch(s -> s.getId().equals(id))) {
            throw new IllegalStateException("Class already has a subject at this time");
        }

        existing.setClazz(clazz);
        existing.setSubject(subject);
        existing.setTeacher(teacher);
        existing.setDayOfWeek(schedule.getDayOfWeek());
        existing.setPeriod(schedule.getPeriod());
        return scheduleRepository.save(existing);
    }

    public void delete(Long id) {
        scheduleRepository.deleteById(id);
    }
}
