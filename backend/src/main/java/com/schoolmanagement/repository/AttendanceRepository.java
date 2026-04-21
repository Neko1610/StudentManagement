package com.schoolmanagement.repository;

import com.schoolmanagement.entity.Attendance;
import com.schoolmanagement.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudent(Student student);
    List<Attendance> findByClazz_Id(Long classId);
    Optional<Attendance> findByStudentIdAndDateAndPeriod(
    Long studentId,
    LocalDate date,
    String period
);
}
