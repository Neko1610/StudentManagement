package com.schoolmanagement.repository;

import com.schoolmanagement.entity.Score;
import com.schoolmanagement.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ScoreRepository extends JpaRepository<Score, Long> {
    List<Score> findByStudent(Student student);
    List<Score> findByStudent_StudentClass_Id(Long classId);
}
