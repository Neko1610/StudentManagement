package com.schoolmanagement.repository;

import com.schoolmanagement.entity.Fund;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FundRepository extends JpaRepository<Fund, Long> {
    List<Fund> findByClazz_Id(Long classId);
}
