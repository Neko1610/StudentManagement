package com.schoolmanagement.service;

import com.schoolmanagement.entity.Clazz;
import com.schoolmanagement.entity.Schedule;
import com.schoolmanagement.entity.Subject;
import com.schoolmanagement.entity.Teacher;
import com.schoolmanagement.repository.ClazzRepository;
import com.schoolmanagement.repository.ScheduleRepository;
import com.schoolmanagement.repository.StudentRepository;
import com.schoolmanagement.repository.SubjectRepository;
import com.schoolmanagement.repository.TeacherRepository;
import com.schoolmanagement.util.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class TeacherService {
    private final TeacherRepository teacherRepository;
    private final SubjectRepository subjectRepository;
    private final ClazzRepository clazzRepository;
    private final ScheduleRepository scheduleRepository;
    private final StudentRepository studentRepository;

    public TeacherService(TeacherRepository teacherRepository,
            SubjectRepository subjectRepository,
            ClazzRepository clazzRepository,
            ScheduleRepository scheduleRepository,
            StudentRepository studentRepository) {
        this.teacherRepository = teacherRepository;
        this.subjectRepository = subjectRepository;
        this.clazzRepository = clazzRepository;
        this.scheduleRepository = scheduleRepository;
        this.studentRepository = studentRepository;

    }

    private String generateEmail(String fullName) {
        if (fullName == null || fullName.isEmpty())
            return null;

        String normalized = java.text.Normalizer.normalize(fullName, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .replaceAll("đ", "d")
                .replaceAll("Đ", "d")
                .toLowerCase()
                .replaceAll("\\s+", "");

        return "gv" + normalized + "tn@gmail.com";
    }

    public List<Clazz> getAllClassesForTeacher(String email) {

        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Long teacherId = teacher.getId();

        // 🔹 class chủ nhiệm
        List<Clazz> homeroom = clazzRepository.findByHomeroomTeacherId(teacherId);

        // 🔹 class dạy
        List<Schedule> schedules = scheduleRepository.findByTeacherId(teacherId);

        Set<Clazz> teaching = new HashSet<>();
        for (Schedule s : schedules) {
            teaching.add(s.getClazz());
        }

        // 🔹 merge
        Map<Long, Clazz> map = new HashMap<>();
        for (Clazz c : homeroom) {
            map.put(c.getId(), c);
        }
        for (Clazz c : teaching) {
            map.put(c.getId(), c);
        }

        // 🔥 🔥 🔥 THÊM ĐOẠN NÀY
        for (Clazz c : map.values()) {
            int count = studentRepository.countStudentsByClassId(c.getId());
                                  
            c.setStudentCount(count);

            System.out.println("CLASS " + c.getName() + " = " + count);
        }

        return new ArrayList<>(map.values());
    }

    public List<Teacher> getAll() {
        List<Teacher> teachers = teacherRepository.findAll();

        for (Teacher t : teachers) {

            // 👉 Subject
            if (t.getSubject() != null) {
                t.setSubjectName(t.getSubject().getName());
                t.setSubjectId(t.getSubject().getId());
            }
            if (t.getPhone() == null) {
                t.setPhone("");
            }
            // 👉 Homeroom
            List<Clazz> clazzList = clazzRepository.findByHomeroomTeacherId(t.getId());

            if (clazzList != null && !clazzList.isEmpty()) {
                t.setHomeroomClassName(clazzList.get(0).getName());
                t.setHomeroomClassId(clazzList.get(0).getId());
            }
        }

        return teachers;
    }

    public Teacher getById(Long id) {
        return teacherRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
    }

    public Teacher getByEmail(String email) {
        return teacherRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Teacher not found with email: " + email));
    }

    public Teacher create(Teacher teacher) {
        teacher.setId(null);

        // 👉 EMAIL
        if (teacher.getEmail() == null || teacher.getEmail().isEmpty()) {
            teacher.setEmail(generateEmail(teacher.getFullName()));
        }

        // 👉 SUBJECT
        if (teacher.getSubjectId() != null) {
            Subject subject = subjectRepository.findById(teacher.getSubjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

            teacher.setSubject(subject);
        }

        // 👉 SAVE trước để có ID
        Teacher savedTeacher = teacherRepository.save(teacher);

        // 👉 HOMEROOM CLASS
        if (teacher.getHomeroomClassId() != null) {
            Clazz clazz = clazzRepository.findById(teacher.getHomeroomClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

            clazz.setHomeroomTeacher(savedTeacher);
            clazzRepository.save(clazz); // 🔥 bắt buộc
        }

        return savedTeacher;
    }

    public Teacher update(Long id, Teacher update, Long subjectId, Long classId) {
        Teacher existing = getById(id);

        // 👉 BASIC
        if (update.getPhone() != null)
            existing.setPhone(update.getPhone());

        existing.setFullName(update.getFullName());
        existing.setDob(update.getDob());
        existing.setDegree(update.getDegree());

        // 👉 EMAIL
        if (update.getEmail() == null || update.getEmail().isEmpty()) {
            existing.setEmail(generateEmail(update.getFullName()));
        } else {
            existing.setEmail(update.getEmail());
        }

        // 👉 SUBJECT
        if (subjectId != null) {
            Subject subject = subjectRepository.findById(subjectId)
                    .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));

            existing.setSubject(subject);
        }

        // 👉 HOMEROOM (QUAN TRỌNG NHẤT)
        if (classId != null) {

            // 🔥 1. clear class cũ
            List<Clazz> oldClasses = clazzRepository.findByHomeroomTeacherId(existing.getId());
            for (Clazz c : oldClasses) {
                c.setHomeroomTeacher(null);
                clazzRepository.save(c);
            }

            // 🔥 2. set class mới
            Clazz clazz = clazzRepository.findById(classId)
                    .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

            clazz.setHomeroomTeacher(existing);
            clazzRepository.save(clazz);
        }

        return teacherRepository.save(existing);
    }

    public void delete(Long id) {
        teacherRepository.deleteById(id);
    }
}
