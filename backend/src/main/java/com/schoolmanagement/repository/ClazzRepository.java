package com.schoolmanagement.repository;

import com.schoolmanagement.entity.Clazz;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ClazzRepository extends JpaRepository<Clazz, Long> {
    // class chủ nhiệm
    List<Clazz> findByHomeroomTeacherId(Long teacherId);

    // class dạy
    List<Clazz> findByTeachers_Id(Long teacherId);

}
