package com.schoolmanagement.repository;

import com.schoolmanagement.entity.Clazz;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ClazzRepository extends JpaRepository<Clazz, Long> {
    // class chủ nhiệm
    List<Clazz> findByHomeroomTeacherId(Long teacherId);

    // class dạy
    List<Clazz> findByTeachers_Id(Long teacherId);

    @Query("SELECT c FROM Clazz c LEFT JOIN FETCH c.homeroomTeacher")
    List<Clazz> findAllWithHomeroomTeacher();

}
