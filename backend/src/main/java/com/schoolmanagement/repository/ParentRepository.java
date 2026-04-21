package com.schoolmanagement.repository;

import com.schoolmanagement.entity.Parent;
import com.schoolmanagement.entity.Student;

import java.util.Optional;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ParentRepository extends JpaRepository<Parent, Long> {
    Optional<Parent> findByEmail(String email);

    @Query("SELECT p.students FROM Parent p WHERE p.email = :email")
    Set<Student> findStudentsByEmail(@Param("email") String email);
}
