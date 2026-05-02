package com.schoolmanagement.repository;

import com.schoolmanagement.entity.Assignment;
import com.schoolmanagement.entity.Teacher;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByClazz_Id(Long classId);
    List<Assignment> findByClazz_IdAndTeacher_Email(Long classId, String email);
    List<Assignment> findByTeacher_Email(String email);
    List<Assignment> findByClazz_IdAndSemester(Long classId, Integer semester);
}
