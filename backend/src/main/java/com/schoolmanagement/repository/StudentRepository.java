package com.schoolmanagement.repository;

import com.schoolmanagement.entity.Student;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StudentRepository extends JpaRepository<Student, Long> {

    List<Student> findByStudentClass_Id(Long classId);

    Optional<Student> findByEmail(String email);

    @Query("SELECT COUNT(s) FROM Student s")
    long countStudents();

    @Query("SELECT COUNT(s) FROM Student s WHERE s.studentClass.id = :classId")
    int countStudentsByClassId(@Param("classId") Long classId);
}