package com.schoolmanagement.repository;

import com.schoolmanagement.entity.Teacher;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {
    Optional<Teacher> findByEmail(String email);
     @Query("SELECT t FROM Teacher t JOIN FETCH t.subject")
    List<Teacher> findAllWithSubject();
}
