package com.schoolmanagement.repository;

import com.schoolmanagement.entity.ParentRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ParentRequestRepository extends JpaRepository<ParentRequest, Long> {
    List<ParentRequest> findByTeacherIdOrderByCreatedAtDesc(Long teacherId);

    List<ParentRequest> findByParentIdOrderByCreatedAtDesc(Long parentId);

    List<ParentRequest> findAllByOrderByCreatedAtDesc();
}
