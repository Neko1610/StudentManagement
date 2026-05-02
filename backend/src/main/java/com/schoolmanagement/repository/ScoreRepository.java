package com.schoolmanagement.repository;

import com.schoolmanagement.entity.Score;
import com.schoolmanagement.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ScoreRepository extends JpaRepository<Score, Long> {
    List<Score> findByStudent(Student student);

    List<Score> findByStudent_StudentClass_Id(Long classId);

    Optional<Score> findByStudent_IdAndSubject_Id(Long studentId, Long subjectId);

    boolean existsByStudentIdAndSubjectIdAndSemester(
            Long studentId,
            Long subjectId,
            Integer semester);

    Optional<Score> findByStudentIdAndSubjectIdAndSemester(
            Long studentId,
            Long subjectId,
            Integer semester);
}
