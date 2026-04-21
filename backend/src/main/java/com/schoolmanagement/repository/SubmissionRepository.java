package com.schoolmanagement.repository;

import com.schoolmanagement.entity.Submission;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    List<Submission> findByAssignment_Id(Long assignmentId);

    List<Submission> findByStudent_Id(Long studentId);
}