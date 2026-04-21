package com.schoolmanagement.service;

import com.schoolmanagement.entity.Clazz;
import com.schoolmanagement.entity.Teacher;
import com.schoolmanagement.repository.ClazzRepository;
import com.schoolmanagement.repository.StudentRepository;
import com.schoolmanagement.repository.TeacherRepository;
import com.schoolmanagement.util.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ClazzService {
    private final ClazzRepository clazzRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;

    public ClazzService(ClazzRepository clazzRepository, TeacherRepository teacherRepository,
            StudentRepository studentRepository) {
        this.clazzRepository = clazzRepository;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;

    }

    public List<Clazz> getAll() {
        return clazzRepository.findAll();
    }

    public Clazz getById(Long id) {
        return clazzRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Class not found"));
    }

    public List<Clazz> getByTeacherEmail(String email) {

        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Teacher not found with email: " + email));

        Long teacherId = teacher.getId();

        // 🔹 class chủ nhiệm
        List<Clazz> homeroom = clazzRepository.findByHomeroomTeacherId(teacherId);

        // 🔹 class dạy
        List<Clazz> teaching = clazzRepository.findByTeachers_Id(teacherId);

        // 🔹 merge + chống trùng
        Map<Long, Clazz> map = new HashMap<>();

        for (Clazz c : homeroom) {
            map.put(c.getId(), c);
        }

        for (Clazz c : teaching) {
            map.put(c.getId(), c);
        }

        // 🔹 add studentCount
        for (Clazz c : map.values()) {
            int count = studentRepository.countStudentsByClassId(c.getId());
            c.setStudentCount(count);
        }

        return new ArrayList<>(map.values());
    }

    public Clazz create(Clazz clazz, Long homeroomTeacherId) {
        if (homeroomTeacherId != null) {
            Teacher teacher = teacherRepository.findById(homeroomTeacherId)
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
            clazz.setHomeroomTeacher(teacher);
        }

        // 🔥 thêm dòng này (nếu muốn validate)
        if (clazz.getGrade() == null || clazz.getGrade().isEmpty()) {
            throw new RuntimeException("Grade is required");
        }

        return clazzRepository.save(clazz);
    }

    public Clazz update(Long id, Clazz update, Long homeroomTeacherId) {
        Clazz existing = getById(id);

        existing.setName(update.getName());
        existing.setRoom(update.getRoom());

        // 🔥 thêm dòng này
        existing.setGrade(update.getGrade());

        if (homeroomTeacherId != null) {
            Teacher teacher = teacherRepository.findById(homeroomTeacherId)
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
            existing.setHomeroomTeacher(teacher);
        }

        return clazzRepository.save(existing);
    }

    public void delete(Long id) {
        clazzRepository.deleteById(id);
    }
}
