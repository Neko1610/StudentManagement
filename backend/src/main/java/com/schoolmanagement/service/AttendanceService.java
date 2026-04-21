package com.schoolmanagement.service;

import com.schoolmanagement.entity.Attendance;
import com.schoolmanagement.entity.Clazz;
import com.schoolmanagement.entity.Student;
import com.schoolmanagement.repository.AttendanceRepository;
import com.schoolmanagement.repository.ClazzRepository;
import com.schoolmanagement.repository.StudentRepository;
import com.schoolmanagement.util.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {
    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final ClazzRepository clazzRepository;

    public AttendanceService(AttendanceRepository attendanceRepository, StudentRepository studentRepository,
            ClazzRepository clazzRepository) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
        this.clazzRepository = clazzRepository;
    }

    public List<Attendance> getByClass(Long classId) {
        return attendanceRepository.findByClazz_Id(classId);
    }

    public List<Attendance> getAll() {
        return attendanceRepository.findAll();
    }

    public Attendance getById(Long id) {
        return attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found"));
    }

    public List<Attendance> getByStudentId(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return attendanceRepository.findByStudent(student);
    }

   public Attendance create(Attendance attendance, Long studentId, Long classId) {

    Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found"));

    Clazz clazz = clazzRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Class not found"));

    // 🔥 CHECK EXIST
    Optional<Attendance> existing =
            attendanceRepository.findByStudentIdAndDateAndPeriod(
                    studentId,
                    attendance.getDate(),
                    attendance.getPeriod()
            );

    if (existing.isPresent()) {
        // 👉 UPDATE
        Attendance old = existing.get();
        old.setStatus(attendance.getStatus());
        return attendanceRepository.save(old);
    }

    // 👉 CREATE NEW
    attendance.setStudent(student);
    attendance.setClazz(clazz);

    return attendanceRepository.save(attendance);
}
    public Attendance update(Long id, Attendance updated) {
        Attendance existing = getById(id);
        existing.setDate(updated.getDate());
        existing.setPeriod(updated.getPeriod());
        existing.setStatus(updated.getStatus());
        return attendanceRepository.save(existing);
    }

    public Attendance createRaw(Long studentId, Long classId, Attendance attendance) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Clazz clazz = clazzRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        attendance.setStudent(student);
        attendance.setClazz(clazz);

        return attendanceRepository.save(attendance);
    }

    public void delete(Long id) {
        attendanceRepository.deleteById(id);
    }
}
