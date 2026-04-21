package com.schoolmanagement.repository;

import com.schoolmanagement.entity.Tuition;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TuitionRepository extends JpaRepository<Tuition, Long> {
    List<Tuition> findByStudent_Id(Long studentId);
}
